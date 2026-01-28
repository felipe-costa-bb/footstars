import WebSocket from 'ws';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

async function registerUser(username, password) {
    const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return await res.json();
}

function createClient(token) {
    return new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);
        ws.on('open', () => resolve(ws));
    });
}

async function runTest() {
    console.log("1. Registering Users...");
    const userA = await registerUser('AntePlayerA_' + Date.now(), 'pass123');
    const userB = await registerUser('AntePlayerB_' + Date.now(), 'pass123');

    console.log("User A:", userA.user.username, "ID:", userA.user.id);
    console.log("User B:", userB.user.username, "ID:", userB.user.id);

    console.log("2. connecting WebSockets...");
    const wsA = await createClient();
    const wsB = await createClient();

    // Listeners
    wsA.on('message', (data) => handleMessage('A', data));
    wsB.on('message', (data) => handleMessage('B', data));

    let sessionId = null;

    function handleMessage(role, data) {
        const msg = JSON.parse(data.toString());
        // console.log(`[${role}] Received:`, msg.type);

        if (msg.type === 'session_info') {
            if (role === 'A' && !sessionId) {
                sessionId = msg.payload.sessionId;
                console.log("Session Created:", sessionId);

                // Now B joins
                console.log("3. User B Joining Session...");
                wsB.send(JSON.stringify({
                    type: 'join_session',
                    payload: {
                        sessionId,
                        name: userB.user.username,
                        teamId: 'real_titans',
                        token: userB.token
                    }
                }));
            }
        }

        if (msg.type === 'both_ready') {
            console.log("Both Ready! Starting Match...");
            wsA.send(JSON.stringify({
                type: 'start_match',
                payload: { sessionId, seed: 12345 } // Fixed seed for predictability?
            }));
        }

        if (msg.type === 'engine_event') {
            // console.log(`[${role}] Event:`, msg.payload.event.type);
            if (msg.payload.event.type === 'MATCH_END') {
                console.log(`[${role}] Match Ended!`);
                console.log("Summary:", msg.payload.event.description);
                console.log("Ante Card ID:", msg.payload.event.anteCardId);

                if (msg.payload.event.anteCardId) {
                    console.log("SUCCESS: Ante Card Transferred!");
                    process.exit(0);
                } else {
                    console.error("FAILURE: No Ante Card Transferred (Draw? Or logic fail?)");
                    process.exit(1);
                }
            }
        }
    }

    // A creates session
    console.log("3. User A Creating Session...");
    wsA.send(JSON.stringify({
        type: 'create_session',
        payload: {
            name: userA.user.username,
            teamId: 'fc_lightning',
            token: userA.token // Authenticated
        }
    }));

    // Ready up loop (after join)
    setTimeout(() => {
        console.log("4. Sending Ready...");
        wsA.send(JSON.stringify({ type: 'client_ready', payload: {} }));
        wsB.send(JSON.stringify({ type: 'client_ready', payload: {} }));
    }, 2000); // Give time for B to join

}

runTest().catch(console.error);
