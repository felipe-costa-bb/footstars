/**
 * Fatigue tracking system for players
 * After participating in 3 contests, a player receives -3 penalty on their next roll
 */
export class FatigueTracker {
  constructor() {
    /**
     * @type {Map<string, {count: number, penaltyPending: boolean}>}
     */
    this.map = new Map();
  }

  /**
   * Mark that a player participated in a contest
   * @param {string} playerId - Player ID
   */
  markParticipation(playerId) {
    const state = this.map.get(playerId) ?? { count: 0, penaltyPending: false };
    
    // If penalty is pending, don't increment count yet (wait for it to be consumed)
    if (state.penaltyPending) {
      return;
    }

    state.count += 1;

    // After 3 participations, flag for penalty
    if (state.count >= 3) {
      state.penaltyPending = true;
      state.count = 0; // Reset counter
    }

    this.map.set(playerId, state);
  }

  /**
   * Consume fatigue penalty if one is pending
   * @param {string} playerId - Player ID
   * @returns {number} Penalty value (-3 if pending, 0 otherwise)
   */
  consumePenaltyIfAny(playerId) {
    const state = this.map.get(playerId) ?? { count: 0, penaltyPending: false };
    
    const penalty = state.penaltyPending ? -3 : 0;
    
    // Clear the pending penalty after consuming
    if (state.penaltyPending) {
      state.penaltyPending = false;
      this.map.set(playerId, state);
    }

    return penalty;
  }

  /**
   * Get current fatigue state for a player (for display/debugging)
   * @param {string} playerId - Player ID
   * @returns {{count: number, penaltyPending: boolean}} Fatigue state
   */
  getState(playerId) {
    return this.map.get(playerId) ?? { count: 0, penaltyPending: false };
  }

  /**
   * Reset all fatigue (for new match)
   */
  reset() {
    this.map.clear();
  }

  /**
   * Get all player states (for debugging)
   * @returns {Object<string, {count: number, penaltyPending: boolean}>}
   */
  getAllStates() {
    const result = {};
    for (const [playerId, state] of this.map.entries()) {
      result[playerId] = { ...state };
    }
    return result;
  }

  /**
   * Check if player has fatigue pending
   * @param {string} playerId - Player ID
   * @returns {boolean} True if penalty will apply on next roll
   */
  hasPenaltyPending(playerId) {
    const state = this.map.get(playerId);
    return state ? state.penaltyPending : false;
  }
}
