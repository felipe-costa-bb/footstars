
import { db } from '../src/infrastructure/db/scraper_schema.js';

const sql = `
    UPDATE base_players 
    SET 
        shooting = 99, 
        shoot = 96,
        overall_rating = 93
    WHERE ea_player_id = '202126'
`;

const info = db.exec(sql);
console.log('Update result:', info);

const kane = db.prepare("SELECT * FROM base_players WHERE ea_player_id = '202126'").get();
console.log('Updated Kane:', kane);
