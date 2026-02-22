
import { db } from '../src/infrastructure/db/scraper_schema.js';

const player = db.prepare("SELECT * FROM base_players WHERE real_name LIKE '%Haaland%'").get();
console.log('Haaland:', JSON.stringify(player, null, 2));
