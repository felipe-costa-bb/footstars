
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Search Results ---');
const res = db.prepare("SELECT * FROM base_players WHERE real_name LIKE '%Krepski%' OR display_name LIKE '%Krepski%' OR real_name LIKE '%Bento%'").all();
console.log(JSON.stringify(res, null, 2));
