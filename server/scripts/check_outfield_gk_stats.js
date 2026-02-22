
import { db } from '../src/infrastructure/db/scraper_schema.js';

const player = db.prepare("SELECT real_name, detailed_stats FROM base_players WHERE position != 'GK' LIMIT 1").get();

if (player && player.detailed_stats) {
    const stats = JSON.parse(player.detailed_stats);
    console.log(`Player: ${player.real_name}`);
    console.log('GK Diving:', stats.gkDiving?.value);
    console.log('GK Handling:', stats.gkHandling?.value);
    console.log('GK Kicking:', stats.gkKicking?.value);
    console.log('GK Positioning:', stats.gkPositioning?.value);
    console.log('GK Reflexes:', stats.gkReflexes?.value);
} else {
    console.log('No detailed stats found for outfielder.');
}
