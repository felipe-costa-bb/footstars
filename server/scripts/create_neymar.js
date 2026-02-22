
import { dbRequest } from '../src/infrastructure/db/repository.js';
import { db } from '../src/infrastructure/db/sqlite.js';

console.log("Creating Neymar Jr...");

const neymar = {
    ea_player_id: 190871,
    name: "Neymar Jr",
    overall_rating: 88,
    position: "LW",
    image_url: "https://ratings-images-prod.ea.com/common/fc25/players/190871.png",
    // Core attributes mapped to game
    shooting: 80,  // SHO
    passing: 85,   // PAS
    defending: 37, // TAC
    power: 10,     // POW (Target)

    // Other attributes (fillers based on real life)
    pace: 86,
    dribbling: 93,
    physicality: 60,

    // Detailed stats JSON to enforce Power = 10 (average of GK stats)
    detailed_stats: JSON.stringify({
        common_name: "Neymar Jr",
        height: 175,
        weight: 68,
        birthdate: "05/02/1992",
        // Force GK stats to average to 10
        gk_diving: 10,
        gk_handling: 10,
        gk_kicking: 10,
        gk_reflexes: 10,
        gk_positioning: 10,
        // Other stats
        finishing: 83,
        short_passing: 85,
        dribbling: 94,
        tackle_stand: 37
    })
};

try {
    const stmt = db.prepare(`
        INSERT INTO base_players 
        (ea_player_id, name, overall_rating, position, image_url, shooting, passing, defending, power, pace, dribbling, physicality, detailed_stats)
        VALUES (@ea_player_id, @name, @overall_rating, @position, @image_url, @shooting, @passing, @defending, @power, @pace, @dribbling, @physicality, @detailed_stats)
        ON CONFLICT(ea_player_id) DO UPDATE SET
        name = @name,
        overall_rating = @overall_rating,
        position = @position,
        image_url = @image_url,
        shooting = @shooting,
        passing = @passing,
        defending = @defending,
        power = @power,
        pace = @pace,
        dribbling = @dribbling,
        physicality = @physicality,
        detailed_stats = @detailed_stats
    `);

    stmt.run(neymar);
    console.log("Neymar Jr created/updated successfully!", neymar);

} catch (err) {
    console.error("Failed to create Neymar:", err);
}
