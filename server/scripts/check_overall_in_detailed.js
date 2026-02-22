
import { db } from '../src/infrastructure/db/scraper_schema.js';

const player = db.prepare("SELECT real_name, detailed_stats FROM base_players WHERE detailed_stats IS NOT NULL LIMIT 1").get();

if (player) {
    const stats = JSON.parse(player.detailed_stats);
    console.log(`Keys in detailed_stats for ${player.real_name}:`, Object.keys(stats));
    // Check for common rating keys
    console.log('Overall?', stats.overall, stats.rating, stats.ova, stats.rate);
    // Print first level values just in case
    console.log('Full Object:', JSON.stringify(stats, null, 2));
}
