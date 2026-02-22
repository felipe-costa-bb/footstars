
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Updating Player Images ---');

const updates = [
    { id: 'custom_bento_001', image: '/assets/players/bento_arsenal.png' },
    { id: '999001', image: '/assets/players/jakob_alnassr.png' },
    { id: '999002', image: '/assets/players/benjamin_manutd.png' }
];

updates.forEach(u => {
    const info = db.prepare("UPDATE base_players SET image_url = ? WHERE ea_player_id = ?").run(u.image, u.id);
    console.log(`Updated ${u.id}: ${info.changes} row(s) affected.`);
});

console.log('--- Verification ---');
updates.forEach(u => {
    const player = db.prepare("SELECT image_url FROM base_players WHERE ea_player_id = ?").get(u.id);
    console.log(`Player ${u.id} image: ${player.image_url}`);
});
