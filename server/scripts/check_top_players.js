
import { db } from '../src/infrastructure/db/scraper_schema.js';

const players = db.prepare(`
    SELECT real_name, overall_rating, 
           shoot, shooting, 
           pass, passing, 
           tackle, defending, 
           power, physicality
    FROM base_players 
    WHERE real_name = 'Lionel Messi' OR real_name = 'Kylian Mbappé'
`).all();

console.log('Top Players Check:', JSON.stringify(players, null, 2));
