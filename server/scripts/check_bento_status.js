
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Checking Bento OVR ---');

const base = db.prepare("SELECT * FROM base_players WHERE ea_player_id = 'custom_bento_001'").get();
if (base) {
    console.log(`Base Player OVR: ${base.overall_rating}`);
} else {
    console.log('Base Player not found!');
}

const cards = db.prepare("SELECT * FROM user_cards WHERE player_id = ?").all(base ? base.id : 0);
console.log(`Found ${cards.length} user card(s).`);
cards.forEach(card => {
    console.log(`- Card ID: ${card.id}, Rating: ${card.rating}, Original Owner: ${card.original_owner_id}`);
});
