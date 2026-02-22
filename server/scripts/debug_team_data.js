
import { dbRequest } from '../src/infrastructure/db/repository.js';
import { cardManager } from '../src/core/cardManager.js';

async function testTeamFetch() {
    try {
        // Get the first user (usually the main user)
        const user = dbRequest.findUserByUsername('user') || dbRequest.findUserByUsername('admin') || dbRequest.findUserByUsername('test');

        if (!user) {
            console.log('No user found to test with.');
            return;
        }
        console.log('Testing with user:', user.username, user.id);

        // Get ALL teams via dbRequest directly, as cardManager doesn't expose getAllUserTeams easily
        // (Wait, dbRequest is exported from repository.js which imports sqliteRepo)
        // Check if dbRequest has getAllUserTeams... yes it does.

        const teams = dbRequest.getAllUserTeams(user.id);

        if (teams.length === 0) {
            console.log('No teams found for user.');
            return;
        }

        console.log(`Found ${teams.length} teams.`);

        for (const [index, teamData] of teams.entries()) {
            console.log(`\n--- TEAM ${index + 1}: ${teamData.name} (ID: ${teamData.id}) ---`);
            console.log('Formation:', teamData.formation);

            // teamData from getAllUserTeams already parses JSON based on sqliteRepo implementation
            // but let's be safe
            let cardIds = teamData.card_ids;
            if (typeof cardIds === 'string') cardIds = JSON.parse(cardIds);

            console.log('Player Count:', cardIds ? cardIds.length : 0);

            if (cardIds && cardIds.length > 0) {
                if (cardIds.length > 11) {
                    console.log('✅ THIS TEAM HAS SUBSTITUTES! (' + (cardIds.length - 11) + ' subs)');
                } else {
                    console.log('❌ NO SUBSTITUTES (Count <= 11)');
                }
            } else {
                console.log('⚠️ TEAM IS EMPTY');
            }
        }

    } catch (e) {
        console.error('Test failed:', e);
    }
}

testTeamFetch();
