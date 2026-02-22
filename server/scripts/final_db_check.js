
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../src/data/footstars.db');

const db = new Database(dbPath);

const players = db.prepare("SELECT ea_player_id, display_name, real_name, image_url, team_name FROM base_players WHERE real_name LIKE '%Jakob%' OR real_name LIKE '%Bento%'").all();

console.log('--- DATABASE CHECK ---');
console.table(players);

db.close();
