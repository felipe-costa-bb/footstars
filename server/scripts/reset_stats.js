
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('Resetting all player attributes to 0...');

const info = db.exec(`
    UPDATE base_players 
    SET 
        -- Game Stats
        shoot = 0,
        pass = 0,
        tackle = 0,
        power = 0,
        
        -- Base EA Stats
        pace = 0,
        shooting = 0,
        passing = 0,
        dribbling = 0,
        defending = 0,
        physicality = 0,

        -- Meta
        overall_rating = 0
`);

console.log(`Reset complete. Changes: ${db.prepare("SELECT changes()").get()['changes()']}`);

// Verify a sample
const sample = db.prepare("SELECT real_name, shoot, pass, tackle, power FROM base_players LIMIT 5").all();
console.log('Sample after reset:', JSON.stringify(sample, null, 2));
