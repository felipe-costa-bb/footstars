import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { useSessionStore } from './session';

export const useMatchStore = defineStore('match', () => {
    const sessionStore = useSessionStore();

    // Connection state
    const socket = ref(null);
    const isConnected = ref(false);
    const error = ref(null);

    // Game state
    const gameState = ref(null);
    const matchLogs = ref([]);
    const status = ref('IDLE'); // IDLE, WAITING, PLAYING, FINISHED

    // Actions
    const connect = () => {
        if (socket.value && socket.value.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:3000`; // Assuming port 3000 for now, should be env var

        console.log('Connecting to WebSocket:', wsUrl);
        socket.value = new WebSocket(wsUrl);

        socket.value.onopen = () => {
            console.log('WebSocket connected');
            isConnected.value = true;
            error.value = null;
        };

        socket.value.onclose = () => {
            console.log('WebSocket disconnected');
            isConnected.value = false;
            status.value = 'IDLE';
        };

        socket.value.onerror = (err) => {
            console.error('WebSocket error:', err);
            error.value = 'Connection error';
        };

        socket.value.onmessage = (event) => {
            handleMessage(JSON.parse(event.data));
        };
    };

    const disconnect = () => {
        if (socket.value) {
            socket.value.close();
            socket.value = null;
            isConnected.value = false;
        }
    };

    const sendMessage = (type, payload) => {
        if (socket.value && socket.value.readyState === WebSocket.OPEN) {
            socket.value.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('Cannot send message, socket not open');
        }
    };

    // Message Handlers
    const handleMessage = (message) => {
        const { type, payload } = message;

        switch (type) {
            case 'session_info':
                sessionStore.setSession(payload.sessionId);
                sessionStore.updatePlayers(payload.players);
                // If we are getting session info, we are likely in a lobby
                if (status.value === 'IDLE') status.value = 'WAITING';
                break;

            case 'match_started':
                status.value = 'PLAYING';
                matchLogs.value = []; // Clear logs on start
                break;

            case 'state_update':
                if (payload.state) {
                    gameState.value = payload.state;

                    // Sync logs if provided in state (though usually events come via engine_event)
                    // But state.logs contains full history, which is good for reconnection/sync
                    // unique logs integration could be handled here if needed
                }
                break;

            case 'engine_event':
                // engine_event usually contains a single event or a list of new events
                if (payload.event) {
                    matchLogs.value.unshift(payload.event); // Add to top for UI
                }
                break;

            case 'error':
                console.error('Server error:', payload.message);
                error.value = payload.message;
                break;

            default:
                console.log('Unhandled message:', type, payload);
        }
    };

    // Game Actions
    const createSession = (name, teamId) => {
        sendMessage('create_session', { name, teamId });
    };

    const joinSession = (sessionId, name, teamId) => {
        sendMessage('join_session', { sessionId, name, teamId });
    };

    const startMatch = () => {
        if (sessionStore.sessionId) {
            sendMessage('start_match', { sessionId: sessionStore.sessionId });
        }
    };

    return {
        socket,
        isConnected,
        error,
        gameState,
        matchLogs,
        status,
        connect,
        disconnect,
        createSession,
        joinSession,
        startMatch,
        sendMessage
    };
});
