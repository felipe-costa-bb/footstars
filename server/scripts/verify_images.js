
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Verifying Player Images ---');

const ids = ['custom_bento_001', '999001', '999002'];

ids.forEach(id => {
    const player = db.prepare("SELECT display_name, team_name, image_url FROM base_players WHERE ea_player_id = ?").get(id);
    if (player) {
        console.log(`Player: ${player.display_name}, Team: ${player.team_name}, Image: ${player.image_url}`);
    } else {
        console.log(`Player with ID ${id} not found.`);
    }
});
