
import { db } from '../src/infrastructure/db/scraper_schema.js';

const neymar = db.prepare("SELECT id, real_name, image_url, overall_rating, position, power, shoot, pass, tackle FROM base_players WHERE real_name LIKE '%Neymar%'").get();

if (neymar) {
    console.log('Found Neymar:', JSON.stringify(neymar, null, 2));
} else {
    console.log('Neymar not found');
}
