import { cardManager } from '../src/core/cardManager.js';
import { dbRequest } from '../src/infrastructure/db/repository.js';
import { auth } from '../src/infrastructure/auth.js';

async function runUnitTest() {
    console.log("1. Registering Users...");
    // We can use auth.register directly
    const userA = await auth.register('UnitPlayerA_' + Date.now(), 'pass');
    const userB = await auth.register('UnitPlayerB_' + Date.now(), 'pass');

    console.log("User A ID:", userA.user.id);
    console.log("User B ID:", userB.user.id);

    // Manual Grant Starter Pack (mimicking controller)
    cardManager.grantStarterPack(userA.user.id);
    cardManager.grantStarterPack(userB.user.id);

    // Initial Cards
    const cardsA = dbRequest.getUserCards(userA.user.id);
    const cardsB = dbRequest.getUserCards(userB.user.id);
    console.log(`User A has ${cardsA.length} cards.`);
    console.log(`User B has ${cardsB.length} cards.`);

    // Mock a game result where A wins against B
    console.log("2. processing Ante (A wins against B)...");

    // We need B's team card IDs. 
    // Since we just registered, they have no team.
    // cardManager.processAnte takes `loserTeamCardIds`.
    // Let's assume B uses their first 11 cards as a "team".
    const loserTeamCardIds = cardsB.slice(0, 11).map(c => c.id);

    // Run Logic
    const anteCardId = cardManager.processAnte(userA.user.id, userB.user.id, loserTeamCardIds);

    console.log("Ante Card ID:", anteCardId);

    if (!anteCardId) {
        console.error("FAILURE: No card transferred.");
        process.exit(1);
    }

    // Verify ownership change
    const card = dbRequest.getCardById(anteCardId);
    console.log(`Card ${anteCardId} owner is now: ${card.user_id}`);

    if (card.user_id === userA.user.id) {
        console.log("SUCCESS: Card ownership transferred to User A.");

        // Record match in DB just to be sure
        dbRequest.recordMatch(userA.user.id, userB.user.id, 2, 1, anteCardId);
        console.log("Match recorded.");
        process.exit(0);
    } else {
        console.error(`FAILURE: Card owner is ${card.user_id}, expected ${userA.user.id}`);
        process.exit(1);
    }
}

runUnitTest().catch(err => {
    console.error(err);
    process.exit(1);
});
