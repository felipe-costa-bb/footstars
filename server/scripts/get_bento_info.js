import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Fetching Bento Info ---');
try {
    const bento = db.prepare("SELECT * FROM base_players WHERE ea_player_id = 'custom_bento_001'").get();
    if (bento) {
        // Parse detailed stats if string
        if (typeof bento.detailed_stats === 'string') {
            try {
                bento.detailed_stats = JSON.parse(bento.detailed_stats);
            } catch (e) {
                console.log('Failed to parse detailed_stats JSON');
            }
        }
        console.log(JSON.stringify(bento, null, 2));
    } else {
        console.log('Bento not found in database with ID custom_bento_001.');
        // Try fuzzy search
        console.log('Attempting fuzzy search for "Bento"...');
        const fuzzy = db.prepare("SELECT * FROM base_players WHERE real_name LIKE '%Bento%' OR display_name LIKE '%Bento%'").all();
        console.log(`Found ${fuzzy.length} matches:`);
        fuzzy.forEach(p => console.log(`${p.real_name} (${p.ea_player_id}) - OVR: ${p.overall_rating}`));
    }
} catch (error) {
    console.error('Error fetching Bento:', error);
}
