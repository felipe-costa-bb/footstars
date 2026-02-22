#!/usr/bin/env node
/**
 * EA Sports FC Libertadores Player Scraper
 * Scrapes player ratings from https://www.ea.com/en/games/ea-sports-fc/ratings/leagues-ratings/libertadores/1003
 */

import * as cheerio from 'cheerio';
import { initScraperSchema, upsertPlayer, upsertTeam, getPlayerCount } from '../src/infrastructure/db/scraper_schema.js';

const BASE_URL = 'https://www.ea.com/en/games/ea-sports-fc/ratings/leagues-ratings/libertadores/1003';
const DELAY_BETWEEN_PAGES = 500;

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
};

const MAX_PAGES = getArg('pages') ? parseInt(getArg('pages')) : 20; // Default to ~20 pages for safety
const START_PAGE = getArg('start') ? parseInt(getArg('start')) : 1;
const MIN_RATING = getArg('min-rating') ? parseInt(getArg('min-rating')) : 0;

/**
 * Map EA position codes to simplified positions for the game
 * (Reusing logic from scrape_ea_players.js)
 */
function mapPosition(eaPositionLabel, eaPositionId) {
    const label = (eaPositionLabel || '').toLowerCase();

    if (label.includes('goalkeeper')) return 'GK';

    // Defenders
    if (label.includes('center back')) return 'CB';
    if (label.includes('left back')) return 'LB';
    if (label.includes('right back')) return 'RB';
    if (label.includes('wing back') && label.includes('left')) return 'LWB';
    if (label.includes('wing back') && label.includes('right')) return 'RWB';
    if (label.includes('back')) return 'CB';
    if (label.includes('defender')) return 'CB';

    // Midfielders
    if (label.includes('defensive mid')) return 'CDM';
    if (label.includes('attacking mid')) return 'CAM';
    if (label.includes('center mid')) return 'CM';
    if (label.includes('left mid')) return 'LM';
    if (label.includes('right mid')) return 'RM';
    if (label.includes('midfield')) return 'CM';

    // Forwards
    if (label.includes('cf') || label.includes('center forward')) return 'CF';
    if (label.includes('st') || label.includes('striker')) return 'ST';
    if (label.includes('left wing')) return 'LW';
    if (label.includes('right wing')) return 'RW';
    if (label.includes('wing')) return 'RW';
    if (label.includes('forward')) return 'ST';

    return 'CM';
}

/**
 * Fetch and parse a single page
 */
async function scrapePage(pageNum) {
    // The URL structure for pagination usually involves a query param like ?page=x
    // However, for the leagues specific page, we need to verify if ?page= works.
    // Standard EA ratings page uses ?page=X. Let's assume it works here too.
    const url = `${BASE_URL}?page=${pageNum}`;
    console.log(`📄 Scraping page ${pageNum}: ${url}`);

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.ok) {
            console.error(`   ❌ HTTP Error ${res.status}`);
            return [];
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const nextData = $('#__NEXT_DATA__').html();

        if (!nextData) return [];

        const json = JSON.parse(nextData);

        // Found structure in check_libertadores_structure.js:
        // json.props.pageProps.ratingsEntries.items
        if (json.props?.pageProps?.ratingsEntries?.items) {
            return json.props.pageProps.ratingsEntries.items;
        }

        // Fallback or empty
        return [];

    } catch (error) {
        console.error(`   ❌ Error fetching page ${pageNum}: ${error.message}`);
        return [];
    }
}

async function main() {
    console.log('🚀 Libertadores Player Scraper');
    console.log(`   Pages: ${START_PAGE} to ${MAX_PAGES}`);

    initScraperSchema();
    const initialCount = getPlayerCount();
    console.log(`   Current player count: ${initialCount}`);
    console.log('');

    let totalScraped = 0;
    let totalSkipped = 0;

    for (let pageNum = START_PAGE; pageNum <= MAX_PAGES; pageNum++) {
        const players = await scrapePage(pageNum);

        if (players.length === 0) {
            console.log(`   ⚠️ No players returned for page ${pageNum}. Stopping.`);
            break; // Stop if no players returned, likely end of pagination
        }

        for (const p of players) {
            if (p.overallRating && p.overallRating < MIN_RATING) {
                totalSkipped++;
                continue;
            }

            const s = p.stats || {};

            // Map gender if available, though Libertadores is male
            // Some entries might differentiate.

            const playerData = {
                ea_player_id: String(p.id),
                real_name: `${p.firstName} ${p.lastName}`.trim(),
                display_name: p.commonName || null, // Use commonName if available
                position: mapPosition(p.position?.label || '', p.position?.id),
                overall_rating: p.overallRating,

                // Stats
                shooting: s.sho?.value,
                passing: s.pas?.value,
                dribbling: s.dri?.value,
                defending: s.def?.value,
                physicality: s.phy?.value,
                // pace is 'pac' usually

                // Metadata
                nationality: p.nationality?.label,
                team_name: p.team?.label,
                image_url: p.avatarUrl,
                player_url: `https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/${p.firstName}-${p.lastName}/${p.id}`.toLowerCase().replace(/\s+/g, '-'),

                detailed_stats: p.stats
            };

            upsertPlayer(playerData);
            totalScraped++;

            if (p.team) {
                upsertTeam({
                    ea_team_id: String(p.team.id),
                    real_name: p.team.label,
                    league: 'CONMEBOL Libertadores'
                });
            }
        }

        console.log(`   ✅ Page ${pageNum} done. ${players.length} extracted.`);

        if (pageNum < MAX_PAGES) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_PAGES));
        }
    }

    console.log('');
    console.log('🎉 Scraping complete!');
    console.log(`   New players added/updated: ${totalScraped}`);
    console.log(`   Total in database: ${getPlayerCount()}`);
}

main().catch(console.error);
