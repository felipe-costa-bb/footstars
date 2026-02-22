
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- User Balances ---');
const users = db.prepare("SELECT id, username, currency FROM users").all();
console.table(users);
