
import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../src/data/footstars.db');
const db = new BetterSqlite3(dbPath);

const PLAYER_EA_ID = '999002'; // Benjamin Unt

// Get all users
const users = db.prepare('SELECT id FROM users').all();

console.log(`Found ${users.length} users. Granting Benjamin Unt (ID: ${PLAYER_EA_ID}) to all...`);

const insertCard = db.prepare(`
    INSERT INTO cards (user_id, player_id, gained_at)
    VALUES (?, ?, ?)
`);

users.forEach(user => {
    try {
        // Check if user already has it to avoid duplicates if desired, 
        // but typically cards can be duplicates. 
        // For a special grant, we'll just insert one.
        insertCard.run(user.id, PLAYER_EA_ID, new Date().toISOString());
        console.log(`Granted to user ${user.id}`);
    } catch (e) {
        console.error(`Failed for user ${user.id}:`, e.message);
    }
});

console.log('Grant complete!');
db.close();
