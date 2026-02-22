
import { db } from '../src/infrastructure/db/scraper_schema.js';

const players = db.prepare(`
    SELECT real_name, overall_rating, 
           shoot, shooting, 
           pass, passing, 
           tackle, defending, 
           power, physicality,
           pace, dribbling
    FROM base_players 
    WHERE real_name LIKE '%Messi%' OR real_name LIKE '%Mbapp%'
`).all();

console.log('Comparison Check:', JSON.stringify(players, null, 2));
