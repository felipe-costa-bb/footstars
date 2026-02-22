
import { db } from '../src/infrastructure/db/scraper_schema.js';

const players = db.prepare(`
    SELECT real_name, position, overall_rating, 
           shoot, pass, tackle, power
    FROM base_players 
    WHERE real_name IN ('Lionel Messi', 'Kylian Mbappé', 'Erling Haaland', 'Jude Bellingham', 'Virgil van Dijk')
`).all();

console.log('Current OVR Check:', JSON.stringify(players, null, 2));
