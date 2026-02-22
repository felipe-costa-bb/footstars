/**
 * Database schema for scraped EA Sports FC player data
 * Creates tables for: base_players, base_teams
 * Supports alternate display names for copyright-safe naming
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dbPath = join(__dirname, '../../data');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

const db = new Database(join(dbPath, 'footstars.db'));

/**
 * Initialize scraper-related tables
 */
export function initScraperSchema() {
    db.exec(`
        -- Base player data from EA (real names stored here)
        CREATE TABLE IF NOT EXISTS base_players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ea_player_id TEXT UNIQUE NOT NULL,
            real_name TEXT NOT NULL,
            display_name TEXT,
            position TEXT NOT NULL,
            overall_rating INTEGER NOT NULL,
            -- Main EA attributes (0-99)
            shooting INTEGER,
            passing INTEGER,
            dribbling INTEGER,
            defending INTEGER,
            -- Game-specific derived attributes (0-99)
            power INTEGER,
            shoot INTEGER,
            tackle INTEGER,
            pass INTEGER,
            -- Metadata
            nationality TEXT,
            team_name TEXT,
            team_display_name TEXT,
            image_url TEXT,
            player_url TEXT,
            detailed_stats TEXT, -- JSON blob for full stats
            scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Team data with aliases
        CREATE TABLE IF NOT EXISTS base_teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ea_team_id TEXT UNIQUE,
            real_name TEXT NOT NULL UNIQUE,
            display_name TEXT,
            league TEXT,
            country TEXT,
            scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Index for fast lookups
        CREATE INDEX IF NOT EXISTS idx_base_players_position ON base_players(position);
        CREATE INDEX IF NOT EXISTS idx_base_players_rating ON base_players(overall_rating);
        CREATE INDEX IF NOT EXISTS idx_base_players_ea_id ON base_players(ea_player_id);
        CREATE INDEX IF NOT EXISTS idx_base_teams_name ON base_teams(real_name);
    `);

    // Migration to add detailed_stats if it doesn't exist
    try {
        db.exec("ALTER TABLE base_players ADD COLUMN detailed_stats TEXT");
    } catch (e) {
        // Ignore if column exists
    }

    console.log('✅ Scraper schema initialized successfully');
}

/**
 * Derive game attributes from EA attributes
 * @param {Object} eaStats - { pace, shooting, passing, dribbling, defending, physicality }
 * @returns {Object} - { power, shoot, tackle, pass }
 */
export function deriveGameAttributes(eaStats) {
    const { shooting = 50, passing = 50, dribbling = 50, defending = 50, position, overall_rating, detailed_stats } = eaStats;

    // Direct 1:1 Mapping to FC Stats
    // User Rules:
    // Shoot = Shooting (Anyone vs GK)
    // Pass = Passing (Anyone vs Anyone)
    // Tackle = Defending (Anyone vs Anyone)
    // Power = GK Power (Everyone has this, derived from detailed GK stats)

    let power = 0;

    // Calculate GK Power for EVERYONE from detailed stats if available
    if (detailed_stats) {
        const stats = detailed_stats;
        // Handle both flat structure (from detailed_stats JSON) or potentially nested if raw
        // The scraper passes p.stats which has keys like 'gkDiving': { value: 90 }

        const getValue = (key) => stats[key]?.value || 10;

        const div = getValue('gkDiving') || getValue('gk_diving');
        const han = getValue('gkHandling') || getValue('gk_handling');
        const kic = getValue('gkKicking') || getValue('gk_kicking');
        const ref = getValue('gkReflexes') || getValue('gk_reflexes');
        const pos = getValue('gkPositioning') || getValue('gk_positioning');

        power = Math.round((div + han + kic + ref + pos) / 5);
    } else {
        // Fallback if no detailed stats (legacy behavior)
        if (position === 'GK') {
            power = overall_rating || 80;
        } else {
            power = 15;
        }
    }

    return {
        power: power,
        shoot: shooting,
        tackle: defending,
        pass: passing
    };
}

/**
 * Insert or update a player in the database
 */
export function upsertPlayer(playerData) {
    const gameAttrs = deriveGameAttributes({
        shooting: playerData.shooting,
        passing: playerData.passing,
        dribbling: playerData.dribbling,
        defending: playerData.defending,
        // CRITICAL FIX: Pass detailed stats and position/rating for correct calculation
        position: playerData.position,
        overall_rating: playerData.overall_rating,
        detailed_stats: playerData.detailed_stats
    });

    const stmt = db.prepare(`
        INSERT INTO base_players (
            ea_player_id, real_name, display_name, position, overall_rating,
            shooting, passing, dribbling, defending,
            power, shoot, tackle, pass,
            nationality, team_name, image_url, player_url, detailed_stats
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(ea_player_id) DO UPDATE SET
            real_name = excluded.real_name,
            position = excluded.position,
            overall_rating = excluded.overall_rating,
            shooting = excluded.shooting,
            passing = excluded.passing,
            dribbling = excluded.dribbling,
            defending = excluded.defending,
            power = excluded.power,
            shoot = excluded.shoot,
            tackle = excluded.tackle,
            pass = excluded.pass,
            nationality = excluded.nationality,
            team_name = excluded.team_name,
            image_url = excluded.image_url,
            player_url = excluded.player_url,
            detailed_stats = excluded.detailed_stats,
            scraped_at = CURRENT_TIMESTAMP
    `);

    return stmt.run(
        playerData.ea_player_id,
        playerData.real_name,
        playerData.display_name || null,
        playerData.position,
        playerData.overall_rating,
        playerData.shooting || null,
        playerData.passing || null,
        playerData.dribbling || null,
        playerData.defending || null,
        gameAttrs.power,
        gameAttrs.shoot,
        gameAttrs.tackle,
        gameAttrs.pass,
        playerData.nationality || null,
        playerData.team_name || null,
        playerData.image_url || null,
        playerData.player_url || null,
        playerData.detailed_stats ? JSON.stringify(playerData.detailed_stats) : null
    );
}

/**
 * Insert or update a team in the database
 */
export function upsertTeam(teamData) {
    const stmt = db.prepare(`
        INSERT INTO base_teams (ea_team_id, real_name, display_name, league, country)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(real_name) DO UPDATE SET
            ea_team_id = COALESCE(excluded.ea_team_id, base_teams.ea_team_id),
            display_name = COALESCE(base_teams.display_name, excluded.display_name),
            league = COALESCE(excluded.league, base_teams.league),
            country = COALESCE(excluded.country, base_teams.country),
            scraped_at = CURRENT_TIMESTAMP
    `);

    return stmt.run(
        teamData.ea_team_id || null,
        teamData.real_name,
        teamData.display_name || null,
        teamData.league || null,
        teamData.country || null
    );
}

/**
 * Get all players from database
 */
export function getAllPlayers(options = {}) {
    const { minRating = 0, position = null, limit = null } = options;

    let query = 'SELECT * FROM base_players WHERE overall_rating >= ?';
    const params = [minRating];

    if (position) {
        query += ' AND position = ?';
        params.push(position);
    }

    query += ' ORDER BY overall_rating DESC';

    if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
    }

    return db.prepare(query).all(...params);
}

/**
 * Get player by EA ID
 */
export function getPlayerByEaId(eaPlayerId) {
    return db.prepare('SELECT * FROM base_players WHERE ea_player_id = ?').get(eaPlayerId);
}

/**
 * Get player count
 */
export function getPlayerCount() {
    return db.prepare('SELECT COUNT(*) as count FROM base_players').get().count;
}

/**
 * Set display name for a player (alias)
 */
export function setPlayerDisplayName(eaPlayerId, displayName) {
    const stmt = db.prepare('UPDATE base_players SET display_name = ? WHERE ea_player_id = ?');
    return stmt.run(displayName, eaPlayerId);
}

/**
 * Set display name for a team (alias)
 */
export function setTeamDisplayName(realName, displayName) {
    const stmt = db.prepare('UPDATE base_teams SET display_name = ? WHERE real_name = ?');
    return stmt.run(displayName, realName);
}

/**
 * Get all teams from database
 */
export function getAllTeams() {
    return db.prepare('SELECT * FROM base_teams ORDER BY real_name').all();
}

// Export the db instance for direct queries if needed
export { db };
