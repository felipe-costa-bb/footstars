
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- User Cards Check ---');
const users = db.prepare("SELECT id, username, currency FROM users").all();
console.table(users);

if (users.length > 0) {
    const userId = users[0].id; // Assuming single user or checking the first one
    const cards = db.prepare("SELECT * FROM cards WHERE user_id = ?").all(userId);
    console.log(`User ${users[0].username} (ID: ${userId}) has ${cards.length} cards.`);

    if (cards.length > 0) {
        console.log('Sample card:', cards[0]);
        // Check if player data exists for the card
        const player = db.prepare("SELECT * FROM base_players WHERE ea_player_id = ?").get(cards[0].player_id);
        console.log('Associated Player:', player ? player.display_name : 'NOT FOUND');
    }
} else {
    console.log('No users found.');
}
