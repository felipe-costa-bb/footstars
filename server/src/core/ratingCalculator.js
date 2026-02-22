/**
 * Rating Calculator
 * Calculates Overall Rating (OVR) for a player in a specific position
 * Based on weighted attributes relevant to that position.
 */

const POSITION_WEIGHTS = {
    // Attackers
    'ST': { shoot: 0.45, dribbling: 0.25, power: 0.15, pass: 0.10, tackle: 0.05 },
    'CF': { shoot: 0.35, dribbling: 0.30, pass: 0.20, power: 0.10, tackle: 0.05 },
    'LW': { dribbling: 0.40, shoot: 0.25, pass: 0.20, power: 0.10, tackle: 0.05 },
    'RW': { dribbling: 0.40, shoot: 0.25, pass: 0.20, power: 0.10, tackle: 0.05 },

    // Midfielders
    'CAM': { pass: 0.35, dribbling: 0.30, shoot: 0.20, power: 0.10, tackle: 0.05 },
    'CM': { pass: 0.30, dribbling: 0.25, tackle: 0.15, shoot: 0.15, power: 0.15 },
    'CDM': { tackle: 0.40, pass: 0.25, power: 0.20, dribbling: 0.10, shoot: 0.05 },
    'LM': { dribbling: 0.35, pass: 0.30, shoot: 0.15, power: 0.10, tackle: 0.10 },
    'RM': { dribbling: 0.35, pass: 0.30, shoot: 0.15, power: 0.10, tackle: 0.10 },

    // Defenders
    'CB': { tackle: 0.45, power: 0.30, pass: 0.10, dribbling: 0.10, shoot: 0.05 },
    'LB': { tackle: 0.35, dribbling: 0.25, pass: 0.20, power: 0.15, shoot: 0.05 },
    'RB': { tackle: 0.35, dribbling: 0.25, pass: 0.20, power: 0.15, shoot: 0.05 },
    'LWB': { dribbling: 0.30, tackle: 0.30, pass: 0.25, power: 0.10, shoot: 0.05 },
    'RWB': { dribbling: 0.30, tackle: 0.30, pass: 0.25, power: 0.10, shoot: 0.05 },

    // Goalkeeper
    'GK': { power: 0.90, pass: 0.05, tackle: 0.05, shoot: 0.0, dribbling: 0.0 }
};

/**
 * Calculate ratings for all positions for a given player
 * @param {Object} player - Player object with stats (shoot, pass, dribbling, tackle, power)
 * @returns {Object} - Map of position -> rating
 */
export const calculateRatings = (player) => {
    const ratings = {};

    // Ensure we have base stats (default to 50 if missing)
    const stats = {
        shoot: player.shoot || player.shooting || 50,
        pass: player.pass || player.passing || 50,
        dribbling: player.dribbling || 50,
        tackle: player.tackle || player.defending || 50,
        power: player.power || 50 // GK stats are often mapped to 'power' in this game design
    };

    // Special detailed stats handling if available (some cards might have raw EA attributes)
    if (player.detailedStats || player.detailed_stats) {
        try {
            const ds = typeof player.detailedStats === 'string' ? JSON.parse(player.detailedStats) : (player.detailedStats || player.detailed_stats);
            // If we wanted to get crazy with specific stats we could, but let's stick to the 5-stat model for now
            // to keep it consistent with the existing game loop.
        } catch (e) {
            // ignore
        }
    }

    for (const [pos, weights] of Object.entries(POSITION_WEIGHTS)) {
        let weightedSum = 0;

        weightedSum += stats.shoot * weights.shoot;
        weightedSum += stats.pass * weights.pass;
        weightedSum += stats.dribbling * weights.dribbling;
        weightedSum += stats.tackle * weights.tackle;
        weightedSum += stats.power * weights.power;

        // Round to nearest integer
        ratings[pos] = Math.round(weightedSum);
    }

    // Ensure the player's "natural" position rating is at least their official OVR
    // This prevents a case where our formula yields 88 but their card says 90.
    if (ratings[player.position]) {
        // If our calculated rating is significantly lower than their official rating, 
        // we might need to boost it or trust the official rating.
        // Let's trust the official rating for the natural position to match the card face.
        ratings[player.position] = Math.max(ratings[player.position], player.overallRating || player.overall_rating || 0);
    }

    return ratings;
};

export default calculateRatings;
