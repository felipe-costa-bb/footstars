import { Player } from './player.js';

/**
 * Team class representing a soccer team with 11 players
 */
export class Team {
  /**
   * @param {string} id - Team ID ('A' or 'B')
   * @param {import('../types/typedefs.js').TeamData} data - Team data
   */
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.players = data.players.map(p => new Player(p));
    
    this.validateRoster();
  }

  /**
   * Validate team roster composition
   * @throws {Error} If roster is invalid
   */
  validateRoster() {
    if (this.players.length !== 11) {
      throw new Error(`Team ${this.name} must have exactly 11 players (has ${this.players.length})`);
    }

    // Check position requirements
    const positions = {
      GK: this.players.filter(p => p.position === 'GK').length,
      DF: this.players.filter(p => p.position === 'DF').length,
      MF: this.players.filter(p => p.position === 'MF').length,
      FW: this.players.filter(p => p.position === 'FW').length
    };

    if (positions.GK !== 1) {
      throw new Error(`Team ${this.name} must have exactly 1 GK (has ${positions.GK})`);
    }
    if (positions.DF !== 4) {
      throw new Error(`Team ${this.name} must have exactly 4 DF (has ${positions.DF})`);
    }
    if (positions.MF !== 4) {
      throw new Error(`Team ${this.name} must have exactly 4 MF (has ${positions.MF})`);
    }
    if (positions.FW !== 2) {
      throw new Error(`Team ${this.name} must have exactly 2 FW (has ${positions.FW})`);
    }

    // Check unique IDs
    const ids = new Set(this.players.map(p => p.id));
    if (ids.size !== this.players.length) {
      throw new Error(`Team ${this.name} has duplicate player IDs`);
    }
  }

  /**
   * Get players by position
   * @param {'GK'|'DF'|'MF'|'FW'} position - Position to filter
   * @returns {Player[]} Players with that position
   */
  getPlayersByPosition(position) {
    return this.players.filter(p => p.position === position);
  }

  /**
   * Get the goalkeeper
   * @returns {Player} The goalkeeper
   */
  getGoalkeeper() {
    return this.players.find(p => p.position === 'GK');
  }

  /**
   * Find player by ID
   * @param {string} id - Player ID
   * @returns {Player|undefined} Player if found
   */
  findPlayerById(id) {
    return this.players.find(p => p.id === id);
  }

  /**
   * Get all players
   * @returns {Player[]} All players
   */
  getAllPlayers() {
    return [...this.players];
  }

  /**
   * Get team info
   * @returns {Object} Team info
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      playerCount: this.players.length,
      positions: {
        GK: this.getPlayersByPosition('GK').length,
        DF: this.getPlayersByPosition('DF').length,
        MF: this.getPlayersByPosition('MF').length,
        FW: this.getPlayersByPosition('FW').length
      }
    };
  }
}
