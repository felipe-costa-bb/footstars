
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Restoring Bento Face ---');

// Check what files we have available (conceptually, but here we just set it)
// Previous known good state was /assets/players/bento_arsenal.png (Step 23)
// But update_bento_face_v9.js (Step 4) used /assets/players/bento_face_v9.png

// Let's try to set it to bento_face_v9.png as that seems to be the latest intended look
const stmt = db.prepare("UPDATE base_players SET image_url = '/assets/players/bento_face_v9.png' WHERE ea_player_id = 'custom_bento_001'");
const result = stmt.run();

console.log(`Updated Bento face: ${result.changes} changes.`);

const bento = db.prepare("SELECT real_name, image_url FROM base_players WHERE ea_player_id = 'custom_bento_001'").get();
console.log('Current Bento:', bento);
