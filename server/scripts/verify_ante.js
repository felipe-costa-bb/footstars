import WebSocket from 'ws';
import { dbRequest } from '../src/infrastructure/db/repository.js';
import { auth } from '../src/infrastructure/auth.js';
import { cardManager } from '../src/core/cardManager.js';

// Configuration
const PORT = 3000;
const WS_URL = `ws://localhost:${PORT}`;

// Cleanup unused functions for clarity



import http from 'http';

function post(path, body) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function fullFlow() {
    console.log('=== STARTING ANTE VERIFICATION ===');
    const regA = await post('/api/register', { username: `AnteTestA_${Date.now()}`, password: 'password123' });
    const regB = await post('/api/register', { username: `AnteTestB_${Date.now()}`, password: 'password123' });

    const cardsA = dbRequest.getUserCards(regA.user.id);
    const cardsB = dbRequest.getUserCards(regB.user.id);

    const teamCardsA = cardsA.slice(0, 11).map(c => c.id);
    const teamCardsB = cardsB.slice(0, 11).map(c => c.id);

    dbRequest.createOrUpdateTeam(regA.user.id, 'Team A', teamCardsA);
    dbRequest.createOrUpdateTeam(regB.user.id, 'Team B', teamCardsB);

    const wsA = new WebSocket(WS_URL);
    const wsB = new WebSocket(WS_URL);

    let sessionId = null;

    wsA.on('open', () => {
        wsA.send(JSON.stringify({
            type: 'create_session',
            payload: { name: 'Player A', teamId: 'fc_lightning', token: regA.token } // Use real team ID from file for engine compat
        }));
    });

    let hasJoined = false;
    wsA.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'session_info' && msg.payload.role === 'A') {
            // Only join if B hasn't joined yet
            if (!hasJoined && msg.payload.players.length === 1) {
                hasJoined = true;
                sessionId = msg.payload.sessionId;
                console.log('Session Created:', sessionId);

                // Connected B
                if (wsB.readyState === WebSocket.OPEN) {
                    wsB.send(JSON.stringify({
                        type: 'join_session',
                        payload: { sessionId, name: 'Player B', teamId: 'real_titans', token: regB.token }
                    }));
                } else {
                    wsB.on('open', () => {
                        wsB.send(JSON.stringify({
                            type: 'join_session',
                            payload: { sessionId, name: 'Player B', teamId: 'real_titans', token: regB.token }
                        }));
                    });
                }
            }
        }

        if (msg.type === 'engine_event' && msg.payload.event.type === 'MATCH_END') {
            console.log('Match Ended reported to A');
            console.log('Winner:', msg.payload.event.description.includes(regA.user.username) ? 'A' : 'B');
            // Wait for server to process ante logic
            console.log('Waiting 1s for ante processing...');
            setTimeout(async () => {
                const finalCardsA = await dbRequest.getUserCards(regA.user.id); // Assuming dbRequest is async? It is better-sqlite3 sync in current impl but good to await if needed or just run
                // implementation of dbRequest uses synchronous better-sqlite3?
                // db/repository.js imports sqlite.js.
                // sqlite.js uses better-sqlite3. All sync.
                // But let's wrap in timeout.

                // Re-fetch cards
                const finalA = dbRequest.getUserCards(regA.user.id);
                // cardsA was captured earlier? Yes in variable 'cardsA' (not shown in view but assumed present in scope)

                console.log(`Cards A: ${cardsA.length} -> ${finalA.length}`);

                if (finalA.length !== cardsA.length) {
                    console.log('SUCCESS: Card count changed!');
                } else {
                    console.log('FAILURE: Card count unchanged (Check server logs)');
                }
                process.exit(0);
            }, 1000);
        }
    });


    let hasReady = false;
    wsB.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'session_info' && msg.payload.role === 'B') {
            if (!hasReady) {
                console.log('Player B Joined - Sending Ready');
                hasReady = true;
                wsB.send(JSON.stringify({ type: 'client_ready' }));
                wsA.send(JSON.stringify({ type: 'client_ready' }));
            }
        }

        if (msg.type === 'both_ready') {
            console.log('Starting Match...');
            wsA.send(JSON.stringify({ type: 'start_match', payload: { seed: 12345 } }));
        }
    });
}



setTimeout(() => {
    console.error('TIMEOUT: Verification took too long.');
    process.exit(1);
}, 120000);


fullFlow();
