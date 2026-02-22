
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Finding Bento Info ---');

const name = 'Bento';

// Try to find by name likeness
const allPlayers = db.prepare("SELECT * FROM base_players").all();

const matches = allPlayers.filter(p =>
    (p.ea_player_id === 'custom_bento_001') ||
    (p.display_name && p.display_name.toLowerCase().includes(name.toLowerCase()))
);

if (matches.length > 0) {
    console.log(`Found ${matches.length} matches for "${name}":`);
    matches.forEach(m => {
        console.log(`- ID: ${m.ea_player_id}, Name: ${m.display_name}, Team: ${m.team_name}, Nat: ${m.nationality}, Image: ${m.image_url}`);
    });
} else {
    console.log(`No matches for "${name}"`);
}
