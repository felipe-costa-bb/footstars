
import { db } from '../src/infrastructure/db/scraper_schema.js';

const gk = db.prepare("SELECT * FROM base_players WHERE position = 'GK' LIMIT 1").get();
console.log('GK Data:', JSON.stringify(gk, null, 2));
