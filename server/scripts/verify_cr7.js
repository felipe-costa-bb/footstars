
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('DB Path:', db.name);

const player = db.prepare(`
    SELECT real_name, overall_rating, shoot, pass, tackle, power, detailed_stats
    FROM base_players 
    WHERE real_name LIKE '%Cristiano Ronaldo%'
`).get();

if (player) {
    console.log('Player Found:', player.real_name);
    console.log('OVR:', player.overall_rating);
    console.log('Attributes:', {
        shoot: player.shoot,
        pass: player.pass,
        tackle: player.tackle,
        power: player.power
    });
    // Check detailed stats if available
    if (player.detailed_stats) {
        const stats = JSON.parse(player.detailed_stats);
        console.log('Detailed Sho:', stats.sho?.value);
        console.log('Detailed Pas:', stats.pas?.value);
        console.log('Detailed Def:', stats.def?.value);
    }
} else {
    console.log('Player NOT found.');
}
