
import { getAllPlayers } from '../src/infrastructure/db/scraper_schema.js';

const players = getAllPlayers();
const kane = players.find(p => p.real_name.toLowerCase().includes('kane'));

if (kane) {
    console.log('Found Kane:', JSON.stringify(kane, null, 2));
} else {
    console.log('Kane not found in DB');
}
