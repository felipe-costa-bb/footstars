/**
 * Resolve a contest between an attacker and defender
 * @param {Object} params - Contest parameters
 * @param {import('../rules/rng.js').RNG} params.rng - Random number generator
 * @param {import('./player.js').Player} params.attacker - Attacking player
 * @param {import('./player.js').Player} params.defender - Defending player
 * @param {'power'|'shoot'|'tackle'|'pass'} params.attackerAttr - Attribute for attacker
 * @param {'power'|'shoot'|'tackle'|'pass'} params.defenderAttr - Attribute for defender
 * @param {import('../rules/fatigue.js').FatigueTracker} params.fatigueTracker - Fatigue tracker
 * @param {number} [params.maybeSuperMove=0] - Super Move bonus (+10 if used)
 * @param {number} [params.maybeCounterAttack=0] - Counter-attack bonus (+5 if applicable)
 * @returns {import('../types/typedefs.js').ContestResult} Contest result
 */
import { isCompatible, getNaturalRole } from './team.js';

/**
 * Resolve a contest between an attacker and defender
 * ...
 */
export function contest({
  rng,
  attacker,
  defender,
  attackerAttr,
  defenderAttr,
  fatigueTracker,
  maybeSuperMove = 0,
  maybeCounterAttack = 0
}) {
  // Get fatigue penalties
  const aFatigue = fatigueTracker.consumePenaltyIfAny(attacker.id);
  const dFatigue = fatigueTracker.consumePenaltyIfAny(defender.id);

  // Position Penalties (OOP)
  let aPenalty = 0;
  if (attacker.assignedSlot && !isCompatible(attacker.position, attacker.assignedSlot)) {
    aPenalty = getOutOfPositionModifier(attacker, attackerAttr);
  }

  let dPenalty = 0;
  if (defender.assignedSlot && !isCompatible(defender.position, defender.assignedSlot)) {
    dPenalty = getOutOfPositionModifier(defender, defenderAttr);
  }

  // Get base attributes
  const aBase = attacker.getAttribute(attackerAttr);
  const dBase = defender.getAttribute(defenderAttr);

  // Roll dice
  const aDice = rng.d10();
  const dDice = rng.d10();

  // Instant success/failure checks...
  let instant = null;
  if (aDice === 10) instant = 'attacker_success';
  if (aDice === 1) instant = 'attacker_fail';

  // Calculate totals
  const aRoll = aBase + aDice + aFatigue + maybeSuperMove + maybeCounterAttack + aPenalty;
  const dRoll = dBase + dDice + dFatigue + dPenalty;

  // Mark participation for both players (for future fatigue tracking)
  fatigueTracker.markParticipation(attacker.id);
  fatigueTracker.markParticipation(defender.id);

  const result = {
    aRoll,
    dRoll,
    diff: aRoll - dRoll,
    instant,
    breakdown: {
      attacker: {
        base: aBase,
        dice: aDice,
        fatigue: aFatigue,
        superMove: maybeSuperMove,
        counterAttack: maybeCounterAttack,
        penalty: aPenalty,
        total: aRoll
      },
      defender: {
        base: dBase,
        dice: dDice,
        fatigue: dFatigue,
        superMove: 0,
        counterAttack: 0,
        penalty: dPenalty,
        total: dRoll
      }
    }
  };

  // If instant success/fail happened, adjust diff accordingly for clarity
  if (instant === 'attacker_success') {
    result.diff = Infinity; // signify instant success
  } else if (instant === 'attacker_fail') {
    result.diff = -Infinity; // signify instant fail
  }

  return result;
}

/**
 * Calculate modifier for player being out of position
 * @param {import('./player.js').Player} player 
 * @param {string} attribute 
 * @returns {number} Modifier (negative for penalty, positive for bonus)
 */
function getOutOfPositionModifier(player, attribute) {
  const naturalRole = getNaturalRole(player.position);
  const assignedCategory = player.assignedPosition; // 'GK', 'DF', 'MF', 'FW'

  // Granular logic for Forwards
  if (naturalRole === 'FW') {
    if (assignedCategory === 'FW') {
      // Other FW position (e.g. ST in LW)
      if (attribute === 'shoot') return -5;
      return 0; // No other penalty mentioned
    }
    if (assignedCategory === 'MF') {
      if (attribute === 'shoot') return -10;
      if (attribute === 'pass') return 8; // Updated from 5
      return 0;
    }
    if (assignedCategory === 'DF') {
      if (attribute === 'shoot') return -15;
      if (attribute === 'tackle') return 8; // Updated from 5
      return 0;
    }
    if (assignedCategory === 'GK') {
      if (attribute === 'shoot') return -20;
      if (attribute === 'power') return 15; // Updated from 5
      if (attribute === 'pass') return 10; // Updated from 5
      return 0;
    }
    return 0;
  }

  // Granular logic for Midfielders
  if (naturalRole === 'MF') {
    if (assignedCategory === 'MF') {
      // Incompatible MF position (e.g. CDM vs CAM if not compatible)
      // Note: isCompatible check is done before calling this, so if we are here, it IS incompatible
      if (attribute === 'pass') return -5;
      return 0;
    }
    if (assignedCategory === 'FW') {
      if (attribute === 'pass') return -10;
      if (attribute === 'shoot') return 7;
      return 0;
    }
    if (assignedCategory === 'DF') {
      if (attribute === 'pass') return -10;
      if (attribute === 'tackle') return 7;
      return 0;
    }
    if (assignedCategory === 'GK') {
      if (attribute === 'pass') return -5;
      if (attribute === 'power') return 15;
      return 0;
    }
    return 0;
  }

  // Granular logic for Defenders
  if (naturalRole === 'DF') {
    if (assignedCategory === 'DF') {
      // Incompatible DF position (e.g. CB in LB if incompatible)
      if (attribute === 'tackle') return -5;
      return 0;
    }
    if (assignedCategory === 'FW') {
      if (attribute === 'tackle') return -10;
      if (attribute === 'shoot') return 7;
      return 0;
    }
    if (assignedCategory === 'MF') {
      if (attribute === 'tackle') return -5;
      if (attribute === 'pass') return 7;
      return 0;
    }
    if (assignedCategory === 'GK') {
      if (attribute === 'tackle') return -5;
      if (attribute === 'power') return 15;
      if (attribute === 'pass') return 10;
      return 0;
    }
    return 0;
  }

  // Granular logic for Goalkeepers
  if (naturalRole === 'GK') {
    if (assignedCategory === 'GK') {
      return 0;
    }
    if (assignedCategory === 'FW') {
      if (attribute === 'power') return -20;
      if (attribute === 'shoot') return 15;
      return 0;
    }
    if (assignedCategory === 'MF') {
      if (attribute === 'power') return -20;
      if (attribute === 'pass') return 5;
      return 0;
    }
    if (assignedCategory === 'DF') {
      if (attribute === 'power') return -20;
      if (attribute === 'shoot') return 15;
      return 0;
    }
    return 0;
  }

  // Default legacy behavior for non-FW/non-MF/non-DF/non-GK (shouldn't really happen if all roles covered)
  return -10;
}

/**
 * Format contest result for display
 * @param {import('../types/typedefs.js').ContestResult} result - Contest result
 * @param {string} attackerName - Attacker name
 * @param {string} defenderName - Defender name
 * @returns {string} Formatted string
 */
export function formatContestResult(result, attackerName, defenderName) {
  const { breakdown } = result;
  const a = breakdown.attacker;
  const d = breakdown.defender;

  let aStr = `${attackerName}: ${a.base} (base) + ${a.dice} (dice)`;
  if (a.fatigue !== 0) aStr += ` ${a.fatigue} (fatigue)`;
  if (a.superMove !== 0) aStr += ` +${a.superMove} (SUPER MOVE)`;
  if (a.counterAttack !== 0) aStr += ` +${a.counterAttack} (COUNTER-ATTACK)`;
  if (a.penalty !== 0) aStr += ` ${a.penalty > 0 ? '+' : ''}${a.penalty} (position)`;
  aStr += ` = ${a.total}`;

  let dStr = `${defenderName}: ${d.base} (base) + ${d.dice} (dice)`;
  if (d.fatigue !== 0) dStr += ` ${d.fatigue} (fatigue)`;
  if (d.penalty !== 0) dStr += ` ${d.penalty > 0 ? '+' : ''}${d.penalty} (position)`;
  dStr += ` = ${d.total}`;

  let outcome;
  if (result.diff > 0) {
    outcome = `${attackerName} wins by ${result.diff === Infinity ? 'INSTANT' : result.diff}`;
  } else if (result.diff < 0) {
    outcome = `${defenderName} wins by ${result.diff === -Infinity ? 'INSTANT' : Math.abs(result.diff)}`;
  } else {
    outcome = 'TIE';
  }

  return `${aStr}\n${dStr}\nResult: ${outcome}`;
}
