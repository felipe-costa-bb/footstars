
import { cardManager } from '../src/core/cardManager.js';

console.log('--- Verifying Card Manager State ---');

const players = ['Bento', 'Jakob', 'Benjamin'];

players.forEach(name => {
    const results = cardManager.searchPlayers({ name });
    if (results.length > 0) {
        // Filter for specific IDs to be sure
        const p = results.find(r =>
            r.id === 'custom_bento_001' ||
            r.id === '999001' ||
            r.id === '999002'
        ) || results[0];

        console.log(`Player: ${p.name}, Image: ${p.imageUrl}`);
    } else {
        console.log(`Player ${name} not found in CardManager.`);
    }
});
