
import { db } from '../src/infrastructure/db/sqlite.js';

const stmt = db.prepare('SELECT * FROM base_players WHERE real_name = ?');
const player = stmt.get('Jakob Toover');

if (player) {
    console.log("Found player:", player);
} else {
    console.log("Player not found!");
}
