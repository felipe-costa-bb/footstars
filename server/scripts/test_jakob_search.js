
import { cardManager } from '../src/core/cardManager.js';

// Wait briefly for init if needed (though import should handle it)
setTimeout(() => {
    console.log("Searching for Jakob Toover...");
    const results = cardManager.searchPlayers({ name: 'Jakob Toover' });

    if (results.length > 0) {
        console.log("SUCCESS: Found player in search results!");
        console.log(results[0]);
    } else {
        console.log("FAILURE: Player not found in search results.");
    }
}, 1000);
