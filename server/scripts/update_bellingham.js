
import { db } from '../src/infrastructure/db/scraper_schema.js';

// Find Jude
const jude = db.prepare("SELECT * FROM base_players WHERE real_name = 'Jude Bellingham'").get();

if (jude) {
    console.log('Old Jude:', JSON.stringify({
        shoot: jude.shoot,
        pass: jude.pass,
        tackle: jude.tackle,
        power: jude.power
    }));

    const update = db.prepare(`
        UPDATE base_players 
        SET 
            shooting = 86, shoot = 86,
            passing = 83, pass = 83,
            defending = 78, tackle = 78,
            physicality = 85, power = 85
        WHERE id = ?
    `);

    update.run(jude.id);

    const newJude = db.prepare("SELECT * FROM base_players WHERE id = ?").get(jude.id);
    console.log('New Jude:', JSON.stringify({
        shoot: newJude.shoot,
        pass: newJude.pass,
        tackle: newJude.tackle,
        power: newJude.power
    }));
} else {
    console.log('Jude Bellingham not found!');
}
