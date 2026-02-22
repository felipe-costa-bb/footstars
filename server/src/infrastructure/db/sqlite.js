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

export const db = new Database(join(dbPath, 'footstars.db')); // verbose: console.log

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    currency INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_daily_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    gained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    formation TEXT DEFAULT '4-4-2',
    card_ids TEXT NOT NULL, -- JSON array of card IDs
    captain_id INTEGER,
    kit_numbers TEXT DEFAULT '{}',
    coach_id INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(coach_id) REFERENCES coaches(id)
  );
  
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    winner_id INTEGER,
    loser_id INTEGER,
    score_winner INTEGER,
    score_loser INTEGER,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ante_card_id INTEGER, -- The card that was transferred
    FOREIGN KEY(winner_id) REFERENCES users(id),
    FOREIGN KEY(loser_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nationality TEXT,
    club TEXT,
    rating REAL CHECK(rating >= 1.0 AND rating <= 5.0),
    image_url TEXT,
    description TEXT,
    style TEXT,
    preferred_formation TEXT,
    price INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(coach_id) REFERENCES coaches(id),
    UNIQUE(user_id, coach_id)
  );
`);

// Migration: Add avatar_url if missing
try {
    const columns = db.prepare('PRAGMA table_info(users)').all();
    const hasAvatar = columns.some(c => c.name === 'avatar_url');
    if (!hasAvatar) {
        db.prepare('ALTER TABLE users ADD COLUMN avatar_url TEXT').run();
        console.log('Migrated DB: Added avatar_url to users table');
    }
} catch (e) {
    console.error('User Migration failed:', e);
}

// Migration: Add formation if missing in teams
try {
    const columns = db.prepare('PRAGMA table_info(teams)').all();
    const hasFormation = columns.some(c => c.name === 'formation');
    if (!hasFormation) {
        db.prepare("ALTER TABLE teams ADD COLUMN formation TEXT DEFAULT '4-4-2'").run();
        console.log('Migrated DB: Added formation to teams table');
    }
} catch (e) {
    console.error('Team Migration failed:', e);
}

// Migration: Add captain_id if missing in teams
try {
    const columns = db.prepare('PRAGMA table_info(teams)').all();
    const hasCaptain = columns.some(c => c.name === 'captain_id');
    if (!hasCaptain) {
        db.prepare('ALTER TABLE teams ADD COLUMN captain_id INTEGER').run();
        console.log('Migrated DB: Added captain_id to teams table');
    }
} catch (e) {
    console.error('Team Captain Migration failed:', e);
}

// Migration: Add kit_numbers if missing in teams
try {
    const columns = db.prepare('PRAGMA table_info(teams)').all();
    const hasKitNumbers = columns.some(c => c.name === 'kit_numbers');
    if (!hasKitNumbers) {
        db.prepare("ALTER TABLE teams ADD COLUMN kit_numbers TEXT DEFAULT '{}'").run();
        console.log('Migrated DB: Added kit_numbers to teams table');
    }
} catch (e) {
    console.error('Team Kit Numbers Migration failed:', e);
}

// Migration: Add coach_id if missing in teams
try {
    const columns = db.prepare('PRAGMA table_info(teams)').all();
    const hasCoachId = columns.some(c => c.name === 'coach_id');
    if (!hasCoachId) {
        db.prepare('ALTER TABLE teams ADD COLUMN coach_id INTEGER').run();
        console.log('Migrated DB: Added coach_id to teams table');
    }
} catch (e) {
    console.error('Team Coach Migration failed:', e);
}

// Migration: Add coach_id if missing in users
try {
    const columns = db.prepare('PRAGMA table_info(users)').all();
    const hasCoach = columns.some(c => c.name === 'coach_id');
    if (!hasCoach) {
        db.prepare('ALTER TABLE users ADD COLUMN coach_id INTEGER REFERENCES coaches(id)').run();
        console.log('Migrated DB: Added coach_id to users table');
    }
} catch (e) {
    console.error('User Coach Migration failed:', e);
}

export const sqliteRepo = {
    // User Operations
    createUser: (username, passwordHash) => {
        const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        const info = stmt.run(username, passwordHash);
        return { id: info.lastInsertRowid, username };
    },

    updateUser: (id, { username, avatarUrl }) => {
        const updates = [];
        const params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (avatarUrl !== undefined) {
            updates.push('avatar_url = ?');
            params.push(avatarUrl);
        }

        if (updates.length > 0) {
            params.push(id);
            const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
            stmt.run(...params);
        }

        return sqliteRepo.findUserById(id);
    },

    findUserByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username);
    },

    findUserById: (id) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    },

    updateDailyLogin: (userId) => {
        const stmt = db.prepare('UPDATE users SET last_daily_login = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run(userId);
    },

    getUserCoins: (userId) => {
        const stmt = db.prepare('SELECT currency FROM users WHERE id = ?');
        const result = stmt.get(userId);
        return result ? result.currency : 0;
    },

    updateUserCoins: (userId, newBalance) => {
        const stmt = db.prepare('UPDATE users SET currency = ? WHERE id = ?');
        stmt.run(newBalance, userId);
    },

    addUserCoins: (userId, amount) => {
        const current = sqliteRepo.getUserCoins(userId);
        sqliteRepo.updateUserCoins(userId, current + amount);
        return current + amount;
    },

    // Card Operations
    createCard: (userId, playerId) => {
        const stmt = db.prepare('INSERT INTO cards (user_id, player_id) VALUES (?, ?)');
        const info = stmt.run(userId, playerId);
        return { id: info.lastInsertRowid, userId, playerId };
    },

    getUserCards: (userId) => {
        const stmt = db.prepare('SELECT * FROM cards WHERE user_id = ?');
        return stmt.all(userId);
    },

    getCardById: (cardId) => {
        const stmt = db.prepare('SELECT * FROM cards WHERE id = ?');
        return stmt.get(cardId);
    },

    transferCard: (cardId, newUserId) => {
        const stmt = db.prepare('UPDATE cards SET user_id = ? WHERE id = ?');
        stmt.run(newUserId, cardId);
    },

    deleteCard: (cardId, userId) => {
        const stmt = db.prepare('DELETE FROM cards WHERE id = ? AND user_id = ?');
        const result = stmt.run(cardId, userId);
        return result.changes > 0;
    },

    // Team Operations

    // Create a new team (supports multiple teams per user)
    createTeam: (userId, teamName, cardIds, formation = '4-4-2', captainId = null, kitNumbers = {}) => {
        const stmt = db.prepare('INSERT INTO teams (user_id, name, card_ids, formation, captain_id, kit_numbers) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(userId, teamName, JSON.stringify(cardIds), formation, captainId, JSON.stringify(kitNumbers));
        return { id: info.lastInsertRowid, userId, name: teamName, cardIds, formation, captainId, kitNumbers };
    },

    // Get all teams for a user
    getAllUserTeams: (userId) => {
        const stmt = db.prepare('SELECT * FROM teams WHERE user_id = ? ORDER BY updated_at DESC');
        const teams = stmt.all(userId);
        return teams.map(team => ({
            ...team,
            card_ids: JSON.parse(team.card_ids),
            kit_numbers: team.kit_numbers ? JSON.parse(team.kit_numbers) : {}
        }));
    },

    // Get a specific team by ID
    getTeamById: (teamId) => {
        const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);
        if (team) {
            team.card_ids = JSON.parse(team.card_ids);
            team.kit_numbers = team.kit_numbers ? JSON.parse(team.kit_numbers) : {};
        }
        return team;
    },

    // Update an existing team
    updateTeam: (teamId, teamName, cardIds, formation, captainId, kitNumbers) => {
        const stmt = db.prepare('UPDATE teams SET name = ?, card_ids = ?, formation = ?, captain_id = ?, kit_numbers = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run(teamName, JSON.stringify(cardIds), formation, captainId, JSON.stringify(kitNumbers), teamId);
        return { id: teamId, name: teamName, cardIds, formation, captainId, kitNumbers };
    },

    // Delete a team
    deleteTeam: (teamId, userId) => {
        const stmt = db.prepare('DELETE FROM teams WHERE id = ? AND user_id = ?');
        const result = stmt.run(teamId, userId);
        return result.changes > 0;
    },

    // Legacy: Get first team for a user (for backward compatibility)
    getUserTeam: (userId) => {
        const team = db.prepare('SELECT * FROM teams WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
        if (team) {
            team.card_ids = JSON.parse(team.card_ids);
            team.kit_numbers = team.kit_numbers ? JSON.parse(team.kit_numbers) : {};
        }
        return team;
    },

    // Match Operations
    recordMatch: (winnerId, loserId, scoreWinner, scoreLoser, anteCardId) => {
        const stmt = db.prepare(`
      INSERT INTO matches (winner_id, loser_id, score_winner, score_loser, ante_card_id)
      VALUES (?, ?, ?, ?, ?)
    `);
        const info = stmt.run(winnerId, loserId, scoreWinner, scoreLoser, anteCardId);
        return { id: info.lastInsertRowid };
    },

    getMatchHistory: (userId, limit = 20) => {
        const stmt = db.prepare(`
            SELECT 
                m.id,
                m.winner_id,
                m.loser_id,
                m.score_winner,
                m.score_loser,
                m.played_at,
                m.ante_card_id,
                w.username as winner_name,
                l.username as loser_name
            FROM matches m
            LEFT JOIN users w ON m.winner_id = w.id
            LEFT JOIN users l ON m.loser_id = l.id
            WHERE m.winner_id = ? OR m.loser_id = ?
            ORDER BY m.played_at DESC
            LIMIT ?
        `);
        return stmt.all(userId, userId, limit);
    },

    getLeaderboard: (limit = 50) => {
        const stmt = db.prepare(`
            SELECT 
                u.id,
                u.username,
                COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) as wins,
                COUNT(CASE WHEN m.loser_id = u.id THEN 1 END) as losses
            FROM users u
            LEFT JOIN matches m ON u.id = m.winner_id OR u.id = m.loser_id
            GROUP BY u.id
            ORDER BY wins DESC, losses ASC
            LIMIT ?
        `);
        return stmt.all(limit);
    },

    // Coach Operations
    getAllCoaches: () => {
        return db.prepare('SELECT * FROM coaches ORDER BY rating DESC, name ASC').all();
    },

    getCoachById: (coachId) => {
        return db.prepare('SELECT * FROM coaches WHERE id = ?').get(coachId);
    },

    upsertCoach: (coachData) => {
        const stmt = db.prepare(`
            INSERT INTO coaches (name, nationality, club, rating, image_url, description)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT DO NOTHING
        `);
        const info = stmt.run(
            coachData.name,
            coachData.nationality || null,
            coachData.club || null,
            coachData.rating || 3.0,
            coachData.image_url || null,
            coachData.description || null
        );
        return info;
    },

    setUserCoach: (userId, coachId) => {
        db.prepare('UPDATE users SET coach_id = ? WHERE id = ?').run(coachId, userId);
    },

    getUserCoach: (userId) => {
        const user = db.prepare('SELECT coach_id FROM users WHERE id = ?').get(userId);
        if (!user || !user.coach_id) return null;
        return db.prepare('SELECT * FROM coaches WHERE id = ?').get(user.coach_id);
    },

    isCoachOwned: (userId, coachId) => {
        const row = db.prepare('SELECT 1 FROM user_coaches WHERE user_id = ? AND coach_id = ?').get(userId, coachId);
        return !!row;
    },

    purchaseCoach: (userId, coachId) => {
        return db.prepare('INSERT INTO user_coaches (user_id, coach_id) VALUES (?, ?)').run(userId, coachId);
    },

    getUserOwnedCoaches: (userId) => {
        return db.prepare('SELECT coach_id FROM user_coaches WHERE user_id = ?').all(userId).map(r => r.coach_id);
    },

    assignCoachToTeam: (teamId, coachId) => {
        return db.prepare('UPDATE teams SET coach_id = ? WHERE id = ?').run(coachId, teamId);
    },

    getTeamCoach: (teamId) => {
        const team = db.prepare('SELECT coach_id FROM teams WHERE id = ?').get(teamId);
        if (!team || !team.coach_id) return null;
        return db.prepare('SELECT * FROM coaches WHERE id = ?').get(team.coach_id);
    },
};
