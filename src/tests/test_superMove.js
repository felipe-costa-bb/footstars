import { describe, it, expect } from 'vitest';
import { SuperMoveManager } from '../rules/superMove.js';

describe('SuperMoveManager', () => {
  it('should manage super move usage per team', () => {
    const manager = new SuperMoveManager();

    // Test initial state
    expect(manager.canUse('team-1')).toBe(true);
    expect(manager.canUse('team-2')).toBe(true);

    // Test using super move
    const used = manager.use('team-1');
    expect(used).toBe(true);
    expect(manager.canUse('team-1')).toBe(false);
    expect(manager.canUse('team-2')).toBe(true);

    // Test using again (should fail)
    const usedAgain = manager.use('team-1');
    expect(usedAgain).toBe(false);

    // Test team 2
    manager.use('team-2');
    expect(manager.canUse('team-2')).toBe(false);
  });
});