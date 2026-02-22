import { dbRequest } from '../src/infrastructure/db/repository.js';
import { cardManager, calculateBuyPrice } from '../src/core/cardManager.js';

console.log("--- Testing Player Search & Pricing ---");

// 1. Test Search
const query = "Haaland"; // Assuming Haaland is in the DB/JSON
const results = cardManager.searchPlayers(query);

console.log(`Searching for '${query}'... Found ${results.length} results.`);

if (results.length === 0) {
    console.log("No players found. Trying generic search 'a'...");
    const genericResults = cardManager.searchPlayers("a");
    if (genericResults.length > 0) {
        console.log(`Found ${genericResults.length} generic players.`);
        testPlayer(genericResults[0]);
    } else {
        console.error("CRITICAL: Search returned no results at all.");
    }
} else {
    testPlayer(results[0]);
}

function testPlayer(player) {
    console.log(`\nInspecting Player: ${player.name} (OVR: ${player.overallRating})`);

    // 2. Verify Price Calculation
    const sellPrice = calculateSellPrice(player.overallRating);
    const expectedBuyPrice = sellPrice * 5;

    console.log(`Sell Price: ${sellPrice}`);
    console.log(`Buy Price: ${player.buyPrice}`);

    if (player.buyPrice === expectedBuyPrice) {
        console.log("✅ Buy Price is correct (5x Sell Price).");
    } else {
        console.error(`❌ Buy Price mistmatch! Expected ${expectedBuyPrice}, got ${player.buyPrice}`);
    }
}

console.log("\n--- Verification Complete ---");
