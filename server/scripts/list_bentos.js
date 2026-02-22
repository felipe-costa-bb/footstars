
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Search Summary ---');
const res = db.prepare("SELECT id, real_name, display_name, position, overall_rating FROM base_players WHERE real_name LIKE '%Krepski%' OR display_name LIKE '%Krepski%' OR real_name LIKE '%Bento%'").all();
console.table(res);
