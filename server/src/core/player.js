/**
 * Player class representing a soccer player with attributes
 */
export class Player {
  /**
   * @param {import('../types/typedefs.js').PlayerData} data - Player data
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.position = data.position;
    this.imageUrl = data.imageUrl || null;
    this.attributes = { ...data.attributes };

    // Preserve metadata for card display
    this.overallRating = data.overallRating || 0;
    this.team = data.team || null;
    this.nationality = data.nationality || null;
    this.league = data.league || null;
    this.playerId = data.playerId || data.id;
    this.gainedAt = data.gainedAt || null;

    // Preserve flat stats for compatibility
    this.power = data.power || this.attributes.power;
    this.shoot = data.shoot || this.attributes.shoot;
    this.pass = data.pass || this.attributes.pass;
    this.tackle = data.tackle || this.attributes.tackle;

    this.validate();
  }

  /**
   * Validate player data
   * @throws {Error} If player data is invalid
   */
  validate() {
    if (!this.id) {
      throw new Error('Player must have an id');
    }
    if (!this.name) {
      throw new Error('Player must have a name');
    }
    const validPositions = [
      'GK',
      'CB', 'LB', 'RB', 'LWB', 'RWB',
      'CDM', 'CM', 'CAM', 'LM', 'RM',
      'LW', 'RW', 'ST', 'CF'
    ];
    if (!validPositions.includes(this.position)) {
      throw new Error(`Invalid position: ${this.position}`);
    }

    const requiredAttrs = ['power', 'shoot', 'tackle', 'pass'];
    for (const attr of requiredAttrs) {
      if (typeof this.attributes[attr] !== 'number') {
        throw new Error(`Player ${this.name} missing attribute: ${attr}`);
      }
      if (this.attributes[attr] < 1 || this.attributes[attr] > 100) {
        throw new Error(`Player ${this.name} attribute ${attr} must be between 1-100`);
      }
    }
  }

  /**
   * Get a specific attribute value
   * @param {'power'|'shoot'|'tackle'|'pass'} attr - Attribute name
   * @returns {number} Attribute value
   */
  getAttribute(attr) {
    return this.attributes[attr] || 0;
  }

  /**
   * Get player display string
   * @returns {string} Player display string
   */
  toString() {
    return `${this.name} (${this.position})`;
  }

  /**
   * Get player info object
   * @returns {Object} Player info
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      imageUrl: this.imageUrl,
      attributes: { ...this.attributes }
    };
  }
}
