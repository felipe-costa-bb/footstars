
import http from 'http';

function post(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') }));
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function testApiFlow() {
    console.log('--- Testing API Flow ---');

    // 1. Login (or Register if needed)
    // We'll try to login as 'user' (assuming password 'password')
    // If that fails, we might need to adjust or skip
    // Wait, the test DB might have specific users. 
    // debug_hydration.js used 'user'.

    // Let's try to register a temporary test user to be safe
    const testUser = `test_api_${Date.now()}`;
    const testPass = 'testpass';

    console.log(`1. Registering ${testUser}...`);
    try {
        const regRes = await post('/api/register', JSON.stringify({ username: testUser, password: testPass }));
        console.log(`   Register status: ${regRes.statusCode}`);

        let token = regRes.body.token;
        if (!token) {
            console.log('   Registration failed to return token, trying login...');
            const loginRes = await post('/api/login', JSON.stringify({ username: testUser, password: testPass }));
            token = loginRes.body.token;
        }

        if (!token) {
            console.error('❌ Failed to get token');
            return;
        }
        console.log('✅ Got token');

        console.log('2. Fetching /api/my-teams...');
        const teamsRes = await get('/api/my-teams', token);
        console.log(`   Status: ${teamsRes.statusCode}`);

        if (teamsRes.statusCode === 200) {
            console.log(`✅ Success! Found ${teamsRes.body.length} teams`);
        } else {
            console.error(`❌ Failed:`, teamsRes.body);
        }

        console.log('3. Fetching /api/collection...');
        const colRes = await get('/api/collection', token);
        console.log(`   Status: ${colRes.statusCode}`);
        if (colRes.statusCode === 200) {
            console.log(`✅ Success! Found ${colRes.body.length} cards`);
        } else {
            console.error(`❌ Failed:`, colRes.body);
        }

    } catch (e) {
        console.error('Test failed:', e);
    }
}

testApiFlow();
