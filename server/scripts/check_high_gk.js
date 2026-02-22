
import { db } from '../src/infrastructure/db/scraper_schema.js';

const gks = db.prepare("SELECT * FROM base_players WHERE position = 'GK' AND overall_rating >= 85 LIMIT 5").all();
console.log('High Rated GKs:', JSON.stringify(gks.map(p => ({
    name: p.real_name,
    overall: p.overall_rating,
    power: p.power,
    physicality: p.physicality
})), null, 2));
