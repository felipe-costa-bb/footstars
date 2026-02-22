
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
        'Stats?': detailed ? '✅ Yes' : '❌ No',
        'RawPos': detailed?.commonName || detailed?.position || '?' // Check for internal position data
    };
});

console.table(tableData);
if (players.length > 0) {
    console.log('\n🔍 Detailed Stats Example (First Player):');
    try {
        console.log(JSON.stringify(JSON.parse(players[0].detailed_stats), null, 2));
    } catch (e) { console.log('No valid JSON'); }
}

console.log(`\n💡 Run with: node scripts/query_db.js`);
