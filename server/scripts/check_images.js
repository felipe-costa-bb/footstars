
import { getAllPlayers } from '../src/infrastructure/db/scraper_schema.js';

const players = getAllPlayers({ limit: 5 });
console.log('Checking image_url for first 5 players:');
players.forEach(p => {
    console.log(`${p.real_name}: ${p.image_url}`);
});
