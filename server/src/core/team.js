import { Player } from './player.js';

/**
 * Team class representing a soccer team with 11 players
 */
// Formation Definitions (Shared with Frontend Logic)
const FORMATIONS = {
  '4-4-2': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['LM', 'CM', 'CM', 'RM'],
    FW: ['ST', 'ST']
  },
  '4-3-3': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['CM', 'CM', 'CM'],
    FW: ['LW', 'ST', 'RW']
  },
  '5-3-2': {
    DF: ['LWB', 'CB', 'CB', 'CB', 'RWB'],
    MF: ['CM', 'CM', 'CM'],
    FW: ['ST', 'ST']
  },
  '3-5-2': {
    DF: ['CB', 'CB', 'CB'],
    MF: ['LM', 'CDM', 'CM', 'CDM', 'RM'],
    FW: ['ST', 'ST']
  },
  '4-2-4': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['CM', 'CM'],
    FW: ['LW', 'ST', 'ST', 'RW']
  },
  '4-5-1': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['LM', 'CM', 'CM', 'CM', 'RM'],
    FW: ['ST']
  },
  '3-4-3': {
    DF: ['CB', 'CB', 'CB'],
    MF: ['LM', 'CM', 'CM', 'RM'],
    FW: ['LW', 'ST', 'RW']
  },
  // Formations with separate DM and AM rows
  '4-2-3-1': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['CDM', 'CDM'],           // Defensive Midfielders
    AM: ['LM', 'CAM', 'RM'],      // Attacking Midfielders
    FW: ['ST']
  },
  '4-1-4-1': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['CDM'],                  // Single holding midfielder
    AM: ['LM', 'CM', 'CM', 'RM'], // 4 midfielders above
    FW: ['ST']
  },
  '4-3-2-1': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['CM', 'CM', 'CM'],       // 3 central midfielders
    AM: ['CAM', 'CAM'],           // 2 attacking midfielders
    FW: ['ST']
  },
  '3-1-4-2': {
    DF: ['CB', 'CB', 'CB'],
    MF: ['CDM'],                  // Single holding midfielder
    AM: ['LM', 'CM', 'CM', 'RM'], // 4 midfielders
    FW: ['ST', 'ST']
  },
  '4-1-2-1-2': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['LM', 'CDM', 'RM'],
    AM: ['CAM'],
    FW: ['ST', 'ST']
  },
  '4-1-2-1-2 (2)': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['CM', 'CDM', 'CM'],
    AM: ['CAM'],
    FW: ['ST', 'ST']
  },
  '4-2-2-2': {
    DF: ['LB', 'CB', 'CB', 'RB'],
    MF: ['CDM', 'CDM'],
    AM: ['CAM', 'CAM'],
    FW: ['ST', 'ST']
  },
  '5-4-1': {
    DF: ['LWB', 'CB', 'CB', 'CB', 'RWB'],
    MF: ['LM', 'CM', 'CM', 'RM'],
    FW: ['ST']
  },
  '5-2-1-2': {
    DF: ['LWB', 'CB', 'CB', 'CB', 'RWB'],
    MF: ['CM', 'CM'],
    AM: ['CAM'],
    FW: ['ST', 'ST']
  },
  '3-4-1-2': {
    DF: ['CB', 'CB', 'CB'],
    MF: ['LM', 'CM', 'CM', 'RM'],
    AM: ['CAM'],
    FW: ['ST', 'ST']
  },
  '3-4-2-1': {
    DF: ['CB', 'CB', 'CB'],
    MF: ['LM', 'CM', 'CM', 'RM'],
    AM: ['CAM', 'CAM'],
    FW: ['ST']
  }
};

// Compatibility Logic
export function isCompatible(playerPos, slotPos) {
  if (!playerPos || !slotPos) return false;
  if (playerPos === slotPos) return true;

  // Strict Groups (Matching Frontend)
  const compatibility = {
    'GK': [],
    'LB': ['LWB', 'DF'],
    'LWB': ['LB', 'DF'],
    'RB': ['RWB', 'DF'],
    'RWB': ['RB', 'DF'],
    'CB': ['DF'],
    'CDM': ['CM', 'MF'],
    'CM': ['CDM', 'CAM', 'MF'],
    'CAM': ['CM', 'CF', 'MF'],
    'LM': ['LW', 'MF'],
    'RM': ['RW', 'MF'],
    'LW': ['LM', 'FW'], // Strict NO ST
    'RW': ['RM', 'FW'], // Strict NO ST
    'ST': ['CF', 'FW'],
    'CF': ['ST', 'CAM', 'FW']
  };

  return compatibility[slotPos]?.includes(playerPos) || false;
}

/**
 * Get the natural role (GK, DF, MF, FW) for a given specific position
 * @param {string} position - Specific position (e.g. 'ST', 'LB')
 * @returns {'GK'|'DF'|'MF'|'FW'|null} Natural role
 */
export function getNaturalRole(position) {
  if (position === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'DF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'MF';
  if (['LW', 'RW', 'ST', 'CF'].includes(position)) return 'FW';
  return null;
}

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
    this.formation = data.formation || '4-4-2'; // Default
    this.coach = data.coach || null; // Coach object with style, rating, preferred_formation

    // Handle sparse arrays (nulls for empty slots)
    this.players = data.players.map(p => p ? new Player(p) : null);

    this.assignSlots();
    this.applyCoachBonuses();
    this.validateRoster();
  }

  /**
   * Apply bonuses to players based on coach style, rating and formation synergy
   */
  applyCoachBonuses() {
    if (!this.coach) return;

    const rating = this.coach.rating || 3.0;
    const style = this.coach.style;
    const preferredFormation = this.coach.preferred_formation;

    // MAGNITUDE: 5 stars = 1.0 multiplier, down to 1 star = 0.2 multiplier
    // Base bonus for style is +5 at 5 stars.
    const bonusMagnitude = rating / 5.0;

    // Formation Synergy: +2 to all stats if formation matches
    const hasSynergy = this.formation === preferredFormation;
    const synergyBonus = hasSynergy ? 2 : 0;

    this.players.forEach(player => {
      if (!player) return;

      // Apply Style Bonuses
      // Gegenpressing: +4 TACKLE, +2 SHOOT
      // Tiki-Taka: +5 PASS, +2 SHOOT
      // Catenaccio: +5 TACKLE, -1 SHOOT
      // Total Football: +3 PASS, +3 TACKLE
      // Counter Attack: +4 SHOOT, +2 POW

      let styleBonuses = { pass: 0, shoot: 0, tackle: 0, power: 0 };

      if (style === 'Gegenpressing') {
        styleBonuses.tackle = 4 * bonusMagnitude;
        styleBonuses.shoot = 2 * bonusMagnitude;
      } else if (style === 'Tiki-Taka') {
        styleBonuses.pass = 5 * bonusMagnitude;
        styleBonuses.shoot = 2 * bonusMagnitude;
      } else if (style === 'Catenaccio') {
        styleBonuses.tackle = 5 * bonusMagnitude;
        styleBonuses.shoot = -1 * bonusMagnitude;
      } else if (style === 'Total Football') {
        styleBonuses.pass = 3 * bonusMagnitude;
        styleBonuses.tackle = 3 * bonusMagnitude;
      } else if (style === 'Counter Attack') {
        styleBonuses.shoot = 4 * bonusMagnitude;
        styleBonuses.power = 2 * bonusMagnitude;
      }

      // Add synergy
      const totalPass = Math.round(styleBonuses.pass + synergyBonus);
      const totalShoot = Math.round(styleBonuses.shoot + synergyBonus);
      const totalTackle = Math.round(styleBonuses.tackle + synergyBonus);
      const totalPower = Math.round(styleBonuses.power + synergyBonus);

      // Update player attributes
      player.attributes.pass = Math.min(100, Math.max(1, player.attributes.pass + totalPass));
      player.attributes.shoot = Math.min(100, Math.max(1, player.attributes.shoot + totalShoot));
      player.attributes.tackle = Math.min(100, Math.max(1, player.attributes.tackle + totalTackle));
      player.attributes.power = Math.min(100, Math.max(1, player.attributes.power + totalPower));

      // Re-sync flat properties if they exist
      player.pass = player.attributes.pass;
      player.shoot = player.attributes.shoot;
      player.tackle = player.attributes.tackle;
      player.power = player.attributes.power;
    });
  }

  // ...

  assignSlots() {
    const fmt = FORMATIONS[this.formation] || FORMATIONS['4-4-2'];

    let index = 0;

    // 1 GK
    if (this.players[index]) {
      this.players[index].assignedPosition = 'GK';
      this.players[index].assignedSlot = 'GK'; // Specific
    }
    index++;

    // DFs
    if (fmt.DF) {
      for (const slotType of fmt.DF) {
        if (this.players[index]) {
          this.players[index].assignedPosition = 'DF';
          this.players[index].assignedSlot = slotType;
        }
        index++;
      }
    }

    // MFs (Defensive Midfielders in formations with AM)
    if (fmt.MF) {
      for (const slotType of fmt.MF) {
        if (this.players[index]) {
          this.players[index].assignedPosition = 'MF';
          this.players[index].assignedSlot = slotType;
        }
        index++;
      }
    }

    // AMs (Attacking Midfielders - only in formations like 4-2-3-1)
    if (fmt.AM) {
      for (const slotType of fmt.AM) {
        if (this.players[index]) {
          this.players[index].assignedPosition = 'MF'; // Still count as MF for game logic
          this.players[index].assignedSlot = slotType;
        }
        index++;
      }
    }

    // FWs
    if (fmt.FW) {
      for (const slotType of fmt.FW) {
        if (this.players[index]) {
          this.players[index].assignedPosition = 'FW';
          this.players[index].assignedSlot = slotType;
        }
        index++;
      }
    }

    // Bench / Reserves (Anyone else)
    while (this.players[index] || index < this.players.length) {
      if (this.players[index]) {
        this.players[index].assignedPosition = 'SUB';
        this.players[index].assignedSlot = 'SUB';
      }
      index++;
    }
  }

  // ...

  validateRoster() {
    const activePlayers = this.players.filter(p => p !== null);
    if (activePlayers.length < 11 || activePlayers.length > 20) {
      // Relaxed validation for now to allow editing incomplete teams
      // throw new Error(`Team ${this.name} must have between 11 and 20 players (has ${activePlayers.length})`);
    }

    // Check unique IDs
    const ids = new Set(activePlayers.map(p => p.id));
    if (ids.size !== activePlayers.length) {
      throw new Error(`Team ${this.name} has duplicate player IDs`);
    }
  }

  /**
   * Get players by position (now using ASSIGNED position)
   * @param {string} position - Position to filter (GK, DF, MF, FW)
   * @returns {Player[]} Players with that ASSIGNED position
   */
  getPlayersByPosition(position) {
    if (['GK', 'DF', 'MF', 'FW'].includes(position)) {
      return this.players.filter(p => p.assignedPosition === position);
    }
    // Fallback? The engine only requests generic zones.
    return [];
  }

  /**
   * Get the goalkeeper
   * @returns {Player} The goalkeeper
   */
  getGoalkeeper() {
    return this.players.find(p => p.assignedPosition === 'GK');
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
      formation: this.formation,
      playerCount: this.players.length,
      // ... info
    };
  }
}
