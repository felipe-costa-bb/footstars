/* eslint-disable max-classes-per-file */
/**
 * Represents a single game session
 */
class Session {
  constructor(sessionId, creatorName, isPublic = false) {
    this.sessionId = sessionId;
    this.players = []; // Array of { name, role, ready, socket? }
    this.gameEngine = null;
    this.lastLogIndex = 0; // Track which logs have been sent to clients
    this.isPublic = isPublic; // Whether this game appears in public lobby
    this.createdAt = new Date();
    this.creatorName = creatorName; // Store creator name for public display

    // Add creator as player A
    this.players.push({ name: creatorName, role: 'A', ready: false, teamId: null, teamName: null });
  }

  /**
   * Add a player to the session
   * @param {string} playerName - Player name
   * @param {*} socket - WebSocket connection (optional, for tracking)
   * @param {string} teamId - Team ID (optional)
   * @param {string} teamName - Team Name (optional)
   */
  addPlayer(playerName, socket = null, teamId = null, teamName = null) {
    // Check if player already exists (update socket)
    const existingPlayer = this.players.find(p => p.name === playerName);
    if (existingPlayer) {
      existingPlayer.socket = socket;
      if (teamId) existingPlayer.teamId = teamId;
      if (teamName) existingPlayer.teamName = teamName;
      return;
    }

    // Add new player
    if (this.players.length === 0) {
      // First player is A
      this.players.push({ name: playerName, role: 'A', ready: false, socket, teamId, teamName });
    } else if (this.players.length === 1) {
      // Second player is B
      this.players.push({ name: playerName, role: 'B', ready: false, socket, teamId, teamName });
    }
  }

  /**
   * Remove a player from the session
   * @param {*} socket - WebSocket connection to remove
   */
  removePlayer(socket) {
    this.players = this.players.filter(player => player.socket !== socket);
  }

  /**
   * Get number of players in session
   * @returns {number} Player count
   */
  getPlayerCount() {
    return this.players.length;
  }

  /**
   * Check if session is full
   * @returns {boolean} True if session has 2 players
   */
  isFull() {
    return this.players.length >= 2;
  }

  /**
   * Get players info
   * @returns {Array} Array of player objects (without socket)
   */
  getPlayers() {
    return this.players.map(player => ({
      name: player.name,
      role: player.role,
      ready: player.ready,
      teamId: player.teamId || null,
      teamName: player.teamName || null
    }));
  }

  /**
   * Mark a player as ready
   * @param {*} socket - Player's socket
   * @returns {boolean} True if both players are now ready
   */
  setPlayerReady(socket) {
    const player = this.players.find(p => p.socket === socket);
    if (player) {
      player.ready = true;
      return this.areBothPlayersReady();
    }
    return false;
  }

  /**
   * Check if both players are ready
   * @returns {boolean} True if both players are ready
   */
  areBothPlayersReady() {
    if (this.players.length !== 2) return false;
    return this.players.every(player => player.ready);
  }

  /**
   * Get all connected sockets
   * @returns {Array} Array of WebSocket connections
   */
  getSockets() {
    return this.players
      .map(player => player.socket)
      .filter(socket => socket != null);
  }

  /**
   * Set the game engine for this session
   * @param {*} gameEngine - GameEngine instance
   */
  setGameEngine(gameEngine) {
    this.gameEngine = gameEngine;
  }
}

/* eslint-disable max-classes-per-file */
/**
 * Session manager for multiplayer Field Battle games
 */
export class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> Session
  }

  /**
   * Create a new session
   * @param {string} creatorName - Name of the player creating the session
   * @param {string} customId - Optional custom session ID
   * @param {boolean} isPublic - Whether this session is publicly listed
   * @returns {string} Session ID
   */
  createSession(creatorName, customId = null, isPublic = false) {
    const sessionId = customId || this.generateSessionId();
    const session = new Session(sessionId, creatorName, isPublic);
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Join an existing session
   * @param {string} sessionId - Session ID to join
   * @param {string} playerName - Name of the joining player
   * @returns {Object|null} Session info or null if session not found/full
   */
  joinSession(sessionId, playerName) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null; // Session not found
    }

    if (session.isFull()) {
      return null; // Session is full
    }

    session.addPlayer(playerName);
    return {
      sessionId,
      players: session.getPlayers()
    };
  }

  /**
   * Get session by ID
   * @param {string} sessionId - Session ID
   * @returns {Session|null} Session object or null
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Remove a player from a session (on disconnect)
   * @param {string} sessionId - Session ID
   * @param {*} playerSocket - Player's WebSocket connection
   */
  removePlayer(sessionId, playerSocket) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.removePlayer(playerSocket);
      // Clean up empty sessions
      if (session.getPlayerCount() === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Mark a player as ready in a session
   * @param {string} sessionId - Session ID
   * @param {*} playerSocket - Player's WebSocket connection
   * @returns {boolean} True if both players are now ready
   */
  setPlayerReady(sessionId, playerSocket) {
    const session = this.sessions.get(sessionId);
    if (session) {
      return session.setPlayerReady(playerSocket);
    }
    return false;
  }

  /**
   * Check if both players in a session are ready
   * @param {string} sessionId - Session ID
   * @returns {boolean} True if both players are ready
   */
  areBothPlayersReady(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.areBothPlayersReady() : false;
  }

  /**
   * Generate a random session ID
   * @returns {string} 6-character uppercase alphanumeric ID
   */
  generateSessionId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Get all public sessions that are not full (for public lobby)
   * @returns {Array} Array of session info objects for display
   */
  getPublicSessions() {
    const publicSessions = [];
    for (const session of this.sessions.values()) {
      if (session.isPublic && !session.isFull()) {
        const creator = session.players.find(p => p.role === 'A');
        publicSessions.push({
          sessionId: session.sessionId,
          creatorName: session.creatorName,
          teamId: creator?.teamId || null,
          createdAt: session.createdAt,
          playerCount: session.getPlayerCount()
        });
      }
    }
    return publicSessions;
  }

  /**
   * Get all active sessions (for debugging)
   * @returns {Array} Array of session objects
   */
  getActiveSessions() {
    return Array.from(this.sessions.values());
  }
}