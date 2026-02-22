
import { cardManager } from '../src/core/cardManager.js';

const results = cardManager.searchPlayers({ name: 'Benjamin' });
console.log('Search Results for Benjamin:');
console.log(JSON.stringify(results, null, 2));

if (results.length > 0) {
    console.log('Benjamin Image URL:', results[0].imageUrl);
} else {
    console.log('Benjamin not found in cardManager cache!');
}
