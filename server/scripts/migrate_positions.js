import { db } from '../src/infrastructure/db/scraper_schema.js';

console.log('🚀 Starting Position Migration (DF/MF/FW -> CB/CM/ST)...');

const migrate = () => {
    try {
        const infoDF = db.prepare("UPDATE base_players SET position = 'CB' WHERE position = 'DF'").run();
        console.log(`   ✅ Migrated ${infoDF.changes} Defenders (DF -> CB)`);

        const infoMF = db.prepare("UPDATE base_players SET position = 'CM' WHERE position = 'MF'").run();
        console.log(`   ✅ Migrated ${infoMF.changes} Midfielders (MF -> CM)`);

        const infoFW = db.prepare("UPDATE base_players SET position = 'ST' WHERE position = 'FW'").run();
        console.log(`   ✅ Migrated ${infoFW.changes} Forwards (FW -> ST)`);

        console.log('\n🎉 Migration complete!');
    } catch (err) {
        console.error('   ❌ Migration failed:', err);
    }
};

migrate();
