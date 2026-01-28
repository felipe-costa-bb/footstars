/**
 * Super Move manager - tracks one-time power boost per team
 * Each team can use Super Move once per match to add +10 to a roll
 */
export class SuperMoveManager {
  constructor() {
    /**
     * @type {Map<string, boolean>}
     */
    this.usedByTeam = new Map();
  }

  /**
   * Check if a team can still use their Super Move
   * @param {string} teamId - Team ID
   * @returns {boolean} True if Super Move is available
   */
  canUse(teamId) {
    return !this.usedByTeam.get(teamId);
  }

  /**
   * Attempt to use Super Move for a team
   * @param {string} teamId - Team ID
   * @returns {boolean} True if Super Move was successfully used
   */
  use(teamId) {
    if (this.canUse(teamId)) {
      this.usedByTeam.set(teamId, true);
      return true;
    }
    return false;
  }

  /**
   * Check if team has already used Super Move
   * @param {string} teamId - Team ID
   * @returns {boolean} True if already used
   */
  hasUsed(teamId) {
    return this.usedByTeam.get(teamId) === true;
  }

  /**
   * Reset all Super Moves (for new match)
   */
  reset() {
    this.usedByTeam.clear();
  }

  /**
   * Get status for all teams (for debugging)
   * @returns {Object<string, boolean>} Super Move usage status
   */
  getAllStates() {
    const result = {};
    for (const [teamId, used] of this.usedByTeam.entries()) {
      result[teamId] = used;
    }
    return result;
  }
}
