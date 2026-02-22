
import { cardManager } from '../src/core/cardManager.js';
import { dbRequest } from '../src/infrastructure/db/repository.js';

async function verifyCardManager() {
    console.log('--- Starting Card Manager Verification ---');
    try {
        const user = dbRequest.findUserByUsername('user');
        if (!user) {
            console.error('User not found');
            return;
        }
        console.log(`Testing with user: ${user.username} (${user.id})`);

        console.log('\n1. Testing getAllUserTeams...');
        try {
            const teams = cardManager.getAllUserTeams(user.id);
            console.log(`✅ getAllUserTeams success. Found ${teams.length} teams.`);
            teams.forEach(t => {
                console.log(` - Team ${t.id}: ${t.name} (${t.players.length} players)`);
                const unknown = t.players.filter(p => p.name === 'Unknown Player');
                if (unknown.length > 0) console.log(`   ⚠️ ${unknown.length} unknown players in this team`);
            });
        } catch (e) {
            console.error('❌ getAllUserTeams FAILED:', e);
        }

        console.log('\n2. Testing getUserCollection...');
        try {
            const cards = cardManager.getUserCollection(user.id);
            console.log(`✅ getUserCollection success. Found ${cards.length} cards.`);
            const unknown = cards.filter(c => c.name === 'Unknown Player');
            if (unknown.length > 0) console.log(`   ⚠️ ${unknown.length} unknown players in collection`);
        } catch (e) {
            console.error('❌ getUserCollection FAILED:', e);
        }

    } catch (e) {
        console.error('Top level error:', e);
    }
    console.log('\n--- Verification Complete ---');
}

verifyCardManager();
