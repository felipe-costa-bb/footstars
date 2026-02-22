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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
        // Starter pack granted in auth.register
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

  // Update Profile Route (Protected)
  if (url === '/api/profile' && req.method === 'PUT') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        try {
          const { username, avatarUrl } = body;

          // Basic validation
          if (username && username.length < 3) {
            res.writeHead(400).end(JSON.stringify({ error: 'Username too short' }));
            return;
          }

          try {
            console.log(`[DEBUG] Update Profile for user ${req.user.id}. Body:`, body);
            const updatedUser = dbRequest.updateUser(req.user.id, { username, avatarUrl });
            console.log(`[DEBUG] Update Profile result:`, updatedUser);

            // Clean sensitive data
            delete updatedUser.password_hash;
            res.writeHead(200).end(JSON.stringify(updatedUser));
          } catch (dbErr) {
            if (dbErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
              res.writeHead(409).end(JSON.stringify({ error: 'Username already taken' }));
            } else {
              throw dbErr;
            }
          }
        } catch (e) {
          console.error("Profile update error:", e);
          res.writeHead(500).end(JSON.stringify({ error: 'Failed to update profile' }));
        }
      });
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

  // Search Players Route (Protected)
  if (url.startsWith('/api/players/search') && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);

      // Build filters object from query parameters
      const filters = {};

      // Name search (backward compatible with 'q' parameter)
      const nameQuery = urlObj.searchParams.get('q');
      if (nameQuery) filters.name = nameQuery;

      // Additional filters
      const nationality = urlObj.searchParams.get('nationality');
      if (nationality) filters.nationality = nationality;

      const position = urlObj.searchParams.get('position');
      if (position) filters.position = position;

      const league = urlObj.searchParams.get('league');
      if (league) filters.league = league;

      const team = urlObj.searchParams.get('team');
      if (team) filters.team = team;

      const type = urlObj.searchParams.get('type');
      if (type) filters.type = type;

      const results = cardManager.searchPlayers(filters);
      res.writeHead(200).end(JSON.stringify(results));
    });
    return;
  }

  // Buy Specific Player Route (Protected)
  if (url === '/api/buy-player' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        if (!body.playerId) {
          res.writeHead(400).end(JSON.stringify({ error: 'Player ID required' }));
          return;
        }

        const result = cardManager.buyPlayer(req.user.id, body.playerId);
        if (result.success) {
          res.writeHead(200).end(JSON.stringify(result));
        } else {
          res.writeHead(400).end(JSON.stringify({ error: result.error }));
        }
      });
    });
    return;
  }

  // Sell Card Route (Protected)
  if (url === '/api/sell-card' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const { cardId } = body;
        if (!cardId) {
          res.writeHead(400).end(JSON.stringify({ error: 'Card ID required' }));
          return;
        }

        const result = cardManager.sellCard(req.user.id, cardId);
        if (result.success) {
          res.writeHead(200).end(JSON.stringify(result));
        } else {
          res.writeHead(400).end(JSON.stringify({ error: result.error }));
        }
      });
    });
    return;
  }

  // Bulk Sell Cards Route (Protected)
  if (url === '/api/sell-cards' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const { cardIds } = body;
        if (!cardIds || !Array.isArray(cardIds)) {
          res.writeHead(400).end(JSON.stringify({ error: 'Card IDs array required' }));
          return;
        }

        const result = cardManager.sellCards(req.user.id, cardIds);
        if (result.success) {
          res.writeHead(200).end(JSON.stringify(result));
        } else {
          res.writeHead(400).end(JSON.stringify({ error: result.error, details: result.details }));
        }
      });
    });
    return;
  }

  // Collection Routes (Protected)
  if (url === '/api/collection' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      try {
        const cards = cardManager.getUserCollection(req.user.id);
        console.log(`[DEBUG] /api/collection for user ${req.user.id}: found ${cards?.length} cards`);

        // Debug first item
        if (cards && cards.length > 0) {
          if (!cards[0].name) {
            console.warn('[DEBUG] Hydration check failed: First card has no name:', JSON.stringify(cards[0]));
          }
        }
        res.writeHead(200).end(JSON.stringify(cards));
      } catch (e) {
        console.error('[DEBUG] Error in /api/collection:', e);
        res.writeHead(500).end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
    return;
  }
  // Create a new team (POST /api/teams)
  if (url === '/api/teams' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const team = dbRequest.createTeam(req.user.id, body.name, body.cardIds, body.formation, body.captainId, body.kitNumbers);
        res.writeHead(201).end(JSON.stringify(team));
      });
    });
    return;
  }

  // Get all user's teams (GET /api/my-teams)
  if (url === '/api/my-teams' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      try {
        const teams = cardManager.getAllUserTeams(req.user.id);
        res.writeHead(200).end(JSON.stringify(teams));
      } catch (e) {
        console.error('Error fetching user teams:', e);
        res.writeHead(500).end(JSON.stringify({ error: 'Failed to fetch teams' }));
      }
    });
    return;
  }

  // Update a team (PUT /api/teams/:id)
  if (url.startsWith('/api/teams/') && req.method === 'PUT') {
    auth.authenticate(req, res, () => {
      const teamId = parseInt(url.split('/').pop());
      if (isNaN(teamId)) {
        res.writeHead(400).end(JSON.stringify({ error: 'Invalid team ID' }));
        return;
      }

      handleJsonBody(req, res, (body) => {
        // Verify ownership first
        const existingTeam = dbRequest.getTeamById(teamId);
        if (!existingTeam) {
          res.writeHead(404).end(JSON.stringify({ error: 'Team not found' }));
          return;
        }
        if (existingTeam.user_id !== req.user.id) {
          res.writeHead(403).end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }

        const team = dbRequest.updateTeam(teamId, body.name, body.cardIds, body.formation, body.captainId, body.kitNumbers);
        res.writeHead(200).end(JSON.stringify(team));
      });
    });
    return;
  }

  // Get single team (legacy - for dashboard)
  if (url === '/api/my-team' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const team = cardManager.getUserTeam(req.user.id);
      if (team) {
        console.log(`[DEBUG] /api/my-team for user ${req.user.id}: ${team.players?.length} players`);
        res.writeHead(200).end(JSON.stringify(team));
      } else {
        console.log(`[DEBUG] /api/my-team for user ${req.user.id}: No team found`);
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
      const idParam = url.split('/').pop();

      // Handle default teams (string IDs)
      if (idParam === 'fc_lightning' || idParam === 'real_titans') {
        const team = loadTeam(`src/data/${idParam}.json`);
        // Add ID if missing in json
        if (!team.id) team.id = idParam;
        res.writeHead(200).end(JSON.stringify(team));
        return;
      }

      const teamId = parseInt(idParam);
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

  // Coaches (public list)
  if (url === '/api/coaches' && req.method === 'GET') {
    const coaches = dbRequest.getAllCoaches();
    res.writeHead(200).end(JSON.stringify(coaches));
    return;
  }

  // Get user's owned coaches (authenticated)
  if (url === '/api/owned-coaches' && req.method === 'GET') {
    auth.authenticate(req, res, () => {
      const owned = dbRequest.getUserOwnedCoaches(req.user.id);
      res.writeHead(200).end(JSON.stringify(owned));
    });
    return;
  }

  // Buy a coach (authenticated)
  if (url === '/api/coaches/buy' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const { coachId } = body;
        if (!coachId) {
          res.writeHead(400).end(JSON.stringify({ error: 'coachId required' }));
          return;
        }

        // 1. Check if already owned
        if (dbRequest.isCoachOwned(req.user.id, coachId)) {
          res.writeHead(400).end(JSON.stringify({ error: 'Coach already owned' }));
          return;
        }

        // 2. Get coach price
        const coach = dbRequest.getCoachById(coachId);
        if (!coach) {
          res.writeHead(404).end(JSON.stringify({ error: 'Coach not found' }));
          return;
        }

        const price = coach.price || 0;
        const balance = dbRequest.getUserCoins(req.user.id);

        if (balance < price) {
          res.writeHead(400).end(JSON.stringify({ error: 'Insufficient funds' }));
          return;
        }

        // 3. Deduct coins and record ownership
        dbRequest.updateUserCoins(req.user.id, balance - price);
        dbRequest.purchaseCoach(req.user.id, coachId);

        res.writeHead(200).end(JSON.stringify({
          success: true,
          message: `Purchased ${coach.name}`,
          newBalance: balance - price
        }));
      });
    });
    return;
  }

  // Assign a coach to a team (authenticated)
  if (url === '/api/coaches/assign' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const { coachId, teamId } = body;
        if (!coachId || !teamId) {
          res.writeHead(400).end(JSON.stringify({ error: 'coachId and teamId required' }));
          return;
        }

        // 1. Check coach ownership
        if (!dbRequest.isCoachOwned(req.user.id, coachId)) {
          res.writeHead(403).end(JSON.stringify({ error: 'Coach not owned' }));
          return;
        }

        // 2. Check team ownership
        const team = dbRequest.getTeam(teamId);
        if (!team || team.user_id !== req.user.id) {
          res.writeHead(403).end(JSON.stringify({ error: 'Team not found or access denied' }));
          return;
        }

        // 3. Assign
        dbRequest.assignCoachToTeam(teamId, coachId);
        res.writeHead(200).end(JSON.stringify({ success: true, message: 'Coach assigned to team' }));
      });
    });
    return;
  }

  // Set user's coach (authenticated) - Deprecated, use /api/coaches/assign instead
  if (url === '/api/my-coach' && req.method === 'POST') {
    auth.authenticate(req, res, () => {
      handleJsonBody(req, res, (body) => {
        const { coachId } = body;
        if (!coachId) {
          res.writeHead(400).end(JSON.stringify({ error: 'coachId required' }));
          return;
        }

        // Check ownership
        if (!dbRequest.isCoachOwned(req.user.id, coachId)) {
          res.writeHead(403).end(JSON.stringify({ error: 'Coach not owned' }));
          return;
        }

        const coach = dbRequest.getCoachById(coachId);
        if (!coach) {
          res.writeHead(404).end(JSON.stringify({ error: 'Coach not found' }));
          return;
        }
        dbRequest.setUserCoach(req.user.id, coachId);
        res.writeHead(200).end(JSON.stringify({ success: true, coach }));
      });
    });
    return;
  }

  // Leaderboard (public)
  if (url === '/api/leaderboard' && req.method === 'GET') {
    const leaderboard = dbRequest.getLeaderboard();
    res.writeHead(200).end(JSON.stringify(leaderboard));
    return;
  }

  // Public games list (for lobby)
  if (url === '/api/public-games' && req.method === 'GET') {
    const publicGames = sessionManager.getPublicSessions();
    console.log(`[DEBUG] GET /api/public-games returning ${publicGames.length} games. Active sessions: ${sessionManager.getActiveSessions().length}`);
    res.writeHead(200).end(JSON.stringify(publicGames));
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
    case 'rejoin_session':
      handleRejoinSession(ws, payload);
      break;
    case 'client_ready':
      handleClientReady(ws);
      break;
    case 'start_match':
      handleStartMatch(ws, payload);
      break;
    case 'player_action':
      handleGameAction(ws, payload);
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

  const isPublic = payload.isPublic === true || payload.isPublic === 'true';
  console.log(`[DEBUG] Handling create_session. isPublic: ${isPublic} (${typeof isPublic}) Payload:`, payload);
  const sessionId = sessionManager.createSession(payload.name || 'Player A', payload.sessionId, isPublic);

  // Store session ID on socket for later reference
  ws.sessionId = sessionId;

  // Associate the socket with the player (player A) and set team
  const session = sessionManager.getSession(sessionId);
  if (session && session.players[0]) {
    session.players[0].socket = ws;
    session.players[0].teamId = payload.teamId || null;
    session.players[0].teamName = payload.teamName || null; // Store team name
    session.players[0].userId = userId; // Store userId
  }

  ws.send(JSON.stringify({
    type: 'session_info',
    payload: {
      sessionId,
      role: 'A',
      isPublic,
      players: session.getPlayers()
    }
  }));

  console.log(`Session ${sessionId} created by ${payload.name || 'Player A'} (User ID: ${userId}, Public: ${isPublic})`);
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
    session.players[1].teamName = payload.teamName || null; // Store team name
    session.players[1].userId = userId; // Store User ID
    console.log(`Player B socket associated and team set to ${teamId} (${payload.teamName}) (User ID: ${userId})`);
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

function handleRejoinSession(ws, payload) {
  const { sessionId, token } = payload;
  console.log(`[handleRejoinSession] Session: ${sessionId}, hasToken: ${!!token}`);

  if (!sessionId) return;

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    console.log(`[handleRejoinSession] Session ${sessionId} not found`);
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Session not found' } }));
    return;
  }

  // Find player by token or userId if available, or just role/name?
  // We need a way to verify identity. The safest is token -> userId.
  let userId = null;
  if (token) {
    const user = auth.verifyToken(token);
    if (user) userId = user.id;
  }

  console.log(`[handleRejoinSession] Looking for userId: ${userId}. Players:`,
    session.players.map(p => ({ role: p.role, name: p.name, userId: p.userId })));

  // Find player matching userId
  let player = session.players.find(p => p.userId && p.userId === userId);

  // Fallback: If no userId match, try to find a player without an active socket
  // This handles cases where the socket disconnected and is now reconnecting
  if (!player && session.players.length > 0) {
    // Find a player whose socket is null or closed
    player = session.players.find(p => !p.socket || p.socket.readyState !== 1);
    if (player) {
      console.log(`[handleRejoinSession] Fallback: Found player ${player.role} (${player.name}) without active socket`);
      // Update userId for future matches
      if (userId) player.userId = userId;
    }
  }

  if (player) {
    console.log(`User ${userId || 'unknown'} reclaiming session ${sessionId} as role ${player.role}`);
    // Update socket
    player.socket = ws;
    ws.sessionId = sessionId;

    // Send session info
    ws.send(JSON.stringify({
      type: 'session_info',
      payload: {
        sessionId: session.sessionId,
        role: player.role,
        players: session.getPlayers()
      }
    }));

    // If match is active, send full game state update or recent events?
    // For now, engine events are broadcast, but we might need a sync state message.
    // If match is active, send full game state update and replay logs
    if (session.gameEngine) {
      console.log(`[Rejoin] Syncing match state for session ${sessionId}`);

      // 1. Send match started signal
      ws.send(JSON.stringify({
        type: 'match_started',
        payload: {
          message: 'Reconnected to match',
          teamAId: session.gameEngine.teamA.id,
          teamBId: session.gameEngine.teamB.id,
          seed: session.gameEngine.rng.seed
        }
      }));

      // 2. Send current state
      ws.send(JSON.stringify({
        type: 'state_update',
        payload: { state: session.gameEngine.state.getState() }
      }));

      // 3. Replay ALL events from logs so client catches up
      const logs = session.gameEngine.state.logs;
      console.log(`[Rejoin] Replaying ${logs.length} events to user ${userId}`);

      logs.forEach(log => {
        const sanitized = sanitizeEvent(log);
        ws.send(JSON.stringify({
          type: 'engine_event',
          payload: { event: sanitized }
        }));
      });
    }
    return;
  }

  console.log(`Rejoin failed for session ${sessionId}: User not found. Available players:`,
    session.players.map(p => ({ role: p.role, userId: p.userId, hasSocket: !!p.socket })));
  // Fallback: If development mode or anonymous, maybe allow reconnect by name? 
  // But for now, require Auth or fail.
}

function handleClientReady(ws) {
  if (!ws.sessionId) return;

  console.log(`[DEBUG] Client ready received for session ${ws.sessionId}`);

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
      console.log(`[DEBUG] Both players ready in session ${ws.sessionId}. sending both_ready.`);
      broadcastToSession(session, {
        type: 'both_ready',
        payload: {}
      });
    }
  }
}

function handleStartMatch(ws, payload) {
  console.log(`[DEBUG] handleStartMatch called for session ${ws?.sessionId}`);
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

  // Load teams from session players
  const playerA = session.players.find(p => p.role === 'A');
  const playerB = session.players.find(p => p.role === 'B');

  console.log(`[DEBUG] handleStartMatch: Session ${ws.sessionId}, Player A: ${playerA ? 'Found' : 'Missing'}, Player B: ${playerB ? 'Found' : 'Missing'}`);

  if (!playerA || !playerB) {
    console.error(`[DEBUG] Cannot start match: Missing players. A: ${!!playerA}, B: ${!!playerB}`);
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Players not ready' } }));
    return;
  }

  // Use selected team or fallback to default
  const teamAId = playerA.teamId || 'fc_lightning';
  const teamBId = playerB.teamId || 'real_titans';

  // Load team data dynamically
  // Note: We need to find the team file path or data from the teams array
  // Since we don't have a direct map here without reading all files, 
  // we can use the `teams` cache if available or simplified logic.
  // For now, let's assume we can find them in the teams list loaded at startup/API.
  // BUT the simplest way server-side right now without refactoring everything 
  // is to map the IDs back to files or just re-use the hardcoded files if IDs match, 
  // OR better: use the API team loader logic.

  // Let's assume the ID *is* the filename prefix or we can lookup.
  // Since we verified the team IDs earlier (like 'fc_lightning', 'real_titans'),
  // we can try to load them.

  // NOTE: In a real app we'd have a proper repository. 
  // Here we'll do a best-effort lookup or fallback.
  // Helper to load or fetch team
  const getTeam = (teamId, fallbackPath, fallbackId) => {
    // Check for default teams
    if (teamId === 'fc_lightning' || teamId === 'real_titans') {
      try {
        const team = loadTeam(`src/data/${teamId}.json`);
        team.id = teamId;
        return team;
      } catch (e) {
        console.error(`Failed to load default team ${teamId}:`, e);
      }
    }

    // Check for database team (numeric ID)
    if (teamId && !isNaN(parseInt(teamId))) {
      try {
        const team = cardManager.getTeamById(parseInt(teamId));
        if (team) {
          console.log(`[DEBUG] Loaded DB team ${teamId}: ${team.name}`);
          return team;
        }
      } catch (e) {
        console.error(`[DEBUG] Failed to load DB team ${teamId}:`, e);
      }
    }

    // Fallback
    console.log(`[DEBUG] Team ${teamId} not found/invalid, using fallback ${fallbackId}`);
    try {
      const team = loadTeam(fallbackPath);
      team.id = fallbackId;
      return team;
    } catch (e) {
      console.error('Failed to load fallback team:', e);
      return { id: 'error', name: 'Error FC', players: [] };
    }
  };

  const teamA = getTeam(teamAId, 'src/data/fc_lightning.json', 'fc_lightning');
  const teamB = getTeam(teamBId, 'src/data/real_titans.json', 'real_titans');

  // Hydrate coaches
  if (teamA.coach_id) {
    teamA.coach = dbRequest.getCoachById(teamA.coach_id);
  } else if (playerA.userId) {
    teamA.coach = dbRequest.getUserCoach(playerA.userId);
  }

  if (teamB.coach_id) {
    teamB.coach = dbRequest.getCoachById(teamB.coach_id);
  } else if (playerB.userId) {
    teamB.coach = dbRequest.getUserCoach(playerB.userId);
  }

  // Create engine with seed from payload
  const seed = payload.seed || Date.now();
  const engine = new GameEngine({
    teamA,
    teamB,
    rng: new RNG(seed)
  });

  // Start match
  const config = payload.config || {};
  if (!config.startingTeam) {
    config.startingTeam = engine.rng.choice(['A', 'B']);
  }
  engine.startMatch({ config });

  // Store engine in session
  session.setGameEngine(engine);

  // Broadcast match started with team info
  broadcastToSession(session, {
    type: 'match_started',
    payload: {
      message: 'Match starting...',
      teamAId: teamA.id,
      teamBId: teamB.id,
      seed: seed
    }
  });

  // Start the first turn
  engine.startTurn();
  sendNewEvents(session, engine);
  broadcastToSession(session, {
    type: 'state_update',
    payload: { state: engine.state.getState() }
  });
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
// REMOVED: runMatchSimulation loop. We are now Interactive.

/**
 * Handle player action (interactive mode)
 */
function handleGameAction(ws, payload) {
  console.log(`[handleGameAction] Received action:`, JSON.stringify(payload));

  if (!ws.sessionId) {
    console.log(`[handleGameAction] ABORT: No sessionId on websocket`);
    return;
  }

  const session = sessionManager.getSession(ws.sessionId);
  if (!session) {
    console.log(`[handleGameAction] ABORT: Session ${ws.sessionId} not found`);
    return;
  }
  if (!session.gameEngine) {
    console.log(`[handleGameAction] ABORT: No gameEngine in session ${ws.sessionId}`);
    return;
  }

  const engine = session.gameEngine;
  const player = session.players.find(p => p.socket === ws);

  if (!player) {
    console.log(`[handleGameAction] ABORT: Player not found for socket. Session players:`,
      session.players.map(p => ({ role: p.role, hasSocket: !!p.socket })));
    return;
  }

  console.log(`[handleGameAction] Player ${player.role} action. Phase: ${engine.state.phase}, CurrentTeam: ${engine.state.currentTeamId}`);

  // Validate turn
  // Engine phase: SELECTION (Attacker), RESPONSE (Defender)
  // If phase is SELECTION, only current team can act.
  // If phase is RESPONSE, only defender team can act.

  const currentTeamId = engine.state.currentTeamId;
  const isAttacker = player.role === currentTeamId; // Role A or B matches Team ID A or B

  try {
    if (engine.state.phase === 'SELECTION') {
      if (!isAttacker) {
        console.log(`[Block] Player ${player.role} tried to act during opponent turn.`);
        return;
      }

      if (payload.action === 'PASS') {
        // Determine the passer: use provided playerId, or get first player in current ball zone
        const currentBallZone = engine.state.ball.zone;
        console.log(`[handleGameAction] Processing PASS. Ball zone: ${currentBallZone}, Team: ${currentTeamId}`);
        let passerId = payload.playerId;
        if (!passerId) {
          const playersInZone = engine.playersInZone(currentTeamId, currentBallZone);
          if (playersInZone.length > 0) {
            passerId = playersInZone[0].id;
            console.log(`[handleGameAction] Auto-selected passer: ${playersInZone[0].name} from zone ${currentBallZone}`);
          } else {
            console.error(`[handleGameAction] No players in zone ${currentBallZone} for team ${currentTeamId}`);
            return;
          }
        }

        engine.commitAction({
          type: 'PASS',
          playerId: passerId,
          targetZone: payload.targetZone || (currentBallZone + 1)
        });
      } else if (payload.action === 'SHOOT') {
        engine.commitAction({
          type: 'SHOOT',
          playerId: payload.playerId || engine.playersInZone(currentTeamId, 3)[0].id
        });
      }

      // After action is committed, broadcast the PHASE_CHANGE to RESPONSE
      sendNewEvents(session, engine);
      broadcastToSession(session, {
        type: 'state_update',
        payload: { state: engine.state.getState() }
      });

      // Auto-resolve: pick best defender and immediately continue
      // This prevents deadlock waiting for defender to manually respond
      if (engine.state.phase === 'RESPONSE') {
        const targetZone = engine.state.pendingAction.targetZone || 3;
        const autoDefender = engine.pickOpponentForZone(currentTeamId, targetZone);
        console.log(`[Auto-Defend] Auto-picking defender: ${autoDefender.name} for zone ${targetZone}`);

        engine.commitResponse({
          defenderId: autoDefender.id
        });

        // Broadcast resolution events
        sendNewEvents(session, engine);
        broadcastToSession(session, {
          type: 'state_update',
          payload: { state: engine.state.getState() }
        });
      }
      return;

    } else if (engine.state.phase === 'RESPONSE') {
      if (isAttacker) { // Attacker cannot respond, defender must
        console.log(`[Block] Player ${player.role} tried to respond during own turn.`);
        return;
      }

      // Defender selects a player to contest
      engine.commitResponse({
        defenderId: payload.defenderId || engine.pickOpponentForZone(currentTeamId, engine.state.pendingAction.targetZone || 3).id
      });
    }

    // Broadcast updates
    sendNewEvents(session, engine);
    broadcastToSession(session, {
      type: 'state_update',
      payload: { state: engine.state.getState() }
    });

  } catch (e) {
    console.error("Action error:", e);
  }
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

  // Process rewards for new events
  processRewards(session, newLogs);

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
 * Process game events to award coins
 * @param {Session} session 
 * @param {Array} logs 
 */
function processRewards(session, logs) {
  logs.forEach(log => {
    try {
      if (log.type === 'GOAL') {
        const teamId = log.teamId;
        const player = session.players.find(p => p.role === teamId);
        if (player && player.userId) {
          const newBalance = dbRequest.addUserCoins(player.userId, 1000);
          console.log(`[Rewards] Awarded 1000 coins to user ${player.userId} for GOAL. New balance: ${newBalance}`);
        }
      } else if (log.type === 'MATCH_END') {
        if (log.outcome === 'WIN') {
          const winnerRole = log.teamId;
          const loserRole = winnerRole === 'A' ? 'B' : 'A';

          const winner = session.players.find(p => p.role === winnerRole);
          const loser = session.players.find(p => p.role === loserRole);

          if (winner && winner.userId) {
            const newBalance = dbRequest.addUserCoins(winner.userId, 10000);
            console.log(`[Rewards] Awarded 10000 coins to user ${winner.userId} for WIN. New balance: ${newBalance}`);
          }

          if (loser && loser.userId) {
            const newBalance = dbRequest.addUserCoins(loser.userId, 2500);
            console.log(`[Rewards] Awarded 2500 coins to user ${loser.userId} for LOSS. New balance: ${newBalance}`);
          }

        } else if (log.outcome === 'DRAW') {
          session.players.forEach(player => {
            if (player.userId) {
              const newBalance = dbRequest.addUserCoins(player.userId, 5000);
              console.log(`[Rewards] Awarded 5000 coins to user ${player.userId} for DRAW. New balance: ${newBalance}`);
            }
          });
        }
      }
    } catch (err) {
      console.error('[Rewards] Error processing reward for log:', log, err);
    }
  });
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



server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎮 Field Battle Server Running (0.0.0.0:${PORT})\n`);
  console.log(`Local:  http://localhost:${PORT}`);
  try {
    const localIP = getLocalIP();
    console.log(`LAN:    http://${localIP}:${PORT}`);
  } catch (e) {
    console.log('LAN IP lookup failed');
  }
  console.log(`\nWebSocket: ws://localhost:${PORT}\n`);
});