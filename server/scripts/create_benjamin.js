
import { db } from '../src/infrastructure/db/sqlite.js';

console.log("Creating Benjamin Unt...");

const player = {
    ea_player_id: 999002, // Custom ID
    name: "Benjamin Unt",
    overall_rating: 87,
    position: "ST",
    image_url: null, // Face removed by user request
    nationality: "Lithuania",
    team_name: "Man Utd", // Will be mapped to 'Man Utd' in DB which maps to Premier League

    // Game attributes (User provided)
    power: 11,
    shoot: 90, // SHO
    pass: 84,  // PAS
    tackle: 67, // TAC

    // EA attributes (Derived/Inferred)
    shooting: 90,     // Matches shoot
    passing: 84,      // Matches pass
    defending: 67,    // Matches tackle
    dribbling: 85,    // Good dribbling

    // Detailed stats
    detailed_stats: JSON.stringify({
        common_name: "Benjamin Unt",
        height: 185,
        weight: 80,
        birthdate: "01/01/2000",
        // GK stats to average ~11
        gk_diving: 11,
        gk_handling: 11,
        gk_kicking: 11,
        gk_reflexes: 11,
        gk_positioning: 11,
        // Other stats
        finishing: 92,
        short_passing: 84,
        dribbling: 85,
        tackle_stand: 67
    })
};

try {
    const stmt = db.prepare(`
        INSERT INTO base_players 
        (ea_player_id, real_name, display_name, overall_rating, position, image_url, nationality, team_name,
         power, shoot, pass, tackle,
         shooting, passing, defending, dribbling,
         detailed_stats)
        VALUES (
            @ea_player_id, @name, @name, @overall_rating, @position, @image_url, @nationality, @team_name,
            @power, @shoot, @pass, @tackle,
            @shooting, @passing, @defending, @dribbling,
            @detailed_stats
        )
        ON CONFLICT(ea_player_id) DO UPDATE SET
        real_name = @name,
        display_name = @name,
        overall_rating = @overall_rating,
        position = @position,
        image_url = @image_url,
        nationality = @nationality,
        team_name = @team_name,
        power = @power,
        shoot = @shoot,
        pass = @pass,
        tackle = @tackle,
        shooting = @shooting,
        passing = @passing,
        defending = @defending,
        dribbling = @dribbling,
        detailed_stats = @detailed_stats
    `);

    stmt.run(player);
    console.log("Benjamin Unt created/updated successfully!", player);

} catch (err) {
    console.error("Failed to create player:", err);
}
