/**
 * Seed script: populate coaches table with top real-world managers.
 * Includes tactical style, preferred formation, and PRICE for gameplay effects/shop.
 * Run: node server/scripts/seed_coaches.js
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../src/data/footstars.db');
const db = new Database(dbPath);

// Ensure coaches table exists with new columns
db.exec(`
  CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nationality TEXT,
    club TEXT,
    rating REAL NOT NULL DEFAULT 3.0,
    image_url TEXT,
    description TEXT,
    style TEXT,
    preferred_formation TEXT,
    price INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrations for existing table
try {
  db.prepare('ALTER TABLE coaches ADD COLUMN style TEXT').run();
} catch (e) { }
try {
  db.prepare('ALTER TABLE coaches ADD COLUMN preferred_formation TEXT').run();
} catch (e) { }
try {
  db.prepare('ALTER TABLE coaches ADD COLUMN price INTEGER DEFAULT 0').run();
} catch (e) { }

const coaches = [
  // Elite (5 stars) - 5,000,000 coins
  {
    name: 'Pep Guardiola', nationality: 'Spain', club: 'Manchester City', rating: 5.0,
    description: 'Tactical genius, master of possession football.',
    style: 'Tiki-Taka', preferred_formation: '4-3-3', price: 5000000
  },
  {
    name: 'Jürgen Klopp', nationality: 'Germany', club: 'Red Bull', rating: 5.0,
    description: 'High-energy gegenpressing pioneer.',
    style: 'Gegenpressing', preferred_formation: '4-3-3', price: 5000000
  },
  {
    name: 'Carlo Ancelotti', nationality: 'Italy', club: 'Real Madrid', rating: 5.0,
    description: 'Most decorated manager in Champions League history.',
    style: 'Counter Attack', preferred_formation: '4-3-3', price: 5000000
  },

  // 4.5 Stars - 3,500,000 coins
  {
    name: 'José Mourinho', nationality: 'Portugal', club: 'Fenerbahçe', rating: 4.5,
    description: 'The Special One. Master of defensive organization.',
    style: 'Catenaccio', preferred_formation: '4-2-3-1', price: 3500000
  },
  {
    name: 'Diego Simeone', nationality: 'Argentina', club: 'Atlético Madrid', rating: 4.5,
    description: 'Intense pressing and defensive solidity.',
    style: 'Catenaccio', preferred_formation: '4-4-2', price: 3500000
  },
  {
    name: 'Zinedine Zidane', nationality: 'France', club: 'Free Agent', rating: 4.5,
    description: 'Three consecutive Champions League titles with Real Madrid.',
    style: 'Counter Attack', preferred_formation: '4-3-3', price: 3500000
  },
  {
    name: 'Xabi Alonso', nationality: 'Spain', club: 'Bayer Leverkusen', rating: 4.5,
    description: 'Unbeaten Bundesliga champion in debut season.',
    style: 'Total Football', preferred_formation: '3-4-2-1', price: 3500000
  },

  // 4 Stars - 2,000,000 coins
  {
    name: 'Luis Enrique', nationality: 'Spain', club: 'Paris Saint-Germain', rating: 4.0,
    description: 'Dynamic attacking football with high pressing.',
    style: 'Tiki-Taka', preferred_formation: '4-3-3', price: 2000000
  },
  {
    name: 'Mikel Arteta', nationality: 'Spain', club: 'Arsenal', rating: 4.0,
    description: 'Guardiola disciple building a new Arsenal dynasty.',
    style: 'Total Football', preferred_formation: '4-3-3', price: 2000000
  },
  {
    name: 'Simone Inzaghi', nationality: 'Italy', club: 'Inter Milan', rating: 4.0,
    description: 'Champions League finalist, master of 3-5-2.',
    style: 'Catenaccio', preferred_formation: '3-5-2', price: 2000000
  },
  {
    name: 'Roberto De Zerbi', nationality: 'Italy', club: 'Marseille', rating: 4.0,
    description: 'Innovative positional play and build-up from the back.',
    style: 'Total Football', preferred_formation: '4-2-3-1', price: 2000000
  },
  {
    name: 'Arne Slot', nationality: 'Netherlands', club: 'Liverpool', rating: 4.0,
    description: 'Feyenoord title winner bringing structured pressing to Liverpool.',
    style: 'Gegenpressing', preferred_formation: '4-3-3', price: 2000000
  },
  {
    name: 'Hansi Flick', nationality: 'Germany', club: 'Barcelona', rating: 4.0,
    description: 'Treble winner with Bayern, high-pressing specialist.',
    style: 'Gegenpressing', preferred_formation: '4-2-3-1', price: 2000000
  },
  {
    name: 'Thomas Tuchel', nationality: 'Germany', club: 'England NT', rating: 4.0,
    description: 'Champions League winner with Chelsea.',
    style: 'Gegenpressing', preferred_formation: '3-4-2-1', price: 2000000
  },
  {
    name: 'Antonio Conte', nationality: 'Italy', club: 'Napoli', rating: 4.0,
    description: 'Serial winner with intense defensive pressing.',
    style: 'Catenaccio', preferred_formation: '3-5-2', price: 2000000
  },
  {
    name: 'Unai Emery', nationality: 'Spain', club: 'Aston Villa', rating: 4.0,
    description: 'Europa League specialist, four-time winner.',
    style: 'Counter Attack', preferred_formation: '4-2-3-1', price: 2000000
  },
  {
    name: 'Ruben Amorim', nationality: 'Portugal', club: 'Sporting CP', rating: 4.0,
    description: 'Rising star, Sporting CP title winner.',
    style: 'Total Football', preferred_formation: '3-4-3', price: 2000000
  },

  // 3.5 Stars - 1,000,000 coins
  {
    name: 'Erik ten Hag', nationality: 'Netherlands', club: 'Manchester United', rating: 3.5,
    description: 'Structured positional play with Ajax roots.',
    style: 'Total Football', preferred_formation: '4-2-3-1', price: 1000000
  },
  {
    name: 'Vincenzo Italiano', nationality: 'Italy', club: 'Bologna', rating: 3.5,
    description: 'Attacking high-tempo football.',
    style: 'Total Football', preferred_formation: '4-3-3', price: 1000000
  },
  {
    name: 'Oliver Glasner', nationality: 'Austria', club: 'Crystal Palace', rating: 3.5,
    description: 'Europa League winner with Eintracht Frankfurt.',
    style: 'Gegenpressing', preferred_formation: '3-4-2-1', price: 1000000
  },
  {
    name: 'Mauricio Pochettino', nationality: 'Argentina', club: 'USMNT', rating: 3.5,
    description: 'Champions League finalist with Tottenham.',
    style: 'Gegenpressing', preferred_formation: '4-2-3-1', price: 1000000
  },
  {
    name: 'Massimiliano Allegri', nationality: 'Italy', club: 'Free Agent', rating: 3.5,
    description: 'Five consecutive Serie A titles with Juventus.',
    style: 'Catenaccio', preferred_formation: '3-5-2', price: 1000000
  },
  {
    name: 'Claudio Ranieri', nationality: 'Italy', club: 'Free Agent', rating: 3.5,
    description: 'Miracle worker, Premier League winner with Leicester.',
    style: 'Counter Attack', preferred_formation: '4-4-2', price: 1000000
  },

  // 3 Stars & below - 500,000 coins
  {
    name: 'Nuno Espírito Santo', nationality: 'Portugal', club: 'Nottingham Forest', rating: 3.0,
    description: 'Solid defensive organization.',
    style: 'Catenaccio', preferred_formation: '4-2-3-1', price: 500000
  },
  {
    name: 'Marcelino García Toral', nationality: 'Spain', club: 'Villarreal', rating: 3.0,
    description: 'Copa del Rey specialist.',
    style: 'Counter Attack', preferred_formation: '4-4-2', price: 500000
  },
  {
    name: 'Vincent Kompany', nationality: 'Belgium', club: 'Bayern Munich', rating: 3.0,
    description: 'Guardiola-style football, Burnley promotion winner.',
    style: 'Tiki-Taka', preferred_formation: '4-2-3-1', price: 500000
  },
  {
    name: 'Sebastian Hoeneß', nationality: 'Germany', club: 'VfB Stuttgart', rating: 3.0,
    description: 'Champions League qualification with Stuttgart.',
    style: 'Gegenpressing', preferred_formation: '4-2-3-1', price: 500000
  },
  {
    name: 'Graham Potter', nationality: 'England', club: 'Free Agent', rating: 2.5,
    description: 'Innovative tactician with Brighton.',
    style: 'Total Football', preferred_formation: '3-4-2-1', price: 500000
  },
  {
    name: 'Quique Setién', nationality: 'Spain', club: 'Free Agent', rating: 2.5,
    description: 'Possession-based football inspired by Cruyff.',
    style: 'Tiki-Taka', preferred_formation: '4-3-3', price: 500000
  },
  {
    name: 'Kieran McKenna', nationality: 'Northern Ireland', club: 'Ipswich Town', rating: 2.5,
    description: 'Back-to-back promotions with Ipswich.',
    style: 'Total Football', preferred_formation: '4-2-3-1', price: 500000
  },
];

let inserted = 0;
let updated = 0;

for (const coach of coaches) {
  try {
    const existing = db.prepare('SELECT id FROM coaches WHERE name = ?').get(coach.name);
    if (existing) {
      db.prepare(`
                UPDATE coaches 
                SET nationality = ?, club = ?, rating = ?, image_url = ?, description = ?, style = ?, preferred_formation = ?, price = ?
                WHERE id = ?
            `).run(
        coach.nationality || null,
        coach.club || null,
        coach.rating,
        coach.image_url || null,
        coach.description || null,
        coach.style || null,
        coach.preferred_formation || null,
        coach.price || 0,
        existing.id
      );
      console.log(`🔄 Updated: ${coach.name} (Price: ${coach.price})`);
      updated++;
    } else {
      db.prepare(`
                INSERT INTO coaches (name, nationality, club, rating, image_url, description, style, preferred_formation, price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
        coach.name,
        coach.nationality || null,
        coach.club || null,
        coach.rating,
        coach.image_url || null,
        coach.description || null,
        coach.style || null,
        coach.preferred_formation || null,
        coach.price || 0
      );
      console.log(`✅ Inserted: ${coach.name} (${coach.rating}★, Price: ${coach.price})`);
      inserted++;
    }
  } catch (e) {
    console.error(`❌ Error processing ${coach.name}:`, e.message);
  }
}

console.log(`\n🏆 Done! ${inserted} coaches inserted, ${updated} coaches updated.`);
db.close();
