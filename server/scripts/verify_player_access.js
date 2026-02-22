
import { cardManager } from '../src/core/cardManager.js';

console.log('--- Verifying Bento Xavier Costa Access ---');

// Search for the player
const results = cardManager.searchPlayers({ name: 'Bento' });

if (results.length > 0) {
    const bento = results.find(p => p.name.includes('Bento'));
    if (bento) {
        console.log('✅ Player found in cardManager!');
        console.log('Name:', bento.name);
        console.log('OVR:', bento.overallRating);
        console.log('Position:', bento.position);
        console.log('Team:', bento.team);
        console.log('Stats:', {
            POW: bento.power,
            SHO: bento.shoot,
            PAS: bento.pass,
            TAC: bento.tackle
        });
    } else {
        console.error('❌ Bento not found in search results.');
    }
} else {
    console.error('❌ No results found for "Bento".');
}
