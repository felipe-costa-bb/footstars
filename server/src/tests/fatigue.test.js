import { describe, it, expect } from 'vitest';
import { FatigueTracker } from '../rules/fatigue.js';

describe('FatigueTracker', () => {
  it('should track fatigue penalties correctly', () => {
    const tracker = new FatigueTracker();

    // Test initial state
    expect(tracker.consumePenaltyIfAny('player-1')).toBe(0);

    // Test marking participation
    tracker.markParticipation('player-1');
    expect(tracker.consumePenaltyIfAny('player-1')).toBe(0);

    tracker.markParticipation('player-1');
    expect(tracker.consumePenaltyIfAny('player-1')).toBe(0);

    tracker.markParticipation('player-1');
    expect(tracker.consumePenaltyIfAny('player-1')).toBe(-3);

    // Test consuming penalty clears it
    expect(tracker.consumePenaltyIfAny('player-1')).toBe(0);

    // Test multiple players
    tracker.markParticipation('player-2');
    tracker.markParticipation('player-2');
    tracker.markParticipation('player-2');
    expect(tracker.consumePenaltyIfAny('player-2')).toBe(-3);

    expect(tracker.consumePenaltyIfAny('player-1')).toBe(0);
  });
});