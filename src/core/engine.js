import { Team } from './team.js';
import { MatchState } from './matchState.js';
import { Zones, zoneName, positionToZones } from './zones.js';
import { contest, formatContestResult } from './contest.js';
import { RNG } from '../rules/rng.js';
import { FatigueTracker } from '../rules/fatigue.js';
import { SuperMoveManager } from '../rules/superMove.js';

/**
 * Main game engine - orchestrates the match
 */
export class GameEngine {
  /**
   * @param {Object} params - Engine parameters
   * @param {import('../types/typedefs.js').TeamData} params.teamA - Team A data
   * @param {import('../types/typedefs.js').TeamData} params.teamB - Team B data
   * @param {RNG} [params.rng] - Random number generator
   */
  constructor({ teamA, teamB, rng = new RNG() }) {
    this.teams = {
      A: new Team('A', teamA),
      B: new Team('B', teamB)
    };
    this.rng = rng;
    this.fatigue = new FatigueTracker();
    this.superMove = new SuperMoveManager();
    this.state = null;
  }

  /**
   * Start a new match
   * @param {Object} params - Match parameters
   * @param {string} params.startingTeam - Team ID to start with ball ('A' or 'B')
   */
  startMatch({ startingTeam, forceFullMatch = false, roundsPerHalf = 45 }) {
    if (startingTeam !== 'A' && startingTeam !== 'B') {
      throw new Error('Starting team must be "A" or "B"');
    }

    // Start match in MIDFIELD zone
  // Default to 45 rounds per half (two halves -> 90 rounds total)
  // Optionally allow forcing full match (ignore early win conditions)
  this.state = new MatchState(startingTeam, Zones.MIDFIELD, roundsPerHalf, forceFullMatch);
    this.fatigue.reset();
    this.superMove.reset();

    this.logEvent({
      type: 'MATCH_START',
      teamId: startingTeam,
      zone: Zones.MIDFIELD,
      outcome: 'KICKOFF',
      description: `Match starts in MIDFIELD! ${this.teams[startingTeam].name} has possession.`
    });
  }

  /**
   * Get current team
   * @returns {Team}
   */
  currentTeam() {
    return this.teams[this.state.currentTeamId];
  }

  /**
   * Get other team
   * @returns {Team}
   */
  otherTeam() {
    const otherId = this.state.currentTeamId === 'A' ? 'B' : 'A';
    return this.teams[otherId];
  }

  /**
   * Get players available in a zone for a team
   * @param {string} teamId - Team ID
   * @param {number} zone - Zone number
   * @returns {import('./player.js').Player[]} Players in zone
   */
  playersInZone(teamId, zone) {
    const team = this.teams[teamId];
    
    switch (zone) {
      case Zones.GK:
        return [team.getGoalkeeper()];
      case Zones.DEFENSE:
        return team.getPlayersByPosition('DF');
      case Zones.MIDFIELD:
        return team.getPlayersByPosition('MF');
      case Zones.ATTACK:
        return team.getPlayersByPosition('FW');
      default:
        return [];
    }
  }

  /**
   * Pick best opponent for a zone (simple AI)
   * @param {string} teamId - Team ID
   * @param {number} zone - Zone number
   * @param {string} [preferAttr='tackle'] - Preferred attribute
   * @returns {import('./player.js').Player} Best defender
   */
  pickOpponentForZone(teamId, zone, preferAttr = 'tackle') {
    const players = this.playersInZone(teamId, zone);
    
    if (players.length === 0) {
      throw new Error(`No players available in zone ${zone} for team ${teamId}`);
    }

    // Pick player with highest preferred attribute
    return players.reduce((best, player) => 
      player.getAttribute(preferAttr) > best.getAttribute(preferAttr) ? player : best
    );
  }

  /**
   * Resolve a pass attempt
   * @param {Object} params - Pass parameters
   * @param {import('./player.js').Player} params.passer - Passing player
   * @param {number} params.targetZone - Target zone
   * @param {import('./player.js').Player} params.opponentInZone - Defending player
   * @param {Object} [params.context={}] - Additional context
   * @param {boolean} [params.context.useSuperMove=false] - Use super move
   * @returns {{success: boolean, intercepted: boolean}}
   */
  resolvePass({ passer, targetZone, opponentInZone, context = {} }) {
    const useSuperMove = context.useSuperMove || false;
    const teamId = this.state.currentTeamId;

    // Attempt to use super move if requested
    let superMoveBonus = 0;
    if (useSuperMove && this.superMove.use(teamId)) {
      superMoveBonus = 10;
    }

    // Contest: Pass vs Tackle
    const result = contest({
      rng: this.rng,
      attacker: passer,
      defender: opponentInZone,
      attackerAttr: 'pass',
      defenderAttr: 'tackle',
      fatigueTracker: this.fatigue,
      maybeSuperMove: superMoveBonus,
      maybeCounterAttack: 0
    });

    if (result.diff > 0) {
      // Pass success - advance zone
      this.state.ball.moveTo(targetZone, 'PASS');
      
      this.logEvent({
        type: 'PASS',
        teamId,
        playerId: passer.id,
        playerName: passer.name,
        zone: targetZone,
        defenderId: opponentInZone.id,
        defenderName: opponentInZone.name,
        contestResult: result,
        outcome: 'SUCCESS',
        description: `${passer.name} successfully passes to ${zoneName(targetZone)}!`
      });

      return { success: true, intercepted: false };
    } else {
      // Intercepted - swap possession
      this.swapPossessionAtSameZone(opponentInZone);
      
      this.logEvent({
        type: 'INTERCEPT',
        teamId: this.state.currentTeamId, // Now the intercepting team
        playerId: opponentInZone.id,
        playerName: opponentInZone.name,
        zone: this.state.ball.zone,
        contestResult: result,
        outcome: 'INTERCEPT',
        description: `${opponentInZone.name} intercepts the pass!`
      });

      return { success: false, intercepted: true };
    }
  }

  /**
   * Resolve a shot attempt
   * @param {Object} params - Shot parameters
   * @param {import('./player.js').Player} params.shooter - Shooting player
   * @param {import('./player.js').Player} params.opponentGK - Opponent goalkeeper
   * @param {Object} [params.context={}] - Additional context
   * @param {boolean} [params.context.useSuperMove=false] - Use super move
   * @returns {{goal: boolean, saved: boolean}}
   */
  resolveShot({ shooter, opponentGK, context = {} }) {
    const useSuperMove = context.useSuperMove || false;
    const teamId = this.state.currentTeamId;
    const opponentId = teamId === 'A' ? 'B' : 'A';

    // Check for counter-attack bonus
    const isCounterAttack = 
      this.state.ball.lastEvent === 'INTERCEPT' && 
      this.state.ball.zone >= Zones.MIDFIELD;
    const counterAttackBonus = isCounterAttack ? 5 : 0;

    // Attempt to use super move if requested
    let superMoveBonus = 0;
    if (useSuperMove && this.superMove.use(teamId)) {
      superMoveBonus = 10;
    }

    // Contest: Shoot vs Power
    const result = contest({
      rng: this.rng,
      attacker: shooter,
      defender: opponentGK,
      attackerAttr: 'shoot',
      defenderAttr: 'power',
      fatigueTracker: this.fatigue,
      maybeSuperMove: superMoveBonus,
      maybeCounterAttack: counterAttackBonus
    });

    // Goal if shooter wins by 5 or more
    if (result.diff >= 5) {
      this.state.addGoal(teamId);
      
      this.logEvent({
        type: 'GOAL',
        teamId,
        playerId: shooter.id,
        playerName: shooter.name,
        zone: Zones.ATTACK,
        defenderId: opponentGK.id,
        defenderName: opponentGK.name,
        contestResult: result,
        outcome: 'GOAL',
        description: `⚽ GOAL! ${shooter.name} scores! ${this.state.getScoreSummary()}`
      });

      // Reset possession after goal
      this.resetAfterGoal(opponentId);

      return { goal: true, saved: false };
    } else {
      // Save - GK's team gets possession at Defense
      this.logEvent({
        type: 'SAVE',
        teamId: opponentId,
        playerId: opponentGK.id,
        playerName: opponentGK.name,
        zone: Zones.DEFENSE,
        contestResult: result,
        outcome: 'SAVE',
        description: `${opponentGK.name} saves the shot!`
      });

      this.possessionTo(opponentId, Zones.DEFENSE);

      return { goal: false, saved: true };
    }
  }

  /**
   * Swap possession at same field area (for interceptions)
   * @param {import('./player.js').Player} [interceptor] - Player who intercepted
   */
  swapPossessionAtSameZone(interceptor) {
    const newTeamId = this.state.currentTeamId === 'A' ? 'B' : 'A';
    // Zone stays the same (same area of field, but now from perspective of new team)
    this.state.ball.changePossession(newTeamId, this.state.ball.zone, 'INTERCEPT');
    this.state.currentTeamId = newTeamId;
    
    // Increment possession count for the new team when they get the ball
    this.state.incrementPossession(newTeamId);
  }

  /**
   * Direct possession change
   * @param {string} teamId - Team to give possession to
   * @param {number} zone - Zone to start at
   */
  possessionTo(teamId, zone) {
    this.state.ball.changePossession(teamId, zone, 'POSSESSION_CHANGE');
    this.state.currentTeamId = teamId;
    
    // Increment possession count for the new team
    this.state.incrementPossession(teamId);
  }

  /**
   * Reset after a goal is scored
   * @param {string} teamId - Team to receive kickoff
   */
  resetAfterGoal(teamId) {
    this.state.ball.reset(teamId);
    this.state.currentTeamId = teamId;
    // Note: Don't increment possession here as it's already been counted
  }

  /**
   * Check if match should end
   * @returns {boolean} True if match should end
   */
  checkWinCondition() {
    // If forcing a full match, skip early win conditions
    if (this.state.forceFullMatch) return false;

    // Win condition 1: First to score
    if (this.state.score.A > 0 || this.state.score.B > 0) {
      const winner = this.state.score.A > this.state.score.B ? 'A' : 'B';
      this.state.finish(winner, 'First to score');
      this.logEvent({
        type: 'MATCH_END',
        teamId: winner,
        zone: this.state.ball.zone,
        outcome: 'WIN',
        description: `Match over! ${this.teams[winner].name} wins ${this.state.score[winner]}-${this.state.score[winner === 'A' ? 'B' : 'A']}!`
      });
      return true;
    }

    // Win condition 2: After 3 possessions
    if (this.state.possessionCount.total >= 3) {
      if (this.state.score.A === this.state.score.B) {
        this.state.finish(null, 'Draw after 3 possessions');
        this.logEvent({
          type: 'MATCH_END',
          teamId: null,
          zone: this.state.ball.zone,
          outcome: 'DRAW',
          description: `Match over! Draw ${this.state.score.A}-${this.state.score.B} after 3 possessions.`
        });
      } else {
        const winner = this.state.score.A > this.state.score.B ? 'A' : 'B';
        this.state.finish(winner, 'Most goals after 3 possessions');
        this.logEvent({
          type: 'MATCH_END',
          teamId: winner,
          zone: this.state.ball.zone,
          outcome: 'WIN',
          description: `Match over! ${this.teams[winner].name} wins ${this.state.score[winner]}-${this.state.score[winner === 'A' ? 'B' : 'A']} after 3 possessions!`
        });
      }
      return true;
    }

    return false;
  }

  /**
   * Check if match is finished
   * @returns {boolean}
   */
  isFinished() {
    return this.state.finished;
  }

  /**
   * Log an event
   * @param {Partial<import('../types/typedefs.js').GameEvent>} event - Event data
   */
  logEvent(event) {
    this.state.addLog({
      timestamp: Date.now(),
      ...event
    });
  }

  /**
   * Get goalkeeper for a team
   * @param {string} teamId - Team ID
   * @returns {import('./player.js').Player}
   */
  getGoalkeeper(teamId) {
    return this.teams[teamId].getGoalkeeper();
  }

  /**
   * Check if super move can be used
   * @param {string} teamId - Team ID
   * @returns {boolean}
   */
  canUseSuperMove(teamId) {
    return this.superMove.canUse(teamId);
  }

  /**
   * Get zone name
   * @param {number} zone - Zone number
   * @returns {string}
   */
  zoneName(zone) {
    return zoneName(zone);
  }

  /**
   * Get match summary
   * @returns {string}
   */
  getMatchSummary() {
    if (!this.state) return 'No match started';
    
    const lines = [
      `=== MATCH SUMMARY ===`,
      `${this.teams.A.name} vs ${this.teams.B.name}`,
      ``,
      `Final Score: ${this.state.getScoreSummary()}`,
      `${this.state.getPossessionSummary()}`,
      ``
    ];

    if (this.state.finished) {
      if (this.state.winner) {
        lines.push(`Winner: ${this.teams[this.state.winner].name}`);
      } else {
        lines.push(`Result: Draw`);
      }
      lines.push(`Reason: ${this.state.winReason}`);
    }

    return lines.join('\n');
  }
}
