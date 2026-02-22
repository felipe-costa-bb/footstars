
import { getAllPlayers } from '../src/infrastructure/db/scraper_schema.js';

const players = getAllPlayers();
// Filter safely for Neymar
const neymar = players.find(p => p && p.name && p.name.includes('Neymar'));

if (neymar) {
    console.log('Found Neymar:', JSON.stringify(neymar, null, 2));
} else {
    console.log('Neymar not found');
}
