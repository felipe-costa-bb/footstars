
import { db } from '../src/infrastructure/db/scraper_schema.js';

const leagues = db.prepare("SELECT DISTINCT league FROM base_teams").all();
console.log('Leagues:', leagues.map(l => l.league));
