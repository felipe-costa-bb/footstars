
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../src/data/footstars.db');

const db = new Database(dbPath);

console.log('--- PERFORMING FINAL FIX ---');

// 1. Fix Jakob Toover (Target by name to avoid ID precision issues)
const jakobUpdate = db.prepare(`
    UPDATE base_players 
    SET image_url = '/assets/players/jakob_face_v2.png',
        ea_player_id = '999001'
    WHERE display_name = 'Jakob Toover' OR real_name = 'Jakob Toover'
`).run();
console.log(`Jakob updated: ${jakobUpdate.changes} row(s)`);

// 2. Ensure Bento Costa
const bentoUpdate = db.prepare(`
    UPDATE base_players 
    SET image_url = '/assets/players/bento_face_v23.png'
    WHERE ea_player_id = 'custom_bento_001'
`).run();
console.log(`Bento updated: ${bentoUpdate.changes} row(s)`);

// 3. Final Verification
const players = db.prepare("SELECT ea_player_id, display_name, image_url FROM base_players WHERE real_name LIKE '%Jakob%' OR real_name LIKE '%Bento%'").all();
console.table(players);

db.close();
