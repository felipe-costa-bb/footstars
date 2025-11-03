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
  // Get fatigue penalties (consuming them if pending)
  const aFatigue = fatigueTracker.consumePenaltyIfAny(attacker.id);
  const dFatigue = fatigueTracker.consumePenaltyIfAny(defender.id);

  // Get base attributes
  const aBase = attacker.getAttribute(attackerAttr);
  const dBase = defender.getAttribute(defenderAttr);

  // Roll dice
  // Use d10 system now: single d10 for each side
  const aDice = rng.d10();
  const dDice = rng.d10();

  // Instant success/failure rules (attacker's d10)
  // attackerRoll 1 => instant fail, attackerRoll 10 => instant success
  let instant = null; // 'attacker_success' | 'attacker_fail' | null
  if (aDice === 10) instant = 'attacker_success';
  if (aDice === 1) instant = 'attacker_fail';

  // Calculate totals
  const aRoll = aBase + aDice + aFatigue + maybeSuperMove + maybeCounterAttack;
  const dRoll = dBase + dDice + dFatigue;

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
        total: aRoll
      },
      defender: {
        base: dBase,
        dice: dDice,
        fatigue: dFatigue,
        superMove: 0,
        counterAttack: 0,
        total: dRoll
      }
    }
  };

  // Mark participation for both players (for future fatigue tracking)
  fatigueTracker.markParticipation(attacker.id);
  fatigueTracker.markParticipation(defender.id);

  // If instant success/fail happened, adjust diff accordingly for clarity
  if (instant === 'attacker_success') {
    result.diff = Infinity; // signify instant success
  } else if (instant === 'attacker_fail') {
    result.diff = -Infinity; // signify instant fail
  }

  return result;
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
  aStr += ` = ${a.total}`;

  let dStr = `${defenderName}: ${d.base} (base) + ${d.dice} (dice)`;
  if (d.fatigue !== 0) dStr += ` ${d.fatigue} (fatigue)`;
  dStr += ` = ${d.total}`;

  const outcome = result.diff > 0 ? `${attackerName} wins by ${result.diff}` :
                  result.diff < 0 ? `${defenderName} wins by ${Math.abs(result.diff)}` :
                  'TIE';

  return `${aStr}\n${dStr}\nResult: ${outcome}`;
}
