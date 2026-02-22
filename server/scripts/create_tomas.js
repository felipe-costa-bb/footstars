
import { db } from '../src/infrastructure/db/sqlite.js';

console.log("Creating Tomás Costa...");

const player = {
    ea_player_id: 999003, // Custom ID
    name: "Tomás Costa",
    overall_rating: 91,
    position: "ST",
    image_url: null, // No specific image yet
    nationality: "Brazil",
    team_name: "Real Madrid",

    // Game attributes (User provided)
    power: 34, // POW
    shoot: 93, // SHO
    pass: 84,  // PAS
    tackle: 68, // TAC

    // EA attributes (Derived/Inferred)
    shooting: 93,     // Matches shoot
    passing: 84,      // Matches pass
    defending: 68,    // Matches tackle
    dribbling: 90,    // High dribbling for OVR 91 ST

    // Detailed stats
    detailed_stats: JSON.stringify({
        common_name: "Tomás Costa",
        height: 182,
        weight: 78,
        birthdate: "01/01/2004", // Young talent
        // GK stats
        gk_diving: 10,
        gk_handling: 10,
        gk_kicking: 10,
        gk_reflexes: 10,
        gk_positioning: 10,
        // Other stats
        finishing: 94,
        short_passing: 85,
        dribbling: 91,
        tackle_stand: 68,
        shot_power: 34 // Explicitly set if mapped, though typically power is strength/stamina
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
    console.log("Tomás Costa created/updated successfully!", player);

} catch (err) {
    console.error("Failed to create player:", err);
}
