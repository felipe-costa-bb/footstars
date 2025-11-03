// WebSocket client for Field Battle multiplayer
class FieldBattleClient {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.role = null;
    this.players = [];
    this.isReady = false;
    this.matchStarted = false;

    this.initUI();
  }

  initUI() {
    // Lobby elements
    this.createBtn = document.getElementById('create-btn');
    this.joinBtn = document.getElementById('join-btn');
    this.readyBtn = document.getElementById('ready-btn');
    this.startBtn = document.getElementById('start-btn');

    // Game elements
    this.consoleOutput = document.getElementById('console-output');
    this.nextActionBtn = document.getElementById('next-action-btn');

    // Bind events
    this.createBtn.addEventListener('click', () => this.createSession());
    this.joinBtn.addEventListener('click', () => this.joinSession());
    this.readyBtn.addEventListener('click', () => this.sendReady());
    this.startBtn.addEventListener('click', () => this.startMatch());
    this.nextActionBtn.addEventListener('click', () => this.nextAction());
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to server');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (err) {
        console.error('Invalid message from server:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this.showError('Connection lost. Please refresh the page.');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.showError('Connection error. Please check your connection.');
    };
  }

  sendMessage(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket not connected');
    }
  }

  handleMessage(message) {
    const { type, payload } = message;

    switch (type) {
      case 'session_info':
        this.updateSessionInfo(payload);
        break;
      case 'both_ready':
        this.onBothReady();
        break;
      case 'match_started':
        this.onMatchStarted(payload);
        break;
      case 'engine_event':
        this.onEngineEvent(payload);
        break;
      case 'state_snapshot':
        this.onStateSnapshot(payload);
        break;
      case 'error':
        this.showError(payload.message);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  createSession() {
    const name = document.getElementById('create-name').value.trim() || 'Player A';
    this.sendMessage('create_session', { name });
  }

  joinSession() {
    const sessionId = document.getElementById('session-id').value.trim().toUpperCase();
    const name = document.getElementById('join-name').value.trim() || 'Player B';

    if (!sessionId) {
      this.showError('Please enter a session ID');
      return;
    }

    this.sendMessage('join_session', { sessionId, name });
  }

  updateSessionInfo(payload) {
    this.sessionId = payload.sessionId;
    this.role = payload.role;
    this.players = payload.players;

    // Show session info
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('create-session').style.display = 'none';
    document.getElementById('join-session').style.display = 'none';
    document.getElementById('session-info').style.display = 'block';

    document.getElementById('current-session-id').textContent = this.sessionId;
    document.getElementById('player-role').textContent = `You are Player ${this.role}`;

    this.updatePlayersList();
  }

  updatePlayersList() {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';

    this.players.forEach(player => {
      const div = document.createElement('div');
      div.className = 'player';
      div.textContent = `${player.name} (Player ${player.role})`;
      playersList.appendChild(div);
    });
  }

  sendReady() {
    this.isReady = true;
    this.readyBtn.disabled = true;
    this.readyBtn.textContent = 'Ready!';
    this.sendMessage('client_ready');
  }

  onBothReady() {
    if (this.role === 'A') { // Only player A can start
      this.startBtn.style.display = 'inline-block';
    }
  }

  startMatch() {
    this.sendMessage('start_match', { seed: Date.now() });
  }

  onMatchStarted(payload) {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    this.addToConsole(payload.message || 'Match started!');
    this.matchStarted = true;
  }

  onEngineEvent(payload) {
    const event = payload.event;
    this.addToConsole(this.formatEvent(event), event.type.toLowerCase());
  }

  onStateSnapshot(payload) {
    // TODO: Handle state snapshot for reconnecting players
    console.log('Received state snapshot:', payload);
  }

  addToConsole(text, eventType = '') {
    const div = document.createElement('div');
    div.className = `event ${eventType}`;
    div.textContent = text;
    this.consoleOutput.appendChild(div);
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }

  formatEvent(event) {
    // Format engine events similar to console output
    switch (event.type) {
      case 'MATCH_START':
        return `=== Match Start ===\n${event.teamId} starts with ball`;
      case 'PASS':
        return `${event.playerName} passes to zone ${event.zone}`;
      case 'INTERCEPT':
        return `🔄 Possession switched to ${event.teamId}`;
      case 'SHOT':
        return `${event.playerName} shoots!`;
      case 'SAVE':
        return `🧤 ${event.defenderName} saves the shot!`;
      case 'GOAL':
        return `⚽ GOAL! ${event.playerName} scores!`;
      default:
        return `${event.type}: ${event.description || ''}`;
    }
  }

  nextAction() {
    // TODO: Implement interactive controls
    this.sendMessage('action', { type: 'next' });
  }

  showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error').style.display = 'block';
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'none';
  }
}

// Initialize client when page loads
document.addEventListener('DOMContentLoaded', () => {
  const client = new FieldBattleClient();
  client.connect();
});