/**
 * Zone constants for the soccer field
 * @readonly
 * @enum {number}
 */
export const Zones = Object.freeze({
  GK: 0,
  DEFENSE: 1,
  MIDFIELD: 2,
  ATTACK: 3
});

/**
 * Zone names for display
 * @readonly
 */
export const ZoneNames = Object.freeze({
  [Zones.GK]: 'Goalkeeper',
  [Zones.DEFENSE]: 'Defense',
  [Zones.MIDFIELD]: 'Midfield',
  [Zones.ATTACK]: 'Attack'
});

/**
 * Get the next zone in progression
 * @param {number} zone - Current zone
 * @returns {number} Next zone (capped at ATTACK)
 */
export function nextZone(zone) {
  return Math.min(zone + 1, Zones.ATTACK);
}

/**
 * Get zone name for display
 * @param {number} zone - Zone number
 * @returns {string} Zone name
 */
export function zoneName(zone) {
  return ZoneNames[zone] || 'Unknown';
}

/**
 * Check if zone is valid
 * @param {number} zone - Zone to check
 * @returns {boolean} True if valid zone
 */
export function isValidZone(zone) {
  return zone >= Zones.GK && zone <= Zones.ATTACK;
}

/**
 * Map position to zone(s) where players operate
 * @param {'GK'|'DF'|'MF'|'FW'} position - Player position
 * @returns {number[]} Array of zones for this position
 */
export function positionToZones(position) {
  switch (position) {
    case 'GK':
      return [Zones.GK];
    case 'DF':
      return [Zones.DEFENSE];
    case 'MF':
      return [Zones.MIDFIELD];
    case 'FW':
      return [Zones.ATTACK];
    default:
      return [];
  }
}
