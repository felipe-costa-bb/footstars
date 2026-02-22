
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Checking for multi-positions ---');
const multi = db.prepare("SELECT position FROM base_players WHERE position LIKE '%,%' LIMIT 5").all();
if (multi.length > 0) {
    console.log('Multi-positions found:', multi);
} else {
    console.log('No multi-positions found.');
}
