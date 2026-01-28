import { BallState } from './ballState.js';
import { Zones } from './zones.js';

/**
 * Match state tracking
 */
export class MatchState {
  /**
   * @param {string} startingTeamId - Team ID starting with possession
   */
  constructor(startingTeamId, startingZone = Zones.GK, roundsPerHalf = 45, forceFullMatch = false) {
    this.score = { A: 0, B: 0 };
    this.possessionCount = { A: 0, B: 0, total: 0 };
    this.ball = new BallState(startingTeamId, startingZone);
    this.currentTeamId = startingTeamId;
    this.logs = [];
    this.finished = false;
    this.winner = null;
    this.winReason = null;

    // Rounds / halves
    // Rounds / halves
    this.roundsPerHalf = roundsPerHalf; // Now defaults to 50 in logic below if not passed
    this.currentHalf = 1; // 1 or 2
    this.currentRound = 0; // increments after each action

    // Phase management
    this.phase = 'SELECTION'; // SELECTION, RESPONSE, RESOLUTION
    this.pendingAction = null; // Store intended action during RESPONSE phase
    // Whether to force full 90 rounds and ignore early win conditions
    this.forceFullMatch = forceFullMatch;
  }

  /**
   * Increment round counter and handle halftime/fulltime transitions
   */
  incrementRound() {
    // If match already finished, ignore
    if (this.finished) return;

    this.currentRound += 1;

    // Half-time: when first half reaches roundsPerHalf
    if (this.currentHalf === 1 && this.currentRound >= this.roundsPerHalf) {
      this.currentHalf = 2;
      this.addLog({
        type: 'HALFTIME',
        description: `Halftime reached after ${this.roundsPerHalf} rounds.`
      });
    }

    // Full-time: when second half reaches roundsPerHalf * 2
    if (this.currentHalf === 2 && this.currentRound >= this.roundsPerHalf * 2) {
      // Determine winner or draw
      if (this.score.A === this.score.B) {
        this.finish(null, 'Full time - Draw');
        this.addLog({ type: 'MATCH_END', outcome: 'DRAW', description: 'Full time - Draw' });
      } else {
        const winner = this.score.A > this.score.B ? 'A' : 'B';
        this.finish(winner, 'Full time - Result');
        this.addLog({ type: 'MATCH_END', teamId: winner, outcome: 'WIN', description: `Full time - ${winner} wins` });
      }
    }
  }

  /**
   * Add goal to score
   * @param {string} teamId - Team that scored
   */
  addGoal(teamId) {
    this.score[teamId] += 1;
  }

  /**
   * Increment possession count
   * @param {string} teamId - Team ID
   */
  incrementPossession(teamId) {
    this.possessionCount[teamId] += 1;
    this.possessionCount.total += 1;
  }

  /**
   * Add event to log
   * @param {import('../types/typedefs.js').GameEvent} event - Event to log
   */
  addLog(event) {
    this.logs.push({
      ...event,
      timestamp: Date.now()
    });
  }

  /**
   * Mark match as finished
   * @param {string} [winnerId] - Winner team ID
   * @param {string} [reason] - Win reason
   */
  finish(winnerId = null, reason = null) {
    this.finished = true;
    this.winner = winnerId;
    this.winReason = reason;
  }

  /**
   * Get current match state
   * @returns {import('../types/typedefs.js').MatchStateData}
   */
  getState() {
    return {
      score: { ...this.score },
      possessionCount: { ...this.possessionCount },
      ball: this.ball.getState(),
      currentTeamId: this.currentTeamId,
      logs: [...this.logs],
      finished: this.finished,
      winner: this.winner,
      winReason: this.winReason
    };
  }

  /**
   * Get score summary
   * @returns {string} Score string
   */
  getScoreSummary() {
    return `Team A: ${this.score.A} - Team B: ${this.score.B}`;
  }

  /**
   * Get possession summary
   * @returns {string} Possession string
   */
  getPossessionSummary() {
    return `Possessions - A: ${this.possessionCount.A}, B: ${this.possessionCount.B} (Total: ${this.possessionCount.total})`;
  }
}
