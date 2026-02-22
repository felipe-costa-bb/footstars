
import { db } from '../src/infrastructure/db/scraper_schema.js';

const player = db.prepare("SELECT * FROM base_players WHERE real_name LIKE '%Bellingham%'").all();
console.log('Bellingham:', JSON.stringify(player, null, 2));
