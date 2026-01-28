import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GameEngine } from '../core/engine.js';
import { RNG } from '../rules/rng.js';
import { Zones, zoneName } from '../core/zones.js';
import { formatContestResult } from '../core/contest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load team from JSON file
 */
function loadTeam(path) {
  const fullPath = join(__dirname, '..', path);
  const data = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * AI picks best player based on attribute
 */
function pickBestPlayer(players, attribute) {
  return players.reduce((best, player) =>
    player.getAttribute(attribute) > best.getAttribute(attribute) ? player : best
  );
}

/**
 * AI decides whether to use Super Move
 * Simple heuristic: use it when margin is important
 */
function shouldUseSuperMove(engine, teamId, isShot = false) {
  if (!engine.canUseSuperMove(teamId)) return false;

  // Save Super Move for shots when possible
  if (!isShot && engine.state.ball.zone < Zones.ATTACK) {
    return false; // Don't waste on passes
  }

  // Use on shots, especially in close games
  return true;
}

/**
 * Simulate a single match
 */
function parseBool(val) {
  if (val === undefined || val === null) return undefined;
  const s = String(val).toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

function simulateMatch(seed, verbose = false, options = {}) {
  // Load teams
  const teamA = loadTeam('data/fc_lightning.json');
  const teamB = loadTeam('data/real_titans.json');

  // Create engine
  const engine = new GameEngine({
    teamA,
    teamB,
    rng: new RNG(seed)
  });

  // Coin flip for starting team
  const startingTeam = engine.rng.choice(['A', 'B']);
  // Determine roundsPerHalf and forceFullMatch from options, CLI args or env
  const roundsPerHalf = options.roundsPerHalf || process.env.ROUNDS_PER_HALF ? parseInt(process.env.ROUNDS_PER_HALF, 10) : undefined;
  const forceFullEnv = process.env.FORCE_FULL_MATCH;
  const forceFullMatch = typeof options.forceFullMatch !== 'undefined' ? options.forceFullMatch : parseBool(forceFullEnv) || false;

  engine.startMatch({ startingTeam, forceFullMatch, roundsPerHalf: roundsPerHalf || 45 });

  if (verbose) {
    console.log(`\n=== Match Start (Seed: ${seed}) ===`);
    console.log(`${teamA.name} vs ${teamB.name}`);
    console.log(`${engine.teams[startingTeam].name} starts with ball`);
    console.log(`Initial possession counts: A=${engine.state.possessionCount.A}, B=${engine.state.possessionCount.B}, Total=${engine.state.possessionCount.total}\n`);
  }

  let actionCount = 0;
  const maxActions = 100; // Safety limit

  // Main simulation loop
  while (!engine.isFinished() && actionCount < maxActions) {
    actionCount++;
    // Advance round counter
    engine.state.incrementRound();

    const {zone} = engine.state.ball;
    const currentTeam = engine.currentTeam();
    const opponentTeam = engine.otherTeam();

    if (verbose) {
      console.log(`[${actionCount}] ${currentTeam.name} in zone ${zone} (${engine.zoneName(zone)}). Possessions: A=${engine.state.possessionCount.A}, B=${engine.state.possessionCount.B}, Total=${engine.state.possessionCount.total}`);
    }

    if (zone < Zones.ATTACK) {
      // AI picks best passer
      const candidates = engine.playersInZone(currentTeam.id, zone);
      const passer = pickBestPlayer(candidates, 'pass');

      // AI picks best defender
      const targetZone = zone + 1;
      const defender = engine.pickOpponentForZone(opponentTeam.id, targetZone);

      // AI decides on Super Move
      const useSuperMove = shouldUseSuperMove(engine, currentTeam.id, false);

      if (verbose) {
        console.log(`     ${passer.name} (pass:${passer.getAttribute('pass')}) passes to zone ${targetZone}`);
        console.log(`     vs ${defender.name} (tackle:${defender.getAttribute('tackle')})`);
      }

      // Resolve pass
      const result = engine.resolvePass({
        passer,
        targetZone,
        opponentInZone: defender,
        context: { useSuperMove }
      });

      if (verbose) {
        const log = engine.state.logs[engine.state.logs.length - 1];
        if (log && log.contestResult) {
          console.log('\n  --- Contest details ---');
          console.log(`  ${passer.name} (pass: ${passer.getAttribute('pass')}) vs ${defender.name} (tackle: ${defender.getAttribute('tackle')})`);
          console.log(formatContestResult(log.contestResult, passer.name, defender.name));
          console.log(`  Outcome: ${log.outcome} (diff: ${log.contestResult.diff})`);
        }
        if (result.intercepted) {
          console.log(`     🔄 Possession switched to ${engine.currentTeam().name} - Zone: ${engine.state.ball.zone} (${zoneName(engine.state.ball.zone)})\n`);
        } else {
          console.log(`     ✓ Ball advanced to zone ${engine.state.ball.zone} (${zoneName(engine.state.ball.zone)})\n`);
        }
      }

    } else {
      // AI picks best shooter
      const attackers = engine.playersInZone(currentTeam.id, zone);
      const shooter = pickBestPlayer(attackers, 'shoot');

      const gk = engine.getGoalkeeper(opponentTeam.id);

      // AI decides on Super Move (more likely to use on shots)
      const useSuperMove = shouldUseSuperMove(engine, currentTeam.id, true);

      if (verbose) {
        console.log(`     ${shooter.name} (shoot:${shooter.getAttribute('shoot')}) shoots!`);
        console.log(`     vs ${gk.name} (power:${gk.getAttribute('power')})`);
      }

      // Resolve shot
      const result = engine.resolveShot({
        shooter,
        opponentGK: gk,
        context: { useSuperMove }
      });

      if (verbose) {
        const log = engine.state.logs[engine.state.logs.length - 1];
        if (log && log.contestResult) {
          console.log('\n  --- Contest details ---');
          console.log(`  ${shooter.name} (shoot: ${shooter.getAttribute('shoot')}) vs ${gk.name} (power: ${gk.getAttribute('power')})`);
          console.log(formatContestResult(log.contestResult, shooter.name, gk.name));
          console.log(`  Outcome: ${log.outcome} (diff: ${log.contestResult.diff})`);
        }
        if (result.goal) {
          console.log(`     ⚽ GOAL! Score: ${engine.state.getScoreSummary()}`);
          console.log(`     Possession to ${engine.currentTeam().name} from zone ${engine.state.ball.zone} (${zoneName(engine.state.ball.zone)})\n`);
        } else {
          console.log(`     🧤 Save! Possession to ${engine.currentTeam().name} - Zone: ${engine.state.ball.zone} (${zoneName(engine.state.ball.zone)})\n`);
        }
      }
    }

    // Check win condition
    engine.checkWinCondition();

    // Print any halftime or match end logs that were just added
    if (verbose) {
      const lastLog = engine.state.logs[engine.state.logs.length - 1];
      if (lastLog && lastLog.type === 'HALFTIME') {
        console.log(`\n=== HALFTIME ===\n${engine.teams.A.name} ${engine.state.score.A} - ${engine.state.score.B} ${engine.teams.B.name}\n`);
      }
      if (lastLog && lastLog.type === 'MATCH_END') {
        console.log(`\n=== FULL TIME ===\n${engine.getMatchSummary()}\n`);
      }
    }
  }

  if (verbose) {
    console.log(`=== Match End ===`);
    console.log(engine.getMatchSummary());
    console.log(`Total actions: ${actionCount}`);
  }

  return {
    winner: engine.state.winner,
    score: { ...engine.state.score },
    possessions: { ...engine.state.possessionCount },
    totalActions: actionCount,
    logs: engine.state.logs
  };
}

/**
 * Run multiple simulations
 */
function runSimulations(count = 10, options = {}) {
  console.log(`\n⚽ Running ${count} simulated matches...\n`);
  if (Object.keys(options).length > 0) {
    console.log(`Options: ${JSON.stringify(options)}`);
  }

  const results = {
    teamA: 0,
    teamB: 0,
    draws: 0,
    totalGoals: 0,
    totalActions: 0
  };

  for (let i = 0; i < count; i++) {
    const seed = Date.now() + i * 1000; // Different seed for each match
    const result = simulateMatch(seed, false, options);

    if (result.winner === 'A') {
      results.teamA++;
    } else if (result.winner === 'B') {
      results.teamB++;
    } else {
      results.draws++;
    }

    results.totalGoals += result.score.A + result.score.B;
    results.totalActions += result.totalActions;

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`  Completed ${i + 1}/${count} matches...`);
    }
  }

  console.log('\n=== SIMULATION RESULTS ===');
  console.log(`Total Matches: ${count}`);
  console.log(`\nWins:`);
  console.log(`  FC Lightning (A): ${results.teamA} (${(results.teamA / count * 100).toFixed(1)}%)`);
  console.log(`  Real Titans (B): ${results.teamB} (${(results.teamB / count * 100).toFixed(1)}%)`);
  console.log(`  Draws: ${results.draws} (${(results.draws / count * 100).toFixed(1)}%)`);
  console.log(`\nAverage Goals per Match: ${(results.totalGoals / count).toFixed(2)}`);
  console.log(`Average Actions per Match: ${(results.totalActions / count).toFixed(1)}`);
  console.log('');
}

// Parse command line arguments
const rawArgs = process.argv.slice(2);
const mode = rawArgs[0] || 'multi';

// Simple flag parsing for --rounds-per-half and --force-full
function parseFlags(argv) {
  const opts = {};
  argv.forEach(arg => {
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    }
    if (arg.startsWith('--rounds-per-half=')) {
      opts.roundsPerHalf = parseInt(arg.split('=')[1], 10);
    }
    if (arg.startsWith('--force-full=')) {
      const v = arg.split('=')[1];
      opts.forceFullMatch = parseBool(v);
    }
  });
  return opts;
}

const flags = parseFlags(rawArgs.slice(1));

if (flags.help) {
  console.log('Field Battle Soccer Simulator');
  console.log('');
  console.log('Usage:');
  console.log('  node src/cli/simulate.js single [--rounds-per-half=30] [--force-full=true]    # Run single verbose match');
  console.log('  node src/cli/simulate.js multi [n] [--rounds-per-half=30] [--force-full=true] # Run n simulated matches (default: 10)');
  console.log('');
  console.log('Options:');
  console.log('  --rounds-per-half=N    Number of rounds per half (default: 45)');
  console.log('  --force-full=BOOL      Force full match even if goal scored early (default: false)');
  console.log('  --help, -h             Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  ROUNDS_PER_HALF=N      Same as --rounds-per-half');
  console.log('  FORCE_FULL_MATCH=BOOL  Same as --force-full');
  process.exit(0);
}

if (mode === 'single') {
  // Run single verbose match
  const seed = Date.now();
  simulateMatch(seed, true, flags);
} else if (mode === 'multi') {
  // Run multiple matches with statistics
  const count = parseInt(rawArgs[1], 10) || 10;
  runSimulations(count, flags);

} else {
  console.log('Field Battle Soccer Simulator');
  console.log('');
  console.log('Usage:');
  console.log('  node src/cli/simulate.js single [--rounds-per-half=30] [--force-full=true]    # Run single verbose match');
  console.log('  node src/cli/simulate.js multi [n] [--rounds-per-half=30] [--force-full=true] # Run n simulated matches (default: 10)');
  console.log('');
  console.log('Options:');
  console.log('  --rounds-per-half=N    Number of rounds per half (default: 45)');
  console.log('  --force-full=BOOL      Force full match even if goal scored early (default: false)');
  console.log('  --help, -h             Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  ROUNDS_PER_HALF=N      Same as --rounds-per-half');
  console.log('  FORCE_FULL_MATCH=BOOL  Same as --force-full');
}
