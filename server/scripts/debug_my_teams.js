
import { dbRequest } from '../src/infrastructure/db/repository.js';

async function testMyTeamsFetch() {
    try {
        // Get the first user
        const user = dbRequest.findUserByUsername('user') || dbRequest.findUserByUsername('admin') || dbRequest.findUserByUsername('test');

        if (!user) {
            console.log('No user found to test with.');
            return;
        }
        console.log('Testing with user:', user.username, user.id);

        // Simulate exactly what /api/my-teams does:
        // const teams = dbRequest.getAllUserTeams(req.user.id);

        console.log('Calling dbRequest.getAllUserTeams...');
        const teams = dbRequest.getAllUserTeams(user.id);

        console.log(`Success! Found ${teams.length} teams.`);
        console.log(JSON.stringify(teams, null, 2));

    } catch (e) {
        console.error('Test failed with error (mimicking 500):', e);
    }
}

testMyTeamsFetch();
