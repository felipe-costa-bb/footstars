
import { db, upsertPlayer } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Creating Inácio Costa ---');

const playerData = {
    ea_player_id: 'custom_inacio_001',
    real_name: 'Inácio Costa',
    display_name: 'Inácio Costa',
    position: 'CM',
    overall_rating: 91, // User requested OVR: 91

    // Attributes
    shooting: 91,
    passing: 93,
    defending: 85, // TAC: 85 -> Defending column/Tackle attr

    // Metadata
    nationality: 'Brazil',
    team_name: 'Liverpool',
    image_url: '', // No image specified
    detailed_stats: {}
};

// 1. Insert/Update using helper
try {
    const result = upsertPlayer(playerData);
    console.log(`Initial insert/update result: ${result.changes}`);
} catch (e) {
    console.error("Error inserting player:", e);
}

// 2. Force update for specific game attributes that might be overridden or calculated differently
// Especially POW: 9 (Low power requested)
// Note: upsertPlayer calls deriveGameAttributes. 
// For CM: 
// Power = 15 (default)
// Shoot = Shooting (91)
// Pass = Passing (93)
// Tackle = Defending (85)

// We need to force Power to 9 explicitly if the default is 15.
const forceUpdate = db.prepare(`
    UPDATE base_players 
    SET 
        power = ?,
        shoot = ?,
        pass = ?,
        tackle = ?,
        overall_rating = ?
    WHERE ea_player_id = ?
`);

const info = forceUpdate.run(
    9,   // POW (User requested 9)
    91,  // SHO
    93,  // PAS
    85,  // TAC
    91,  // OVR
    'custom_inacio_001'
);

console.log(`Force update result: ${info.changes} changes made.`);

// 3. Verify
const player = db.prepare("SELECT * FROM base_players WHERE ea_player_id = ?").get('custom_inacio_001');
console.log('--- Verification ---');
console.log(`Name: ${player.real_name}`);
console.log(`OVR: ${player.overall_rating} (Target: 91)`);
console.log(`Position: ${player.position}`);
console.log(`Team: ${player.team_name}`);
console.log(`Nation: ${player.nationality}`);
console.log(`SHO: ${player.shoot} (Target: 91)`);
console.log(`PAS: ${player.pass} (Target: 93)`);
console.log(`TAC: ${player.tackle} (Target: 85)`);
console.log(`POW: ${player.power} (Target: 9)`);
