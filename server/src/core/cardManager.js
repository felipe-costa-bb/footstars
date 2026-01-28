import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbRequest } from '../infrastructure/db/repository.js';
import { aliasManager } from './aliasManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load all base players from DB
const loadAllPlayers = () => {
    try {
        const players = aliasManager.getAllPlayersWithAliases();
        if (players.length === 0) {
            console.log('⚠️ No players in database. Using fallback JSON data?');
            // Fallback for initial run before scrape
            try {
                const teamA = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/fc_lightning.json'), 'utf-8'));
                const teamB = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/real_titans.json'), 'utf-8'));
                const rawPlayers = [...teamA.players, ...teamB.players];

                // Normalize JSON structure to match DB structure
                return rawPlayers.map(p => ({
                    id: p.id,
                    name: p.name,
                    position: p.position,
                    // Flatten attributes
                    power: p.attributes.power,
                    shoot: p.attributes.shoot,
                    tackle: p.attributes.tackle,
                    pass: p.attributes.pass,
                    // Metadata - Ensure these exist or use defaults
                    overallRating: Math.round((p.attributes.power + p.attributes.shoot + p.attributes.tackle + p.attributes.pass) / 4), // Approximate rating if missing
                    team: p.id.includes('lightning') ? 'FC Lightning' : 'Real Titans',
                    nationality: 'Unknown',
                    imageUrl: null,
                    detailedStats: null
                }));
            } catch (e) {
                console.error('Error loading fallback JSON:', e);
                return [];
            }
        }

        // Map DB structure to expected game structure
        return players.map(p => ({
            id: p.ea_player_id,
            name: p.display_name || p.real_name,
            position: p.position,
            // Stats
            power: p.power,
            shoot: p.shoot,
            tackle: p.tackle,
            pass: p.pass,
            // Metadata
            overallRating: p.overall_rating,
            team: p.team_display_name || p.team_name,
            nationality: p.nationality,
            imageUrl: p.image_url,
            detailedStats: p.detailed_stats ? JSON.parse(p.detailed_stats) : null
        }));
    } catch (e) {
        console.error('Error loading players:', e);
        return [];
    }
};

const ALL_PLAYERS = loadAllPlayers();

export const cardManager = {
    // Grant starter pack (11 players)
    grantStarterPack: (userId) => {
        // For simplicity, give a random mix of 11 players covering positions
        // 1 GK, 4 DF, 4 MF, 2 FW
        const pack = [];
        pack.push(getRandomPlayerByPos('GK'));
        for (let i = 0; i < 4; i++) pack.push(getRandomPlayerByPos('DF'));
        for (let i = 0; i < 4; i++) pack.push(getRandomPlayerByPos('MF'));
        for (let i = 0; i < 2; i++) pack.push(getRandomPlayerByPos('FW'));

        const cardIds = [];
        for (const player of pack) {
            const card = dbRequest.createCard(userId, player.id);
            cardIds.push(card.id);
        }
        return cardIds;
    },

    // Grant daily pack (3 random players)
    grantDailyPack: (userId) => {
        const pack = [];
        for (let i = 0; i < 3; i++) {
            pack.push(ALL_PLAYERS[Math.floor(Math.random() * ALL_PLAYERS.length)]);
        }

        const newCards = [];
        for (const player of pack) {
            const card = dbRequest.createCard(userId, player.id);
            newCards.push(card);
        }
        return newCards;
    },

    // Ante Logic: Transfer random card from loser to winner
    processAnte: (winnerId, loserId, loserTeamCardIds) => {
        // Pick a random card from the loser's active team
        if (!loserTeamCardIds || loserTeamCardIds.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * loserTeamCardIds.length);
        const cardIdToTransfer = loserTeamCardIds[randomIndex];

        // Transfer ownership
        dbRequest.transferCard(cardIdToTransfer, winnerId);

        return cardIdToTransfer;
    },

    // Get user's full collection with player details
    getUserCollection: (userId) => {
        const cards = dbRequest.getUserCards(userId);
        return cards.map(card => {
            // Find player in ALL_PLAYERS cache
            // Note: ea_player_id is string.
            const player = ALL_PLAYERS.find(p => p.id === card.player_id);
            if (!player) return card;

            return {
                ...player,             // name, stats, etc.
                imageUrl: player.imageUrl,
                id: card.id,           // Preserve Unique Card ID from DB
                playerId: player.id,   // EA Player ID
                gainedAt: card.gained_at
            };
        });
    },

    // Get user's active team with full hydration
    getUserTeam: (userId) => {
        const team = dbRequest.getUserTeam(userId);
        if (!team) return null;

        // Hydrate players from card IDs
        // team.card_ids is array of integers (from SQLite JSON parse)
        const hydratedPlayers = team.card_ids.map(cardId => {
            const card = dbRequest.getCardById(cardId);
            if (!card) return null;

            const player = ALL_PLAYERS.find(p => p.id === card.player_id);
            if (!player) return card;

            return {
                ...player,
                imageUrl: player.imageUrl,
                id: card.id,
                playerId: player.id,
                gainedAt: card.gained_at
            };
        }).filter(p => p !== null);

        return {
            ...team,
            players: hydratedPlayers
        };
    },

    // Get a specific team by ID with full hydration
    getTeamById: (teamId) => {
        const team = dbRequest.getTeamById(teamId);
        if (!team) return null;

        // Hydrate players from card IDs
        const hydratedPlayers = team.card_ids.map(cardId => {
            const card = dbRequest.getCardById(cardId);
            if (!card) return null;

            const player = ALL_PLAYERS.find(p => p.id === card.player_id);
            if (!player) return card;

            return {
                ...player,
                imageUrl: player.imageUrl,
                id: card.id,
                playerId: player.id,
                gainedAt: card.gained_at,
                // Add attributes for game engine compatibility
                attributes: {
                    power: player.power,
                    shoot: player.shoot,
                    pass: player.pass,
                    tackle: player.tackle
                }
            };
        }).filter(p => p !== null);

        return {
            id: team.id,
            name: team.name,
            players: hydratedPlayers
        };
    },

    // Pack Shop: Buy a pack with coins
    buyPack: (userId, packType) => {
        const packConfig = {
            bronze: { cost: 500, count: 3 },
            silver: { cost: 1000, count: 5 },
            gold: { cost: 2500, count: 7 }
        };

        const pack = packConfig[packType];
        if (!pack) return { success: false, error: 'Invalid pack type' };

        // Check user coins
        const currentCoins = dbRequest.getUserCoins(userId);
        if (currentCoins < pack.cost) {
            return { success: false, error: 'Not enough coins' };
        }

        // Deduct coins
        dbRequest.updateUserCoins(userId, currentCoins - pack.cost);

        // Grant random cards
        const newCards = [];
        for (let i = 0; i < pack.count; i++) {
            const randomPlayer = ALL_PLAYERS[Math.floor(Math.random() * ALL_PLAYERS.length)];
            const card = dbRequest.createCard(userId, randomPlayer.id);
            newCards.push({ ...card, player: randomPlayer });
        }

        return {
            success: true,
            cards: newCards,
            newBalance: currentCoins - pack.cost
        };
    }
};

function getRandomPlayerByPos(pos) {
    const candidates = ALL_PLAYERS.filter(p => p.position === pos);
    return candidates[Math.floor(Math.random() * candidates.length)];
}
