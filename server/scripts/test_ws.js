
import WebSocket from 'ws';

function testConnection() {
    console.log('Testing WebSocket connection to ws://localhost:3000...');

    // Note: Node environment might need 'ws' package, which should be in server dependencies
    const ws = new WebSocket('ws://localhost:3000');

    ws.on('open', () => {
        console.log('✅ Connected successfully!');

        ws.send(JSON.stringify({
            type: 'rejoin_session',
            payload: {
                sessionId: 'non-existent-session-id',
                token: 'some-fake-token'
            }
        }));

        // Close after a bit
        setTimeout(() => {
            console.log('Closing connection...');
            ws.close();
        }, 1000);
    });

    ws.on('message', (data) => {
        console.log('📩 Received:', data.toString());
    });

    ws.on('error', (err) => {
        console.error('❌ Connection failed:', err.message);
    });

    ws.on('close', (code, reason) => {
        console.log(`Connection closed: ${code} ${reason}`);
    });
}

testConnection();
