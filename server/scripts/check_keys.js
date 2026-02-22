
import { db } from '../src/infrastructure/db/scraper_schema.js';

const player = db.prepare("SELECT real_name, detailed_stats FROM base_players WHERE detailed_stats IS NOT NULL LIMIT 1").get();

if (player) {
    const stats = JSON.parse(player.detailed_stats);
    console.log(`Player: ${player.real_name}`);
    console.log('Keys:', Object.keys(stats).sort().join(', '));
    // Check specific likely candidates
    console.log('Values for potential rating keys:');
    ['rat', 'rating', 'ova', 'ovr', 'overall', 'base', 'total'].forEach(k => {
        if (stats[k] !== undefined) console.log(`${k}:`, stats[k]);
    });
}
