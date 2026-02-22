
import { db } from '../src/infrastructure/db/sqlite.js';

const stmt = db.prepare('SELECT * FROM base_players WHERE real_name = ?');
const player = stmt.get('Benjamin Unt');

if (player) {
    console.log("Found player in DB:", player);
} else {
    console.log("Player not found in DB!");
}
