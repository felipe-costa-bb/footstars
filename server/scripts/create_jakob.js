
import { db } from '../src/infrastructure/db/sqlite.js';

console.log("Creating Jakob Toover...");

const player = {
    ea_player_id: 999001, // Custom ID
    name: "Jakob Toover",
    overall_rating: 85,
    position: "CAM",
    image_url: null, // No specific image
    nationality: "Estonia",
    team_name: "Al Nassr",

    // Game attributes (User provided)
    power: 9,
    shoot: 84,
    pass: 80,
    tackle: 83,

    // EA attributes (Derived/Inferred)
    shooting: 84,     // Matches shoot
    passing: 80,      // Matches pass
    defending: 83,    // Matches tackle
    dribbling: 86,    // Reasonable for CAM

    // Detailed stats
    detailed_stats: JSON.stringify({
        common_name: "Jakob Toover",
        height: 180,
        weight: 75,
        birthdate: "01/01/2000",
        // GK stats to average ~9
        gk_diving: 9,
        gk_handling: 9,
        gk_kicking: 9,
        gk_reflexes: 9,
        gk_positioning: 9,
        // Other stats
        finishing: 84,
        short_passing: 80,
        dribbling: 86,
        tackle_stand: 83
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
    console.log("Jakob Toover created/updated successfully!", player);

} catch (err) {
    console.error("Failed to create player:", err);
}
