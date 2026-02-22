
import { db } from '../src/infrastructure/db/scraper_schema.js';

const player = db.prepare("SELECT real_name, detailed_stats FROM base_players LIMIT 1").get();
console.log('Detailed Stats Sample:', player.detailed_stats ? 'Present' : 'Missing');
if (player.detailed_stats) {
    console.log(player.detailed_stats.substring(0, 100) + '...');
}
