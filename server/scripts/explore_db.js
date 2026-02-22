
import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('--- Sample Non-GK Players ---');
const players = db.prepare("SELECT real_name, position, power, shoot, tackle, pass, overall_rating FROM base_players WHERE position != 'GK' LIMIT 5").all();
console.table(players);

console.log('\n--- Position Formats ---');
const positions = db.prepare("SELECT DISTINCT position FROM base_players LIMIT 10").all();
console.log(positions.map(p => p.position).join(', '));

console.log('\n--- Team Search: Arsenal ---');
const arsenal = db.prepare("SELECT * FROM base_teams WHERE real_name LIKE '%Arsenal%'").all();
console.table(arsenal);

console.log('\n--- Player Count ---');
const count = db.prepare("SELECT COUNT(*) as c FROM base_players").get();
console.log(count.c);
