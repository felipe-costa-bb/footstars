
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Updating Bento OVR to 91 ---');

const update = db.prepare("UPDATE base_players SET overall_rating = 91 WHERE ea_player_id = 'custom_bento_001'");
const result = update.run();

console.log(`Updated ${result.changes} row(s).`);

const bento = db.prepare("SELECT * FROM base_players WHERE ea_player_id = 'custom_bento_001'").get();
if (bento) {
    console.log(`Bento's new OVR: ${bento.overall_rating}`);
} else {
    console.log('Bento not found!');
}
