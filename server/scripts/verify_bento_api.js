
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

async function verifyBento() {
    console.log('--- Verifying Bento OVR via API ---');

    // 1. Login/Register
    const testUser = `verifier_${Date.now()}`;
    const testPass = 'pass';

    // console.log(`Registering ${testUser}...`);
    let token;
    try {
        const regRes = await post('/api/register', JSON.stringify({ username: testUser, password: testPass }));
        token = regRes.body.token;
    } catch (e) {
        console.error("Registration failed", e);
        return;
    }

    if (!token) {
        console.error('Failed to get token');
        return;
    }

    // 2. Search for Bento
    // console.log('Searching for Bento...');
    const searchRes = await get('/api/players/search?q=Bento%20Costa', token);

    if (searchRes.statusCode === 200) {
        const results = searchRes.body;
        const bento = results.find(p => p.name.includes('Bento')); // Flexible match

        if (bento) {
            console.log(`Found Bento via API!`);
            console.log(`Name: ${bento.name}`);
            console.log(`OVR: ${bento.overallRating}`);

            if (bento.overallRating === 91) {
                console.log('✅ SUCCESS: OVR is 91');
            } else {
                console.error(`❌ FAILURE: OVR is ${bento.overallRating}`);
            }
        } else {
            console.error('❌ Bento not found in search results');
            console.log('Results:', results);
        }
    } else {
        console.error(`❌ Search failed:`, searchRes.body);
    }
}

verifyBento();
