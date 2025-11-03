import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import readline from 'node:readline/promises';
import { GameEngine } from '../core/engine.js';
import { RNG } from '../rules/rng.js';
import { Zones, zoneName } from '../core/zones.js';
import { formatContestResult } from '../core/contest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Console colors for better readability
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * Format text with color
 */
function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

/**
 * Load team from JSON file
 */
function loadTeam(path) {
  try {
    const fullPath = join(__dirname, '..', path);
    const data = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading team from ${path}:`, error.message);
    process.exit(1);
  }
}

/**
 * Print a divider
 */
function printDivider(char = '=', length = 60) {
  console.log(char.repeat(length));
}

/**
 * Print game header
 */
function printHeader(text) {
  printDivider();
  console.log(colorize(text.toUpperCase(), colors.bright + colors.cyan));
  printDivider();
}

/**
 * Print section header
 */
function printSection(text) {
  console.log('\n' + colorize(text, colors.bright + colors.yellow));
  console.log('-'.repeat(text.length));
}

/**
 * Display current game state
 */
function displayGameState(engine) {
  const state = engine.state;
  const currentTeam = engine.currentTeam();
  const zone = zoneName(state.ball.zone);
  
  console.log('');
  printSection('CURRENT STATE');
  console.log(`Score: ${colorize(`Team A ${state.score.A} - ${state.score.B} Team B`, colors.bright)}`);
  console.log(`Possessions: A: ${state.possessionCount.A} | B: ${state.possessionCount.B} | Total: ${state.possessionCount.total}`);
  console.log(`Ball: ${colorize(currentTeam.name, colors.green)} at ${colorize(zone, colors.yellow)}`);
  console.log(`Super Move: A: ${engine.canUseSuperMove('A') ? '✓' : '✗'} | B: ${engine.canUseSuperMove('B') ? '✓' : '✗'}`);
  console.log('');
}

/**
 * Display player selection menu
 */
function displayPlayers(players, title = 'Select a player:') {
  console.log(colorize(title, colors.bright));
  players.forEach((player, idx) => {
    const fatigueState = engine.fatigue.getState(player.id);
    const fatigueIndicator = fatigueState.penaltyPending ? 
      colorize(' [TIRED!]', colors.red) : 
      fatigueState.count > 0 ? ` [${fatigueState.count}/3]` : '';
    
    console.log(
      `  ${idx + 1}. ${colorize(player.name, colors.bright)} (${player.position})${fatigueIndicator} - ` +
      `Pass: ${player.attributes.pass} | Tackle: ${player.attributes.tackle} | ` +
      `Shoot: ${player.attributes.shoot} | Power: ${player.attributes.power}`
    );
  });
}

/**
 * Get user input for player selection
 */
async function selectPlayer(rl, players, promptMsg) {
  displayPlayers(players, promptMsg);
  
  while (true) {
    const answer = await rl.question(colorize('\nYour choice (number): ', colors.cyan));
    const idx = parseInt(answer, 10) - 1;
    
    if (idx >= 0 && idx < players.length) {
      return players[idx];
    }
    console.log(colorize('Invalid selection. Please try again.', colors.red));
  }
}

/**
 * Ask yes/no question
 */
async function askYesNo(rl, question) {
  const answer = await rl.question(colorize(`${question} (y/n): `, colors.cyan));
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Display contest result
 */
function displayContestResult(result, attackerName, defenderName) {
  printSection('CONTEST RESULT');
  console.log(formatContestResult(result, attackerName, defenderName));
}

/**
 * Display last event
 */
function displayLastEvent(engine) {
  const logs = engine.state.logs;
  if (logs.length === 0) return;
  
  const lastEvent = logs[logs.length - 1];
  // Always print event header with zone and possession info
  const zoneLabel = zoneName(engine.state.ball.zone);
  const poss = engine.state.possessionCount;
  console.log('\n' + colorize(`[${logs.length}] ${engine.teams[lastEvent.teamId]?.name || 'Unknown'} event in zone ${engine.state.ball.zone} (${zoneLabel}). Possessions: A=${poss.A}, B=${poss.B}, Total=${poss.total}`, colors.bright));

  switch (lastEvent.type) {
    case 'PASS':
      console.log(colorize(`✓ PASS: ${lastEvent.description}`, colors.green));
      break;
    case 'INTERCEPT':
      console.log(colorize(`✗ INTERCEPT: ${lastEvent.description}`, colors.red));
      break;
    case 'SHOT':
      console.log(colorize(`⚽ SHOT: ${lastEvent.description}`, colors.yellow));
      break;
    case 'SAVE':
      console.log(colorize(`🧤 SAVE: ${lastEvent.description}`, colors.blue));
      break;
    case 'GOAL':
      console.log(colorize(`⚽⚽⚽ GOAL: ${lastEvent.description} ⚽⚽⚽`, colors.bright + colors.green));
      break;
    default:
      console.log(colorize(`${lastEvent.type}: ${lastEvent.description || ''}`, colors.cyan));
  }

  // If the event has a contest result, show the detailed breakdown
  if (lastEvent.contestResult) {
    console.log('');
    console.log(colorize('Detailed roll breakdown:', colors.bright + colors.magenta));
    console.log(formatContestResult(lastEvent.contestResult, lastEvent.playerName || 'Attacker', lastEvent.defenderName || 'Defender'));
    console.log('');
    // Show explicit totals and diff
    const cr = lastEvent.contestResult;
    console.log(`Outcome: ${cr.diff >= 5 ? 'DECISIVE' : cr.diff > 0 ? 'WIN' : cr.diff === 0 ? 'TIE' : 'LOSS'} (diff: ${cr.diff})`);
  }

  // Show resulting possession and zone after the event
  const afterZone = engine.state.ball.zone;
  const afterZoneName = zoneName(afterZone);
  console.log(colorize(`Possession: ${engine.teams[engine.state.ball.teamInPossessionId].name} - Zone: ${afterZone} (${afterZoneName})`, colors.bright + colors.cyan));
}

/**
 * Main game loop
 */
async function runGame() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    printHeader('⚽ Field Battle - Console Edition ⚽');
    
    // Load teams
    console.log('\nLoading teams...');
    const teamA = loadTeam('data/fc_lightning.json');
    const teamB = loadTeam('data/real_titans.json');
    console.log(`${colorize('✓', colors.green)} Loaded: ${teamA.name} vs ${teamB.name}`);
    
    // Setup game
    console.log('\nInitializing game engine...');
    const seed = Date.now();
    console.log(`${colorize('✓', colors.green)} RNG Seed: ${seed}`);
    
    // Make engine global for helper functions
    global.engine = new GameEngine({ 
      teamA, 
      teamB, 
      rng: new RNG(seed) 
    });
    const engine = global.engine;
    
    // Choose starting team
    console.log('\n');
    const startWithA = await askYesNo(rl, `Start with ${teamA.name} (Team A)?`);
    const startingTeam = startWithA ? 'A' : 'B';
    
    engine.startMatch({ startingTeam });
    console.log(`\n${colorize('⚽ KICKOFF!', colors.bright + colors.green)} ${engine.currentTeam().name} starts with the ball!\n`);
    
    // Main game loop
    while (!engine.isFinished()) {
      displayGameState(engine);
      
      const zone = engine.state.ball.zone;
      const currentTeam = engine.currentTeam();
      const opponentTeam = engine.otherTeam();
      
      if (zone < Zones.ATTACK) {
        // Passing phase
        printSection(`${currentTeam.name} - PASSING FROM ${zoneName(zone).toUpperCase()}`);
        
        const candidates = engine.playersInZone(currentTeam.id, zone);
        const passer = await selectPlayer(
          rl, 
          candidates, 
          `Choose a player to pass the ball:`
        );
        
        // Auto-select best defender
        const targetZone = zone + 1;
        const defender = engine.pickOpponentForZone(opponentTeam.id, targetZone);
        console.log(`\n${colorize('→', colors.yellow)} ${opponentTeam.name}'s ${colorize(defender.name, colors.red)} will defend in ${zoneName(targetZone)}`);
        
        // Ask about Super Move
        let useSuperMove = false;
        if (engine.canUseSuperMove(currentTeam.id)) {
          useSuperMove = await askYesNo(
            rl, 
            `\n${colorize('SUPER MOVE available!', colors.magenta)} Use it for this pass (+10 bonus)?`
          );
        }
        
        console.log('');
        printSection('ROLLING DICE...');
        
        // Resolve pass
        const result = engine.resolvePass({
          passer,
          targetZone,
          opponentInZone: defender,
          context: { useSuperMove }
        });
        
        const lastLog = engine.state.logs[engine.state.logs.length - 1];
        displayContestResult(lastLog.contestResult, passer.name, defender.name);
        console.log('');
        displayLastEvent(engine);
        
      } else {
        // Shooting phase
        printSection(`${currentTeam.name} - ATTACKING! TAKE A SHOT!`);
        
        const attackers = engine.playersInZone(currentTeam.id, zone);
        const shooter = await selectPlayer(
          rl, 
          attackers, 
          `Choose a player to shoot:`
        );
        
        const gk = engine.getGoalkeeper(opponentTeam.id);
        console.log(`\n${colorize('🧤', colors.blue)} ${opponentTeam.name}'s ${colorize(gk.name, colors.red)} is in goal`);
        
        // Check for counter-attack
        if (engine.state.ball.lastEvent === 'INTERCEPT') {
          console.log(colorize('\n⚡ COUNTER-ATTACK! +5 bonus to shooting!', colors.yellow));
        }
        
        // Ask about Super Move
        let useSuperMove = false;
        if (engine.canUseSuperMove(currentTeam.id)) {
          useSuperMove = await askYesNo(
            rl, 
            `\n${colorize('SUPER MOVE available!', colors.magenta)} Use it for this shot (+10 bonus)?`
          );
        }
        
        console.log('');
        printSection('ROLLING DICE...');
        
        // Resolve shot
        const result = engine.resolveShot({
          shooter,
          opponentGK: gk,
          context: { useSuperMove }
        });
        
        const lastLog = engine.state.logs[engine.state.logs.length - 1];
        displayContestResult(lastLog.contestResult, shooter.name, gk.name);
        console.log('');
        displayLastEvent(engine);
        
        if (result.goal) {
          console.log(colorize('\n🎉 GOAL SCORED! 🎉\n', colors.bright + colors.green));
        }
      }
      
      // Check win condition
      engine.checkWinCondition();
      
      if (!engine.isFinished()) {
        await rl.question(colorize('\nPress Enter to continue...', colors.cyan));
      }
    }
    
    // Match finished
    console.log('\n');
    printHeader('⚽ MATCH FINISHED! ⚽');
    console.log('');
    console.log(engine.getMatchSummary());
    console.log('');
    printDivider();
    
  } catch (error) {
    console.error(colorize('\nError during game:', colors.red), error.message);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// Run the game
runGame().catch(console.error);
