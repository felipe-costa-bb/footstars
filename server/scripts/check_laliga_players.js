
import { db } from '../src/infrastructure/db/scraper_schema.js';

const laligaTeams = [
    'Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Girona FC',
    'Real Sociedad', 'Athletic Club', 'Valencia CF', 'Sevilla FC'
];

// Construct SQL placeholder string
const placeholders = laligaTeams.map(() => '?').join(',');

const players = db.prepare(`
    SELECT real_name, team_name, overall_rating, 
           shoot, pass, tackle, power
    FROM base_players 
    WHERE team_name IN (${placeholders})
    ORDER BY overall_rating DESC
    LIMIT 20
`).all(...laligaTeams);

console.log('LaLiga Sample:', JSON.stringify(players, null, 2));
