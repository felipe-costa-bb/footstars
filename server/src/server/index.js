import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { SessionManager } from './sessionManager.js';
import { GameEngine } from '../core/engine.js';
import { RNG } from '../rules/rng.js';
import { Zones } from '../core/zones.js';

import { auth } from '../infrastructure/auth.js';
import { cardManager } from '../core/cardManager.js';
import { dbRequest } from '../infrastructure/db/repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper for JSON body parsing
function handleJsonBody(req, res, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch (e) {
      res.writeHead(400).end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}

// Simple HTTP server for static files and API
const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  const { url } = req;

  // Auth Routes
  if (url === '/api/register' && req.method === 'POST') {
    handleJsonBody(req, res, async (body) => {
      try {
        const result = await auth.register(body.username, body.password);
        // Grant starter pack
        cardManager.grantStarterPack(result.user.id);
        res.writeHead(200).end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400).end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (url === '/api/login' && req.method === 'POST') {
    handleJsonBody(req, res, async (body) => {
      try {
        const result = await auth.login(body.username, body.password);
        // Check daily reward
        const lastLogin = new Date(result.user.last_daily_login);
        const today = new Date();
        if (lastLogin.getDate() !== today.getDate()) {
          const newCards = cardManager.grantDailyPack(result.user.id);
          result.daily_reward = newCards;
        }
        res.writeHead(200).end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400).end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Coins Route (Protected)
  if (url === '/api/coins' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const coins = dbRequest.getUserCoins(req.user.id);
      res.writeHead(200).end(JSON.stringify({ coins }));
    });
    return;
  }

  // Buy Pack Route (Protected)
  if (url === '/api/buy-pack' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const result = cardManager.buyPack(req.user.id, body.packType);
        if (result.success) {
          res.writeHead(200).end(JSON.stringify(result));
        } else {
          res.writeHead(400).end(JSON.stringify({ error: result.error }));
        }
      });
    });
    return;
  }

  // Collection Routes (Protected)
  if (url === '/api/collection' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const cards = cardManager.getUserCollection(req.user.id);
      res.writeHead(200).end(JSON.stringify(cards));
    });
    return;
  }
  // Create a new team (POST /api/teams)
  if (url === '/api/teams' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const team = dbRequest.createTeam(req.user.id, body.name, body.cardIds);
        res.writeHead(201).end(JSON.stringify(team));
      });
    });
    return;
  }

  // Get all user's teams (GET /api/my-teams)
  if (url === '/api/my-teams' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const teams = dbRequest.getAllUserTeams(req.user.id);
      res.writeHead(200).end(JSON.stringify(teams));
    });
    return;
  }

  // Get single team (legacy - for dashboard)
  if (url === '/api/my-team' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const team = cardManager.getUserTeam(req.user.id);
      if (team) {
        res.writeHead(200).end(JSON.stringify(team));
      } else {
        res.writeHead(404).end(JSON.stringify({ error: "No team found" }));
      }
    });
    return;
  }

  // Delete a team (DELETE /api/teams/:id)
  if (url.startsWith('/api/teams/') && req.method === 'DELETE') {
    auth.authenticate(req, res, () => {
      const teamId = parseInt(url.split('/').pop());
      if (isNaN(teamId)) {
        res.writeHead(400).end(JSON.stringify({ error: 'Invalid team ID' }));
        return;
      }
      const deleted = dbRequest.deleteTeam(teamId, req.user.id);
      if (deleted) {
        res.writeHead(200).end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(404).end(JSON.stringify({ error: 'Team not found or unauthorized' }));
      }
    });
    return;
  }

  // Get a specific team by ID with hydrated players (GET /api/teams/:id)
  if (url.startsWith('/api/teams/') && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const teamId = parseInt(url.split('/').pop());
      if (isNaN(teamId)) {
        res.writeHead(400).end(JSON.stringify({ error: 'Invalid team ID' }));
        return;
      }
      // Use cardManager for full player hydration
      const team = cardManager.getTeamById(teamId);
      if (team) {
        res.writeHead(200).end(JSON.stringify(team));
      } else {
        res.writeHead(404).end(JSON.stringify({ error: 'Team not found' }));
      }
    });
    return;
  }

  // Match History (authenticated)
  if (url === '/api/match-history' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const history = dbRequest.getMatchHistory(req.user.id);
      res.writeHead(200).end(JSON.stringify(history));
    });
    return;
  }

  // Leaderboard (public)
  if (url === '/api/leaderboard' && req.method === 'GET') {
    const leaderboard = dbRequest.getLeaderboard();
    res.writeHead(200).end(JSON.stringify(leaderboard));
    return;
  }

  // Get available opponent teams (for matchmaking - public teams data)
  if (req.url === '/api/teams' && req.method === 'GET') {
    try {
      const teams = loadTeamsList();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(teams));
      console.log('Teams loaded successfully');
    } catch (err) {
      console.error('Error loading teams:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to load teams', details: err.message }));
    }
    return;
  }

  // Static files (fallback for old public/)
  try {
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = join(__dirname, '..', '..', 'public', filePath);

    const content = await readFile(fullPath);
    const ext = filePath.split('.').pop();

    const mimeTypes = {
      html: 'text/html',
      js: 'application/javascript',
      css: 'text/css'
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end('File not found');
  }
});

// WebSocket server
const wss = new WebSocketServer({ server });

// Session management
const sessionManager = new SessionManager();

/**
 * Load team data from JSON file
 */
function loadTeam(teamPath) {
  const fullPath = join(__dirname, '..', '..', teamPath);
  console.log('Loading team from:', fullPath);
  const data = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Load and format list of available teams
 */
function loadTeamsList() {
  const fc_lightning = loadTeam('src/data/fc_lightning.json');
  const real_titans = loadTeam('src/data/real_titans.json');

  return [
    {
      id: 'fc_lightning',
      name: fc_lightning.name,
      players: fc_lightning.players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position
      }))
    },
    {
      id: 'real_titans',
      name: real_titans.name,
      players: real_titans.players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position
      }))
    }
  ];
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (err) {
      console.error('Invalid message:', err);
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.sessionId) {
      sessionManager.removePlayer(ws.sessionId, ws);
    }
  });
});

function handleMessage(ws, message) {
  const { type, payload } = message;

  switch (type) {
    case 'create_session':
      handleCreateSession(ws, payload);
      break;
    case 'join_session':
      handleJoinSession(ws, payload);
      break;
    case 'client_ready':
      handleClientReady(ws);
      break;
    case 'start_match':
      handleStartMatch(ws, payload);
      break;
    default:
      ws.send(JSON.stringify({ type: 'error', payload: { message: `Unknown message type: ${type}` } }));
  }
}

function handleCreateSession(ws, payload) {
  // Verify token if present
  let userId = null;
  if (payload.token) {
    const user = auth.verifyToken(payload.token);
    if (user) userId = user.id;
  }

  const sessionId = sessionManager.createSession(payload.name || 'Player A', payload.sessionId);

  // Store session ID on socket for later reference
  ws.sessionId = sessionId;

  // Associate the socket with the player (player A) and set team
  const session = sessionManager.getSession(sessionId);
  if (session && session.players[0]) {
    session.players[0].socket = ws;
    session.players[0].teamId = payload.teamId || null;
    session.players[0].userId = userId; // Store userId
  }

  ws.send(JSON.stringify({
    type: 'session_info',
    payload: {
      sessionId,
      role: 'A',
      players: session.getPlayers()
    }
  }));

  console.log(`Session ${sessionId} created by ${payload.name || 'Player A'} (User ID: ${userId})`);
}

function handleJoinSession(ws, payload) {
  const { sessionId, name, teamId, token } = payload;

  // Verify token
  let userId = null;
  if (token) {
    const user = auth.verifyToken(token);
    if (user) userId = user.id;
  }

  const sessionInfo = sessionManager.joinSession(sessionId, name || 'Player B');

  if (!sessionInfo) {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Session not found or full' } }));
    return;
  }

  ws.sessionId = sessionId;

  // Associate the socket with the newly joined player (player B) and set team
  const session = sessionManager.getSession(sessionId);
  if (session && session.players[1]) {
    session.players[1].socket = ws;
    session.players[1].teamId = teamId || null;
    session.players[1].userId = userId; // Store User ID
    console.log(`Player B socket associated and team set to ${teamId} (User ID: ${userId})`);
  }

  // Get fresh player list after setting socket and team
  const updatedPlayers = session.getPlayers();
  console.log('Updated players to broadcast:', JSON.stringify(updatedPlayers, null, 2));

  // Send session info to each player with their correct role
  session.players.forEach(player => {
    if (player.socket && player.socket.readyState === player.socket.OPEN) {
      console.log(`Sending session_info to player ${player.role}`);
      player.socket.send(JSON.stringify({
        type: 'session_info',
        payload: {
          sessionId,
          role: player.role,
          players: updatedPlayers
        }
      }));
    } else {
      console.log(`Player ${player.role} socket not ready or not connected`);
    }
  });

  console.log(`${name || 'Player B'} joined session ${sessionId} as player B with team ${teamId}`);
}

function handleClientReady(ws) {
  if (!ws.sessionId) return;

  // Mark this player as ready
  sessionManager.setPlayerReady(ws.sessionId, ws);

  // Broadcast updated session_info to all players
  const session = sessionManager.getSession(ws.sessionId);
  if (session) {
    session.players.forEach(player => {
      if (player.socket && player.socket.readyState === player.socket.OPEN) {
        player.socket.send(JSON.stringify({
          type: 'session_info',
          payload: {
            sessionId: session.sessionId,
            role: player.role,
            players: session.getPlayers()
          }
        }));
      }
    });

    // If both ready, send both_ready message
    if (session.areBothPlayersReady()) {
      broadcastToSession(session, {
        type: 'both_ready',
        payload: {}
      });
    }
  }
}

function handleStartMatch(ws, payload) {
  if (!ws.sessionId) return;

  // const bothReady = sessionManager.areBothPlayersReady(ws.sessionId);
  // Allow single player start for testing/simulation
  const session = sessionManager.getSession(ws.sessionId);
  if (!session || session.getPlayerCount() === 0) {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Session not ready' } }));
    return;
  }

  // Session already loaded above
  if (!session) return;

  // Load teams
  const teamA = loadTeam('src/data/fc_lightning.json');
  const teamB = loadTeam('src/data/real_titans.json');

  // Create engine with seed from payload
  const seed = payload.seed || Date.now();
  const engine = new GameEngine({
    teamA,
    teamB,
    rng: new RNG(seed)
  });

  // Start match
  // Start match
  const config = payload.config || {};
  if (!config.startingTeam) {
    config.startingTeam = engine.rng.choice(['A', 'B']);
  }
  engine.startMatch({ config });

  // Store engine in session
  session.setGameEngine(engine);

  // Broadcast match started
  broadcastToSession(session, {
    type: 'match_started',
    payload: { message: 'Match starting...' }
  });

  // Start the simulation asynchronously
  setTimeout(() => runMatchSimulation(session), 100);
}

function broadcastToSession(session, message) {
  const sockets = session.getSockets();
  sockets.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

/**
 * Run match simulation for a session
 */
function runMatchSimulation(session) {
  const engine = session.gameEngine;
  if (!engine) return;

  let actionCount = 0;
  const maxActions = 200; // Safety limit

  // Main simulation loop
  const simulationInterval = setInterval(() => {

    if (engine.isFinished() || actionCount >= maxActions) {
      clearInterval(simulationInterval);

      // Send final summary
      const summary = engine.getMatchSummary();
      const { winner } = engine.state;

      let anteCardId = null;

      // Fallback: If we have user IDs, process ante
      const playerA = session.players.find(p => p.role === 'A');
      const playerB = session.players.find(p => p.role === 'B');

      if (winner && playerA && playerB && playerA.userId && playerB.userId) {
        const winnerId = winner === 'A' ? playerA.userId : playerB.userId;
        const loserId = winner === 'A' ? playerB.userId : playerA.userId;

        // We need the card IDs of the loser's team.
        // Currently GameEngine teams don't store card IDs, just players.
        // We need to fetch the team from DB or store card IDs in engine team.
        const loserDbTeam = dbRequest.getUserTeam(loserId);
        if (loserDbTeam) {
          anteCardId = cardManager.processAnte(winnerId, loserId, loserDbTeam.card_ids);
          console.log(`Ante Processed: Card ${anteCardId} transferred from ${loserId} to ${winnerId}`);
        }
      }


      broadcastToSession(session, {
        type: 'engine_event',
        payload: {
          event: {
            type: 'MATCH_END',
            description: summary,
            anteCardId
          }
        }
      });

      return;
    }

    actionCount++;
    engine.state.incrementRound();

    const { zone } = engine.state.ball;
    const currentTeam = engine.currentTeam();
    const opponentTeam = engine.otherTeam();

    try {
      if (zone < Zones.ATTACK) { // Not in attack zone - pass
        // AI picks best passer
        const candidates = engine.playersInZone(currentTeam.id, zone);
        if (candidates.length === 0) {
          console.error(`No players in zone ${zone} for team ${currentTeam.id}`);
          return;
        }

        const passer = candidates.reduce((best, player) =>
          player.getAttribute('pass') > best.getAttribute('pass') ? player : best
        );

        // AI picks best defender
        const targetZone = zone + 1;
        const defender = engine.pickOpponentForZone(opponentTeam.id, targetZone);

        // Resolve pass
        engine.resolvePass({
          passer,
          targetZone,
          opponentInZone: defender
        });

        // Send events that were logged
        sendNewEvents(session, engine);

      } else {
        // In attack zone - take shot
        const attackers = engine.playersInZone(currentTeam.id, zone);
        if (attackers.length === 0) {
          console.error(`No attackers in zone ${zone} for team ${currentTeam.id}`);
          return;
        }

        const shooter = attackers.reduce((best, player) =>
          player.getAttribute('shoot') > best.getAttribute('shoot') ? player : best
        );

        const gk = engine.getGoalkeeper(opponentTeam.id);

        // Resolve shot
        engine.resolveShot({
          shooter,
          opponentGK: gk
        });

        // Send events that were logged
        sendNewEvents(session, engine);
      }

      // Check win condition
      // engine.checkWinCondition(); // TODO: Implement if needed

      // Send any new events (halftime, match end, etc.)
      sendNewEvents(session, engine);

      // Broadcast full state snapshot for UI syncing
      broadcastToSession(session, {
        type: 'state_update',
        payload: {
          state: engine.state.getState()
        }
      });

    } catch (error) {
      console.error('Simulation error:', error);
      clearInterval(simulationInterval);
    }

  }, 500); // Run every 500ms for a nice pace
}

/**
 * Send new events from engine to clients
 */
function sendNewEvents(session, engine) {
  // Send only new logs since last send
  if (!session.lastLogIndex) {
    session.lastLogIndex = 0;
  }

  const { logs } = engine.state;
  const newLogs = logs.slice(session.lastLogIndex);

  newLogs.forEach(log => {
    // Sanitize the event data for JSON serialization
    const sanitizedEvent = sanitizeEvent(log);
    broadcastToSession(session, {
      type: 'engine_event',
      payload: { event: sanitizedEvent }
    });
  });

  // Update the index of logs we've sent
  session.lastLogIndex = logs.length;
}

/**
 * Sanitize event data for JSON serialization
 */
function sanitizeEvent(event) {
  const sanitized = { ...event };

  // Remove or simplify complex objects
  if (sanitized.contestResult) {
    sanitized.contestResult = {
      diff: sanitized.contestResult.diff,
      instant: sanitized.contestResult.instant,
      attackerRoll: sanitized.contestResult.attackerRoll,
      defenderRoll: sanitized.contestResult.defenderRoll
    };
  }

  // Ensure all values are JSON-serializable
  return JSON.parse(JSON.stringify(sanitized));
}

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Get local IP address for LAN access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

server.listen(PORT, HOST, () => {
  console.log(`\n🎮 Field Battle Server Running\n`);
  console.log(`Local:  http://localhost:${PORT}`);
  console.log(`LAN:    http://${localIP}:${PORT}`);
  console.log(`\nWebSocket: ws://${localIP}:${PORT}\n`);
  console.log('Open in two browser tabs to test multiplayer\n');
});