import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../src/data/footstars.db');

try {
    const db = new Database(dbPath);
    const rows = db.prepare("SELECT DISTINCT nationality FROM base_players ORDER BY nationality").all();
    console.log('Nationalities found:', rows.map(r => r.nationality));
} catch (err) {
    console.error('Error:', err);
}
