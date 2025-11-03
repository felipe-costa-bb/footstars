import { describe, it, expect } from 'vitest';
import { MatchState } from '../core/matchState.js';
import { Zones } from '../core/zones.js';

describe('MatchState incrementRound', () => {
  it('should emit HALFTIME at roundsPerHalf and MATCH_END at 2*roundsPerHalf', () => {
    // Test 1: default 45 rounds per half
    const ms = new MatchState('A', Zones.MIDFIELD, 45, true);

    // Increment up to 45 rounds
    for (let i = 0; i < 45; i++) ms.incrementRound();
    const lastLog = ms.logs[ms.logs.length - 1];
    expect(lastLog.type).toBe('HALFTIME');

    // Increment to full time
    for (let i = 0; i < 45; i++) ms.incrementRound();
    const endLog = ms.logs[ms.logs.length - 1];
    expect(endLog.type).toBe('MATCH_END');
    expect(ms.finished).toBe(true);
  });

  it('should work with custom roundsPerHalf', () => {
    const ms = new MatchState('A', Zones.MIDFIELD, 10, true);

    // Increment to halftime
    for (let i = 0; i < 10; i++) ms.incrementRound();
    expect(ms.logs[ms.logs.length - 1].type).toBe('HALFTIME');

    // Increment to full time
    for (let i = 0; i < 10; i++) ms.incrementRound();
    expect(ms.logs[ms.logs.length - 1].type).toBe('MATCH_END');
  });
});
