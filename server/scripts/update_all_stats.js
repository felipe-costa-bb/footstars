
import { db } from '../src/infrastructure/db/scraper_schema.js';

const players = db.prepare("SELECT * FROM base_players").all();
console.log(`Updating ${players.length} players...`);

const updateStmt = db.prepare(`
    UPDATE base_players 
    SET 
        shoot = ?,
        pass = ?,
        tackle = ?,
        power = ?
    WHERE id = ?
`);

const updates = db.transaction((list) => {
    let count = 0;
    for (const p of list) {
        let newShoot = p.shooting;
        let newPass = p.passing;
        let newTackle = p.defending;
        let newPower = p.physicality;

        // GK Handling
        if (p.position === 'GK') {
            newPower = p.overall_rating;
        }

        // Null checks
        if (!newShoot) newShoot = 50;
        if (!newPass) newPass = 50;
        if (!newTackle) newTackle = 50;
        if (!newPower) newPower = 50;

        updateStmt.run(newShoot, newPass, newTackle, newPower, p.id);
        count++;
    }
    console.log(`Processed ${count} records.`);
});

try {
    updates(players);
    console.log('Update complete.');
} catch (e) {
    console.error('Update failed:', e);
}
