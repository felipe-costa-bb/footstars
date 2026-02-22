
import { db } from '../src/infrastructure/db/scraper_schema.js';

const plTeams = [
    'Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa',
    'Tottenham Hotspur', 'Chelsea', 'Manchester United', 'Newcastle United'
];

// Construct SQL placeholder string: "?, ?, ?"
const placeholders = plTeams.map(() => '?').join(',');

const players = db.prepare(`
    SELECT real_name, team_name, overall_rating, 
           shoot, pass, tackle, power
    FROM base_players 
    WHERE team_name IN (${placeholders})
    ORDER BY overall_rating DESC
    LIMIT 20
`).all(...plTeams);

console.log('Premier League Sample:', JSON.stringify(players, null, 2));
