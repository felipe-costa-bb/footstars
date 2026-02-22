
import { cardManager } from '../src/core/cardManager.js';

setTimeout(() => {
    console.log("Searching for Benjamin Unt...");
    const results = cardManager.searchPlayers({ name: 'Benjamin Unt' });

    if (results.length > 0) {
        console.log("SUCCESS: Found player in search results!");
        console.log(results[0]);
    } else {
        console.log("FAILURE: Player not found in search results.");
    }
}, 1000);
