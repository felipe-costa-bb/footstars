/**
 * Alias Manager for FootStars
 * Manages alternate display names for players and teams to avoid copyright issues
 */

import {
    setPlayerDisplayName,
    setTeamDisplayName,
    getAllPlayers,
    getAllTeams,
    getPlayerByEaId
} from '../infrastructure/db/scraper_schema.js';
import fs from 'fs';

export const aliasManager = {
    /**
     * Set a custom display name for a player
     * @param {string} eaPlayerId - The EA player ID
     * @param {string} displayName - The copyright-safe display name
     */
    setPlayerAlias(eaPlayerId, displayName) {
        const result = setPlayerDisplayName(eaPlayerId, displayName);
        if (result.changes === 0) {
            throw new Error(`Player with EA ID ${eaPlayerId} not found`);
        }
        return { success: true, eaPlayerId, displayName };
    },

    /**
     * Set a custom display name for a team
     * @param {string} realName - The real team name
     * @param {string} displayName - The copyright-safe display name
     */
    setTeamAlias(realName, displayName) {
        const result = setTeamDisplayName(realName, displayName);
        if (result.changes === 0) {
            throw new Error(`Team "${realName}" not found`);
        }
        return { success: true, realName, displayName };
    },

    /**
     * Get a player with resolved display name
     * Falls back to real_name if display_name is not set
     * @param {string} eaPlayerId - The EA player ID
     */
    getPlayer(eaPlayerId) {
        const player = getPlayerByEaId(eaPlayerId);
        if (!player) return null;

        return {
            ...player,
            name: player.display_name || player.real_name
        };
    },

    /**
     * Get all players with resolved display names
     * @param {Object} options - Filter options
     */
    getAllPlayersWithAliases(options = {}) {
        const players = getAllPlayers(options);
        return players.map(p => ({
            ...p,
            name: p.display_name || p.real_name
        }));
    },

    /**
     * Get all teams with resolved display names
     */
    getAllTeamsWithAliases() {
        const teams = getAllTeams();
        return teams.map(t => ({
            ...t,
            name: t.display_name || t.real_name
        }));
    },

    /**
     * Bulk import aliases from a JSON file
     * Format: { players: { "ea_id": "display_name" }, teams: { "real_name": "display_name" } }
     * @param {string} jsonPath - Path to JSON file with aliases
     */
    importAliases(jsonPath) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const results = { players: 0, teams: 0, errors: [] };

        if (data.players) {
            for (const [eaPlayerId, displayName] of Object.entries(data.players)) {
                try {
                    setPlayerDisplayName(eaPlayerId, displayName);
                    results.players++;
                } catch (e) {
                    results.errors.push(`Player ${eaPlayerId}: ${e.message}`);
                }
            }
        }

        if (data.teams) {
            for (const [realName, displayName] of Object.entries(data.teams)) {
                try {
                    setTeamDisplayName(realName, displayName);
                    results.teams++;
                } catch (e) {
                    results.errors.push(`Team ${realName}: ${e.message}`);
                }
            }
        }

        return results;
    },

    /**
     * Export current aliases to JSON format
     * Only exports players/teams that have custom display names set
     */
    exportAliases() {
        const players = getAllPlayers();
        const teams = getAllTeams();

        const playerAliases = {};
        const teamAliases = {};

        players.forEach(p => {
            if (p.display_name && p.display_name !== p.real_name) {
                playerAliases[p.ea_player_id] = p.display_name;
            }
        });

        teams.forEach(t => {
            if (t.display_name && t.display_name !== t.real_name) {
                teamAliases[t.real_name] = t.display_name;
            }
        });

        return {
            players: playerAliases,
            teams: teamAliases
        };
    },

    /**
     * Generate a suggested alias (for convenience)
     * Creates a simple transformation of the real name
     */
    suggestAlias(realName) {
        // Simple transformations for player names
        const parts = realName.split(' ');
        if (parts.length > 1) {
            // Use first letter of first name + modified last name
            const firstInitial = parts[0][0];
            const lastName = parts[parts.length - 1];
            // Shift letters by 1
            const shiftedLast = lastName.split('').map(c => {
                if (c.match(/[a-z]/i)) {
                    const code = c.charCodeAt(0);
                    const base = c === c.toLowerCase() ? 97 : 65;
                    return String.fromCharCode(((code - base + 1) % 26) + base);
                }
                return c;
            }).join('');
            return `${firstInitial}. ${shiftedLast}`;
        }
        return realName + 'o';
    }
};

export default aliasManager;
