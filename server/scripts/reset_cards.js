
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { cardManager } from '../src/core/cardManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../src/data/footstars.db');

const db = new Database(dbPath);

console.log('🔄 Restarting Cards Table...');

try {
    // 1. Clear Tables
    console.log('   Running cleanup...');
    db.exec('DELETE FROM cards');
    db.exec('DELETE FROM teams');
    db.exec('DELETE FROM matches'); // Optional, but keeps integrity

    // Reset sequences/IDs?
    db.exec("DELETE FROM sqlite_sequence WHERE name='cards'");
    db.exec("DELETE FROM sqlite_sequence WHERE name='teams'");
    db.exec("DELETE FROM sqlite_sequence WHERE name='matches'");

    console.log('   Tables cleared.');

    // 2. Get All Users
    const users = db.prepare('SELECT id, username FROM users').all();
    console.log(`   Found ${users.length} users.`);

    // 3. Grant Starter Packs
    for (const user of users) {
        console.log(`   Granting starter pack to ${user.username}...`);
        try {
            const cardIds = cardManager.grantStarterPack(user.id);
            console.log(`   ✅ Granted ${cardIds.length} cards.`);

            // Optionally create a default team
            // But game usually forces team creation on login?
            // Let's leave team empty, user will create it.

        } catch (e) {
            console.error(`   ❌ Failed to grant pack to ${user.username}:`, e);
        }
    }

    console.log('🎉 Reset complete!');

} catch (e) {
    console.error('❌ Error restarting tables:', e);
}
