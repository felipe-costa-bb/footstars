/**
 * @typedef {Object} PlayerAttributes
 * @property {number} power - Goalkeeper save ability (1-100)
 * @property {number} shoot - Shooting accuracy and power (1-100)
 * @property {number} tackle - Defensive/interception ability (1-100)
 * @property {number} pass - Passing accuracy (1-100)
 */

/**
 * @typedef {Object} PlayerData
 * @property {string} id - Unique player identifier within team
 * @property {string} name - Player name
 * @property {'GK'|'DF'|'MF'|'FW'} position - Player position
 * @property {PlayerAttributes} attributes - Player attributes
 */

/**
 * @typedef {Object} TeamData
 * @property {string} name - Team name
 * @property {PlayerData[]} players - Array of 11 players (1 GK, 4 DF, 4 MF, 2 FW)
 */

/**
 * @typedef {Object} BallStateData
 * @property {string} teamInPossessionId - ID of team with possession ('A' or 'B')
 * @property {number} zone - Current zone (0=GK, 1=DEF, 2=MF, 3=ATT)
 * @property {string} lastEvent - Last event type
 */

/**
 * @typedef {Object} MatchScore
 * @property {number} A - Team A score
 * @property {number} B - Team B score
 */

/**
 * @typedef {Object} PossessionCount
 * @property {number} A - Team A possessions
 * @property {number} B - Team B possessions
 * @property {number} total - Total possessions
 */

/**
 * @typedef {Object} ContestResult
 * @property {number} aRoll - Attacker's total roll
 * @property {number} dRoll - Defender's total roll
 * @property {number} diff - Difference (aRoll - dRoll)
 * @property {Object} breakdown - Detailed breakdown
 * @property {Object} breakdown.attacker - Attacker roll details
 * @property {number} breakdown.attacker.base - Base attribute value
 * @property {number} breakdown.attacker.dice - Dice roll (2d6)
 * @property {number} breakdown.attacker.fatigue - Fatigue penalty
 * @property {number} breakdown.attacker.superMove - Super move bonus
 * @property {number} breakdown.attacker.counterAttack - Counter attack bonus
 * @property {Object} breakdown.defender - Defender roll details
 * @property {number} breakdown.defender.base - Base attribute value
 * @property {number} breakdown.defender.dice - Dice roll (2d6)
 * @property {number} breakdown.defender.fatigue - Fatigue penalty
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} type - Event type (PASS, INTERCEPT, SHOT, SAVE, GOAL)
 * @property {number} timestamp - Event timestamp
 * @property {string} teamId - Acting team ID
 * @property {string} playerId - Acting player ID
 * @property {string} playerName - Acting player name
 * @property {number} zone - Zone where event occurred
 * @property {ContestResult} [contestResult] - Contest result if applicable
 * @property {string} [defenderId] - Defender player ID if applicable
 * @property {string} [defenderName] - Defender player name if applicable
 * @property {string} outcome - Event outcome
 * @property {string} description - Human-readable description
 */

/**
 * @typedef {Object} MatchStateData
 * @property {MatchScore} score - Current score
 * @property {PossessionCount} possessionCount - Possession tracking
 * @property {BallStateData} ball - Ball state
 * @property {string} currentTeamId - Current team in possession ('A' or 'B')
 * @property {GameEvent[]} logs - Event log
 * @property {boolean} finished - Whether match is finished
 * @property {string} [winner] - Winner team ID if finished
 */

export {};
