
import { db } from '../src/infrastructure/db/scraper_schema.js';

const players = db.prepare("SELECT ea_player_id, display_name, image_url FROM base_players WHERE ea_player_id IN ('custom_bento_001', 'custom_jakob_001')").all();
console.log('--- Base Players ---');
players.forEach(p => console.log(p.ea_player_id, p.display_name, p.image_url));

try {
    const appPlayers = db.prepare("SELECT id, name, imageUrl FROM players WHERE name LIKE '%Bento%' OR name LIKE '%Jakob%'").all();
    console.log('--- App Players (if exists) ---');
    appPlayers.forEach(p => console.log(p.id, p.name, p.imageUrl));
} catch (e) {
    console.log('App players table not found or different schema.');
}
