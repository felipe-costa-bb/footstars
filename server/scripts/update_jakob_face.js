
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Updating Jakob Toover Face (v1) ---');
// Update Jakob Toover
const info = db.prepare("UPDATE base_players SET image_url = '' WHERE ea_player_id = 'custom_jakob_001'").run();
console.log(`Updated ${info.changes} row(s).`);

// Double check
const jakob = db.prepare("SELECT * FROM base_players WHERE ea_player_id = 'custom_jakob_001'").get();
console.log('Updated Jakob:', jakob.display_name, 'Img:', jakob.image_url);
