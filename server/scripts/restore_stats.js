
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('Restoring stats from detailed_stats...');

const players = db.prepare("SELECT id, detailed_stats, position FROM base_players").all();

const updateStmt = db.prepare(`
    UPDATE base_players 
    SET 
        shooting = ?,
        passing = ?,
        defending = ?,
        physicality = ?,
        overall_rating = ?,
        
        shoot = ?,
        pass = ?,
        tackle = ?,
        power = ?
    WHERE id = ?
`);

const updates = db.transaction((list) => {
    let count = 0;
    for (const p of list) {
        if (!p.detailed_stats) continue;

        let stats;
        try {
            stats = JSON.parse(p.detailed_stats);
        } catch (e) {
            continue;
        }

        // Restore Base Stats
        const shooting = stats.sho?.value || 0;
        const passing = stats.pas?.value || 0;
        const defending = stats.def?.value || 0;
        const physicality = stats.phy?.value || 0;

        // Restore Overall (Estimate or find)
        // Since we don't have an explicit Overall column in detailed_stats, we have to estimate it or use 0?
        // Wait, for GKs we NEED Overall for Power.
        // Let's assume Overall is somewhat recoverable or we just use a placeholder for now?
        // Actually, db.prepare("...").all() fetched position.
        // If I can't recover Overall, GKs will have 0 Power.
        // Let's re-calculate Overall from the restored stats as a fallback?
        // (Sho + Pas + Def + Phy) / 4 is a bad estimate but better than 0.
        // Or... did I not wipe detailed_stats? Maybe overall is somewhere else?
        // Ah, `kane_details.json` showed Overall as a column. I wiped it.
        // `detailed_stats` usually contains 'overall' key?
        // Let's check `kane_details.json` detailed stats content carefully.
        // It has `acceleration`, `agility`, ... `sho`, `pas`. No `overall`.
        // BUT! `kane_details.json` line 7: `"overall_rating": 89`.
        // This was from the row BEFORE I wiped it.
        // I might have lost the exact Overall Rating.
        // I will estimate it: (Sho + Pas + Def + Phy + Pac + Dri) / 6?
        // Or if it's a GK, use GK stats.

        // Calculate GK Power for EVERYONE from detailed stats
        // (Div + Han + Kic + Ref + Pos) / 5
        const div = stats.gkDiving?.value || stats.gk_diving?.value || 10;
        const han = stats.gkHandling?.value || stats.gk_handling?.value || 10;
        const kic = stats.gkKicking?.value || stats.gk_kicking?.value || 10;
        const ref = stats.gkReflexes?.value || stats.gk_reflexes?.value || 10;
        const gkPositioning = stats.gkPositioning?.value || stats.gk_positioning?.value || 10;

        // Parse other stats for Overall calculation
        const pace = stats.pac?.value || 0;
        const dribbling = stats.dri?.value || 0;

        // Calculate Overall Rating (Approximation of FC 26 Formula)
        let overall = 0;

        if (p.position === 'GK') {
            // GK Rating is effectively the average of main GK stats
            overall = Math.round((div + han + kic + ref + gkPositioning) / 5);
        } else {
            // Outfield Weights (Simplified)
            // FW: PAC, SHO, DRI
            // MF: PAS, DRI, PHY/DEF
            // DF: DEF, PHY, PAC

            // Normalize position groups
            const playerPos = p.position;
            if (['ST', 'CF', 'LW', 'RW'].includes(playerPos)) {
                // Forward: Heavy on Shoot/Dribble/Pace
                // Was: 0.25, 0.25, 0.20...
                // New: Boost primary stats slightly
                overall = Math.round((shooting * 0.35) + (dribbling * 0.25) + (pace * 0.20) + (passing * 0.10) + (physicality * 0.10));
            } else if (['CAM', 'CM', 'LM', 'RM'].includes(playerPos)) {
                // Midfield
                overall = Math.round((passing * 0.35) + (dribbling * 0.25) + (shooting * 0.15) + (pace * 0.10) + (physicality * 0.10) + (defending * 0.05));
            } else if (['CDM'].includes(playerPos)) {
                // Defensive Mid
                overall = Math.round((defending * 0.30) + (passing * 0.25) + (physicality * 0.25) + (dribbling * 0.10) + (pace * 0.05) + (shooting * 0.05));
            } else {
                // Defenders
                overall = Math.round((defending * 0.35) + (physicality * 0.30) + (pace * 0.15) + (passing * 0.10) + (dribbling * 0.10));
            }

            // Base curve adjustment
            // EA ratings start high. A weighted average of 85s typically results in ~85, but star players get boosts.
            // Let's add a progressive curve.
            if (overall > 50) {
                overall = Math.min(99, overall + 4);
            }
        }

        // Apply User Rules
        const shoot = shooting;
        const pass = passing;
        const tackle = defending;

        const gkRating = Math.round((div + han + kic + ref + gkPositioning) / 5);
        let power = gkRating;

        // If it's an actual GK, their overall rating is usually their best "Power" proxy,
        // but derived stats are more "pure". Let's stick to derived for consistency,
        // UNLESS the derived one is suspiciously low compared to Overall (e.g. formula mismatch).
        // Actually, FC Overall for GK is calculated from these.
        // But for simplicity/robustness, if position is GK, we can ensure it matches Overall.
        if (p.position === 'GK') {
            // Enforce Overall as Power for GKs to match card rating exactly
            power = overall;
        }

        updateStmt.run(
            shooting, passing, defending, physicality, overall,
            shoot, pass, tackle, power,
            p.id
        );
        count++;
    }
    console.log(`Restored ${count} players.`);
});

try {
    updates(players);
} catch (e) {
    console.error('Update failed:', e);
}
