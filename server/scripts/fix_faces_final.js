
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Fixing Player Faces (Bento & Jakob) ---');

// 1. Fix Bento (ea_player_id is custom_bento_001)
// We set to v23 because that's the one we copied v20 to
const bentoInfo = db.prepare("UPDATE base_players SET image_url = '/assets/players/bento_face_v23.png' WHERE ea_player_id = 'custom_bento_001'").run();
console.log(`Bento update: ${bentoInfo.changes} row(s)`);

// 2. Fix Jakob (ea_player_id is 999001)
const jakobInfo = db.prepare("UPDATE base_players SET image_url = '/assets/players/jakob_face_v2.png' WHERE ea_player_id = 999001").run();
console.log(`Jakob update: ${jakobInfo.changes} row(s)`);

// Verify
const bento = db.prepare("SELECT real_name, image_url FROM base_players WHERE ea_player_id = 'custom_bento_001'").get();
const jakob = db.prepare("SELECT real_name, image_url FROM base_players WHERE ea_player_id = 999001").get();

console.log('Bento Status:', bento?.real_name, bento?.image_url);
console.log('Jakob Status:', jakob?.real_name, jakob?.image_url);
