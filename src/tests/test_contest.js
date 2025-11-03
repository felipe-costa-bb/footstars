import { describe, it, expect } from 'vitest';
import { contest } from '../core/contest.js';
import { FatigueTracker } from '../rules/fatigue.js';

/**
 * Mock Player for testing
 */
class MockPlayer {
  constructor(id, attributes) {
    this.id = id;
    this.attributes = attributes;
  }

  getAttribute(attr) {
    return this.attributes[attr] || 0;
  }
}

/**
 * Mock RNG for testing specific dice rolls
 */
class MockRNG {
  constructor(rolls) {
    this.rolls = rolls;
    this.index = 0;
  }

  d10() {
    return this.rolls[this.index++];
  }
}

describe('Contest Resolution', () => {
  it('should handle instant success and failure with d10', () => {
    const fatigueTracker = new FatigueTracker();
    const attacker = new MockPlayer('attacker', { pass: 50 });
    const defender = new MockPlayer('defender', { tackle: 50 });

    // Test instant success (attacker rolls 10)
    const rngSuccess = new MockRNG([10, 5]);
    const resultSuccess = contest({
      rng: rngSuccess,
      attacker,
      defender,
      attackerAttr: 'pass',
      defenderAttr: 'tackle',
      fatigueTracker
    });
    expect(resultSuccess.diff > 0).toBe(true);
    expect(resultSuccess.instant).toBe('attacker_success');

    // Test instant failure (attacker rolls 1)
    const fatigueTracker2 = new FatigueTracker();
    const rngFailure = new MockRNG([1, 5]);
    const resultFailure = contest({
      rng: rngFailure,
      attacker,
      defender,
      attackerAttr: 'pass',
      defenderAttr: 'tackle',
      fatigueTracker: fatigueTracker2
    });
    expect(resultFailure.diff > 0).toBe(false);
    expect(resultFailure.instant).toBe('attacker_fail');

    // Test normal roll (not 1 or 10)
    const fatigueTracker3 = new FatigueTracker();
    const rngNormal = new MockRNG([5, 3]);
    const resultNormal = contest({
      rng: rngNormal,
      attacker,
      defender,
      attackerAttr: 'pass',
      defenderAttr: 'tackle',
      fatigueTracker: fatigueTracker3
    });
    expect(resultNormal.diff > 0).toBe(true);
    expect(resultNormal.instant).toBe(null);
  });

  it('should apply modifiers correctly', () => {
    const fatigueTracker = new FatigueTracker();
    const attacker = new MockPlayer('attacker', { pass: 50 });
    const defender = new MockPlayer('defender', { tackle: 50 });

    // Test with positive modifier (should help attacker)
    const rngMod = new MockRNG([5, 5]);
    const resultMod = contest({
      rng: rngMod,
      attacker,
      defender,
      attackerAttr: 'pass',
      defenderAttr: 'tackle',
      fatigueTracker,
      maybeSuperMove: 5
    });
    expect(resultMod.diff > 0).toBe(true);
  });
});