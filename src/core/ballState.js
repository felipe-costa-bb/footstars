import { Zones } from './zones.js';

/**
 * Ball state tracking
 */
export class BallState {
  /**
   * @param {string} teamInPossessionId - Team ID with possession
   * @param {number} [zone=Zones.GK] - Starting zone
   */
  constructor(teamInPossessionId, zone = Zones.GK) {
    this.teamInPossessionId = teamInPossessionId;
    this.zone = zone;
    this.lastEvent = 'KICKOFF';
  }

  /**
   * Update ball position
   * @param {number} newZone - New zone
   * @param {string} [event='MOVE'] - Event type
   */
  moveTo(newZone, event = 'MOVE') {
    this.zone = newZone;
    this.lastEvent = event;
  }

  /**
   * Change possession
   * @param {string} newTeamId - New team ID
   * @param {number} [zone] - New zone (optional, keeps current if not provided)
   * @param {string} [event='TURNOVER'] - Event type
   */
  changePossession(newTeamId, zone, event = 'TURNOVER') {
    this.teamInPossessionId = newTeamId;
    if (zone !== undefined) {
      this.zone = zone;
    }
    this.lastEvent = event;
  }

  /**
   * Get current state
   * @returns {import('../types/typedefs.js').BallStateData}
   */
  getState() {
    return {
      teamInPossessionId: this.teamInPossessionId,
      zone: this.zone,
      lastEvent: this.lastEvent
    };
  }

  /**
   * Load state
   * @param {import('../types/typedefs.js').BallStateData} state - State to load
   */
  loadState(state) {
    this.teamInPossessionId = state.teamInPossessionId;
    this.zone = state.zone;
    this.lastEvent = state.lastEvent;
  }

  /**
   * Check if in attack zone
   * @returns {boolean}
   */
  isInAttackZone() {
    return this.zone === Zones.ATTACK;
  }

  /**
   * Reset to kickoff position (after goal)
   * @param {string} teamId - Team starting with ball
   */
  reset(teamId) {
    this.teamInPossessionId = teamId;
    this.zone = Zones.MIDFIELD;
    this.lastEvent = 'KICKOFF';
  }
}
