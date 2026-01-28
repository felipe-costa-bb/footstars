
import { cardManager } from './src/core/cardManager.js';
import { aliasManager } from './src/core/aliasManager.js';

console.log('Testing Card Manager and Alias Manager');

try {
    const players = aliasManager.getAllPlayersWithAliases();
    console.log(`AliasManager found ${players.length} players`);

    if (players.length > 0) {
        console.log('Sample player:', JSON.stringify(players[0]));
    }

    // Test grant daily pack
    // Mock dbRequest if needed, but for now see if it runs
    // Note: This relies on dbRequest working.

} catch (e) {
    console.error('Error:', e);
}
