
import { cardManager } from '../src/core/cardManager.js';
import { dbRequest } from '../src/infrastructure/db/repository.js';

console.log('Testing Collection Logic...');

try {
    // 1. Get a user
    const users = dbRequest.getLeaderboard(1);
    if (!users || users.length === 0) {
        console.log('No users found.');
        process.exit(0);
    }
    const userId = users[0].id;
    console.log(`Testing with User ID: ${userId} (${users[0].username})`);

    // 2. Get Collection
    const collection = cardManager.getUserCollection(userId);
    console.log(`Found ${collection.length} cards.`);

    if (collection.length > 0) {
        const card = collection[0];
        console.log('Sample Card:', JSON.stringify(card, null, 2));

        if (card.imageUrl && card.stats) {
            console.log('✅ Card hydration successful!');
        } else {
            console.error('❌ Card missing hydrated fields!');
        }
    } else {
        console.log('User has no cards.');
    }

} catch (e) {
    console.error('❌ Error:', e);
}
