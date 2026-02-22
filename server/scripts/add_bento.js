
import { db, upsertPlayer } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Adding Bento Xavier Costa ---');

// Define player data
const playerData = {
    ea_player_id: 'custom_bento_001', // Custom ID to avoid conflicts
    real_name: 'Bento Xavier Costa',
    display_name: 'Bento Costa',
    position: 'GK',
    overall_rating: 91,
    // EA Base Stats (Approximate based on user request)
    // EA Base Stats (Approximate based on user request)
    shooting: 84,
    passing: 81,
    dribbling: 85, // Reasonable assumption
    defending: 82,

    // Game Derived Stats (Explicitly requested)
    // Note: The upsertPlayer function calls deriveGameAttributes, 
    // but the DB schema has columns for them, so upsertPlayer will use them.
    // Wait, upsertPlayer calculates them from EA stats. 
    // Let's look at upsertPlayer again.
    // It takes playerData, calculates gameAttrs, and inserts.
    // It overrides power, shoot, tackle, pass with calculated values.
    // calculateGameAttributes uses:
    // power = if GK (detailed stats or OVR), else 15
    // shoot = shooting
    // tackle = defending
    // pass = passing

    // START_ADJUSTMENT
    // The user wants SPECIFIC game stats:
    // POW: 88, PAS: 81, TAC: 82, SHO: 84
    // PASSING, SHOOTING, DEFENDING seem to map 1:1.
    // POWER for a non-GK is usually low in this system (step 11: line 123 "power = 15").
    // To get POWER 88, we might need to modify the record AFTER insertion
    // OR create a direct SQL insert instead of using the helper if the helper enforces logic we don't want.

    nationality: 'Brazil',
    team_name: 'Arsenal',
    image_url: '/assets/players/bento_face_v9.png', // Restored Face
    player_url: '',
    detailed_stats: {}
};

// 1. Insert/Update using the helper to get the base record
try {
    const result = upsertPlayer(playerData);
    console.log(`Initial insert/update result: ${result.changes}`);
} catch (e) {
    console.error("Error inserting player:", e);
}

// 2. FORCE update the specific stats to match user request exactly
// especially POWER which is calculated differently for non-GKs
const forceUpdate = db.prepare(`
    UPDATE base_players 
    SET 
        shoot = ?,
        pass = ?,
        tackle = ?,
        power = ?,
        overall_rating = ?,
        nationality = ?
    WHERE ea_player_id = ?
`);

const info = forceUpdate.run(
    84, // SHO
    81, // PAS
    82, // TAC
    91, // POW (The user requested 91, usually non-GKs have 15)
    91, // OVR
    'Brazil',
    'custom_bento_001'
);

console.log(`Force update result: ${info.changes} changes made.`);

// 3. Verify
const player = db.prepare("SELECT * FROM base_players WHERE ea_player_id = ?").get('custom_bento_001');
console.log('--- Verification ---');
console.log(`Name: ${player.real_name}`);
console.log(`OVR: ${player.overall_rating}`);
console.log(`Position: ${player.position}`);
console.log(`Team: ${player.team_name}`);
console.log(`Nation: ${player.nationality}`);
console.log(`SHO: ${player.shoot} (Target: 84)`);
console.log(`PAS: ${player.pass} (Target: 81)`);
console.log(`TAC: ${player.tackle} (Target: 82)`);
console.log(`POW: ${player.power} (Target: 88)`);
