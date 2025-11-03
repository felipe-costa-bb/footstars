import { describe, it, expect } from 'vitest';
import { SessionManager } from '../server/sessionManager.js';

describe('SessionManager', () => {
  it('should create and join sessions correctly', () => {
    const manager = new SessionManager();

    // Test creating a session
    const sessionId = manager.createSession('Alice');
    expect(typeof sessionId).toBe('string');
    expect(sessionId).toHaveLength(6);

    // Test joining a session
    const joinResult = manager.joinSession(sessionId, 'Bob');
    expect(joinResult).not.toBeNull();
    expect(joinResult.sessionId).toBe(sessionId);
    expect(joinResult.players).toHaveLength(2);

    // Test joining a full session
    const joinResult2 = manager.joinSession(sessionId, 'Charlie');
    expect(joinResult2).toBeNull();

    // Test joining non-existent session
    const joinResult3 = manager.joinSession('INVALID', 'Dave');
    expect(joinResult3).toBeNull();
  });

  it('should manage player ready state', () => {
    const manager = new SessionManager();
    const sessionId = manager.createSession('Alice');
    manager.joinSession(sessionId, 'Bob');

    const session = manager.getSession(sessionId);
    expect(session).not.toBeNull();
    expect(session.getPlayerCount()).toBe(2);

    // Test player ready
    const mockSocket1 = { readyState: 1 };
    const mockSocket2 = { readyState: 1 };

    // Simulate adding players with sockets (this is normally done internally)
    session.addPlayer('Alice', mockSocket1);
    session.addPlayer('Bob', mockSocket2);

    let bothReady = manager.setPlayerReady(sessionId, mockSocket1);
    expect(bothReady).toBe(false);

    bothReady = manager.setPlayerReady(sessionId, mockSocket2);
    expect(bothReady).toBe(true);

    expect(manager.areBothPlayersReady(sessionId)).toBe(true);
  });

  it('should clean up sessions when players disconnect', () => {
    const manager = new SessionManager();
    const sessionId = manager.createSession('Alice');
    manager.joinSession(sessionId, 'Bob');

    const session = manager.getSession(sessionId);
    const mockSocket1 = {};
    const mockSocket2 = {};
    session.addPlayer('Alice', mockSocket1);
    session.addPlayer('Bob', mockSocket2);

    // Remove one player
    manager.removePlayer(sessionId, mockSocket1);
    expect(session.getPlayerCount()).toBe(1);

    // Remove last player - session should be cleaned up
    manager.removePlayer(sessionId, mockSocket2);
    expect(manager.getSession(sessionId)).toBeNull();
  });
});