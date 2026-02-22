
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Searching for "Bento" ---');
const bentos = db.prepare("SELECT * FROM base_players WHERE real_name LIKE '%Bento%' OR display_name LIKE '%Bento%'").all();
console.table(bentos);

console.log('--- Searching for "Krepski" ---');
const krepskis = db.prepare("SELECT * FROM base_players WHERE real_name LIKE '%Krepski%' OR display_name LIKE '%Krepski%'").all();
console.table(krepskis);
