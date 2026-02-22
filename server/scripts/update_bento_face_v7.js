
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Updating Bento Face (v7 - Transparent Background) ---');
// Update Bento Xavier Costa
const info = db.prepare("UPDATE base_players SET image_url = '/assets/players/bento_face_v7.png' WHERE ea_player_id = 'custom_bento_001'").run();
console.log(`Updated ${info.changes} row(s).`);

// Double check
const bento = db.prepare("SELECT * FROM base_players WHERE ea_player_id = 'custom_bento_001'").get();
console.log('Updated Bento:', bento.display_name, 'Img:', bento.image_url);
