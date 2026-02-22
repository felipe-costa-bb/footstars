#!/usr/bin/env node
/**
 * EA Sports FC Player Data Scraper (Static Version)
 * Scrapes player ratings from https://www.ea.com/games/ea-sports-fc/ratings
 * Uses static JSON extraction from __NEXT_DATA__ to bypass browser requirements.
 * 
 * Usage:
 *   node scripts/scrape_ea_players.js                    # Scrape all pages
 *   node scripts/scrape_ea_players.js --pages 5          # Scrape first 5 pages
 *   node scripts/scrape_ea_players.js --start 50         # Resume from page 50
 *   node scripts/scrape_ea_players.js --min-rating 80    # Only players 80+ rated
 */

import * as cheerio from 'cheerio';
import { initScraperSchema, upsertPlayer, upsertTeam, getPlayerCount } from '../src/infrastructure/db/scraper_schema.js';

const BASE_URL = 'https://www.ea.com/games/ea-sports-fc/ratings';
const DELAY_BETWEEN_PAGES = 100; // 0.1 second between pages for speed

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
};

const MAX_PAGES = getArg('pages') ? parseInt(getArg('pages')) : 179;
const START_PAGE = getArg('start') ? parseInt(getArg('start')) : 1;
const MIN_RATING = getArg('min-rating') ? parseInt(getArg('min-rating')) : 0;

/**
 * Map EA position codes to simplified positions for the game
 */
function mapPosition(eaPositionLabel, eaPositionId) {
    // e.g. "Right Midfielder", "Center Back"
    const label = (eaPositionLabel || '').toLowerCase();

    if (label.includes('goalkeeper')) return 'GK';

    // Defenders
    if (label.includes('center back')) return 'CB';
    if (label.includes('left back')) return 'LB';
    if (label.includes('right back')) return 'RB';
    if (label.includes('wing back') && label.includes('left')) return 'LWB';
    if (label.includes('wing back') && label.includes('right')) return 'RWB';
    if (label.includes('back')) return 'CB'; // Default defender
    if (label.includes('defender')) return 'CB';

    // Midfielders
    if (label.includes('defensive mid')) return 'CDM';
    if (label.includes('attacking mid')) return 'CAM';
    if (label.includes('center mid')) return 'CM';
    if (label.includes('left mid')) return 'LM';
    if (label.includes('right mid')) return 'RM';
    if (label.includes('midfield')) return 'CM'; // Default mid

    // Forwards
    if (label.includes('cf') || label.includes('center forward')) return 'CF';
    if (label.includes('st') || label.includes('striker')) return 'ST';
    if (label.includes('left wing')) return 'LW';
    if (label.includes('right wing')) return 'RW';
    if (label.includes('wing')) return 'RW'; // Default wing? Or maybe generic
    if (label.includes('forward')) return 'ST'; // Default forward

    return 'CM'; // Ultimate fallback
}

/**
 * Fetch and parse a single page
 */
async function scrapePage(pageNum) {
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

        // Find items in ratingDetails
        if (json.props?.pageProps?.ratingDetails?.items) {
            return json.props.pageProps.ratingDetails.items;
        }

        console.log('   ⚠️ No items found in JSON structure');
        return [];

    } catch (error) {
        console.error(`   ❌ Error fetching page ${pageNum}: ${error.message}`);
        return [];
    }
}

/**
 * Main scraping function
 */
async function main() {
    console.log('🚀 EA Sports FC Player Scraper (Static Engine)');
    console.log(`   Pages: ${START_PAGE} to ${MAX_PAGES}`);
    console.log(`   Min Rating: ${MIN_RATING}`);
    console.log('');

    // Initialize database schema
    initScraperSchema();
    console.log(`   Current player count: ${getPlayerCount()}`);
    console.log('');

    let totalScraped = 0;
    let totalSkipped = 0;

    for (let pageNum = START_PAGE; pageNum <= MAX_PAGES; pageNum++) {
        const players = await scrapePage(pageNum);

        if (players.length === 0) {
            console.log(`   ⚠️ No players returned for page ${pageNum}.`);
        }

        for (const p of players) {
            // Skip if below minimum rating
            if (p.overallRating && p.overallRating < MIN_RATING) {
                totalSkipped++;
                continue;
            }

            // Map stats (EA uses abbreviations like 'pac', but fallbacks exist)
            const s = p.stats || {};

            const playerData = {
                ea_player_id: String(p.id),
                real_name: `${p.firstName} ${p.lastName}`.trim(),
                display_name: null,
                position: mapPosition(p.position?.label || '', p.position?.id),
                overall_rating: p.overallRating,

                // EA stats
                pace: s.pac?.value || s.acceleration?.value,
                shooting: s.sho?.value,
                passing: s.pas?.value,
                dribbling: s.dri?.value,
                defending: s.def?.value,
                physicality: s.phy?.value,

                // Metadata
                nationality: p.nationality?.label,
                team_name: p.team?.label,
                image_url: p.avatarUrl,
                player_url: `https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/${p.firstName}-${p.lastName}/${p.id}`.toLowerCase().replace(/\s+/g, '-'),

                // Full raw stats for future-proofing
                detailed_stats: p.stats
            };

            // Upsert player
            upsertPlayer(playerData);
            totalScraped++;

            // Upsert team
            if (p.team) {
                upsertTeam({
                    ea_team_id: String(p.team.id),
                    real_name: p.team.label
                });
            }
        }

        if (players.length > 0) {
            console.log(`   ✅ Page ${pageNum} done. ${players.length} extracted. Total saved: ${totalScraped}`);
        }

        if (pageNum < MAX_PAGES) {
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_PAGES));
        }
    }

    console.log('');
    console.log('🎉 Scraping complete!');
    console.log(`   Total players saved: ${totalScraped}`);
    console.log(`   Total players skipped: ${totalSkipped}`);
    console.log(`   Total in database: ${getPlayerCount()}`);
}

main().catch(console.error);
