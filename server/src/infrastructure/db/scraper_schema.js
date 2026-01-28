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
            pace INTEGER,
            shooting INTEGER,
            passing INTEGER,
            dribbling INTEGER,
            defending INTEGER,
            physicality INTEGER,
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
    const { pace = 50, shooting = 50, passing = 50, dribbling = 50, defending = 50, physicality = 50 } = eaStats;

    return {
        power: Math.round((physicality * 0.6) + (defending * 0.4)),
        shoot: Math.round((shooting * 0.7) + (pace * 0.3)),
        tackle: Math.round((defending * 0.7) + (physicality * 0.3)),
        pass: Math.round((passing * 0.6) + (dribbling * 0.4))
    };
}

/**
 * Insert or update a player in the database
 */
export function upsertPlayer(playerData) {
    const gameAttrs = deriveGameAttributes({
        pace: playerData.pace,
        shooting: playerData.shooting,
        passing: playerData.passing,
        dribbling: playerData.dribbling,
        defending: playerData.defending,
        physicality: playerData.physicality
    });

    const stmt = db.prepare(`
        INSERT INTO base_players (
            ea_player_id, real_name, display_name, position, overall_rating,
            pace, shooting, passing, dribbling, defending, physicality,
            power, shoot, tackle, pass,
            nationality, team_name, image_url, player_url, detailed_stats
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(ea_player_id) DO UPDATE SET
            real_name = excluded.real_name,
            position = excluded.position,
            overall_rating = excluded.overall_rating,
            pace = excluded.pace,
            shooting = excluded.shooting,
            passing = excluded.passing,
            dribbling = excluded.dribbling,
            defending = excluded.defending,
            physicality = excluded.physicality,
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
        playerData.pace || null,
        playerData.shooting || null,
        playerData.passing || null,
        playerData.dribbling || null,
        playerData.defending || null,
        playerData.physicality || null,
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
