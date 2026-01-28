
import { getAllPlayers } from '../src/infrastructure/db/scraper_schema.js';

// Get top 20 players
const players = getAllPlayers({ limit: 20 });

console.log(`\n🚀 Top ${players.length} Players in Database:\n`);

// Format for console table
const tableData = players.map(p => {
    // Parse detailed stats if string
    let detailed = p.detailed_stats;
    if (typeof detailed === 'string') {
        try { detailed = JSON.parse(detailed); } catch (e) { }
    }

    return {
        Name: p.real_name,
        OVR: p.overall_rating,
        Pos: p.position,
        Team: p.team_name,
        'Pace': p.pace,
        'Shoot': p.shoot, // Derived game stat
        'Stats?': detailed ? '✅ Yes' : '❌ No'
    };
});

console.table(tableData);

console.log(`\n💡 Run with: node scripts/query_db.js`);
