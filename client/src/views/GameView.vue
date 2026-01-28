<template>
  <div class="w-full h-screen bg-black relative overflow-hidden flex items-center justify-center">
    
    <!-- Game Board (Pitch) -->
    <div class="relative w-[95vw] h-[90vh] bg-field-green rounded-xl border-4 border-white/10 shadow-2xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/grass.png')]">
      
      <!-- Field Markings -->
      <div class="absolute inset-8 border-2 border-white/40 opacity-80 rounded-lg"></div>
      <div class="absolute top-8 bottom-8 left-1/2 w-0.5 bg-white/40 opacity-80"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full opacity-80"></div>
      
      <!-- Penalty Areas -->
      <div class="absolute top-1/2 left-8 transform -translate-y-1/2 w-32 h-64 border-2 border-l-0 border-white/40 opacity-80 rounded-r-lg"></div>
      <div class="absolute top-1/2 left-8 transform -translate-y-1/2 w-12 h-32 border-2 border-l-0 border-white/40 opacity-80 rounded-r-lg"></div>
      <div class="absolute top-1/2 right-8 transform -translate-y-1/2 w-32 h-64 border-2 border-r-0 border-white/40 opacity-80 rounded-l-lg"></div>
      <div class="absolute top-1/2 right-8 transform -translate-y-1/2 w-12 h-32 border-2 border-r-0 border-white/40 opacity-80 rounded-l-lg"></div>

      <!-- Zone Highlights -->
      <div class="absolute inset-0 grid grid-cols-4 pointer-events-none">
        <div class="border-r border-white/10" :class="{ 'bg-yellow-500/20': currentZone === 0 && possession === 'A' }"></div>
        <div class="border-r border-white/10" :class="{ 'bg-yellow-500/20': currentZone === 1 && possession === 'A' }"></div>
        <div class="border-r border-white/10" :class="{ 'bg-yellow-500/20': currentZone === 2 && possession === 'A' }"></div>
        <div :class="{ 'bg-red-500/20': currentZone === 3 && possession === 'A' }"></div>
      </div>

      <!-- Player Tokens -->
      <PlayerToken 
        v-for="p in playersA" :key="p.id" 
        :x="p.x" :y="p.y" team="A" :id="p.id" :name="p.name" :role="p.role" :imageUrl="p.imageUrl" 
        :selected="currentAttacker?.id === p.id && possession === 'A'"
      />
      <PlayerToken 
        v-for="p in playersB" :key="p.id" 
        :x="p.x" :y="p.y" team="B" :id="p.id" :name="p.name" :role="p.role" :imageUrl="p.imageUrl" 
        :selected="currentAttacker?.id === p.id && possession === 'B'"
      />

      <!-- Soccer Ball -->
      <div 
        class="absolute w-6 h-6 z-30 transition-all duration-700 ease-out"
        :style="ballPosition"
      >
        <svg viewBox="0 0 24 24" class="w-full h-full drop-shadow-lg">
          <circle cx="12" cy="12" r="11" fill="white" stroke="#333" stroke-width="1"/>
          <path d="M12 1 L12 5 M12 19 L12 23 M1 12 L5 12 M19 12 L23 12" stroke="#333" stroke-width="0.5"/>
          <polygon points="12,3 15,7 12,11 9,7" fill="#333" opacity="0.8"/>
          <polygon points="12,21 15,17 12,13 9,17" fill="#333" opacity="0.8"/>
          <polygon points="3,12 7,15 11,12 7,9" fill="#333" opacity="0.8"/>
          <polygon points="21,12 17,15 13,12 17,9" fill="#333" opacity="0.8"/>
        </svg>
      </div>

    </div>

    <!-- HUD Overlay -->
    <ScoreBoard 
      :teamA="teamAName" :teamB="teamBName" 
      :scoreA="scoreA" :scoreB="scoreB" 
      :time="roundDisplay" 
    />

    <!-- Game Phase Overlays -->
    
    <!-- Battle Phase -->
    <RoundBattle 
      v-if="gamePhase === 'BATTLE'"
      :attacker="currentAttacker"
      :defender="currentDefender"
      :attackerTeam="possession === 'A' ? teamAName : teamBName"
      :defenderTeam="possession === 'A' ? teamBName : teamAName"
      :actionType="currentAction"
    />
    
    <!-- Dice Roll Phase -->
    <DiceRoll 
      v-if="gamePhase === 'DICE'"
      :dice1="diceResult.d1"
      :dice2="diceResult.d2"
      :modifier="diceResult.modifier"
      :modifierLabel="diceResult.modLabel"
      :targetValue="diceResult.target"
      @complete="onDiceComplete"
    />
    
    <!-- Result Phase -->
    <RoundResult 
      v-if="gamePhase === 'RESULT'"
      :outcome="roundOutcome"
      :attackerTeam="teamAName"
      :defenderTeam="teamBName"
      :scoreA="scoreA"
      :scoreB="scoreB"
      @continue="onContinue"
    />

    <!-- Action Selector (when waiting for user input) -->
    <ActionSelector 
      v-if="gamePhase === 'SELECT' && possession === 'A'"
      :zone="currentZone"
      :ballHolder="currentAttacker?.name || 'Player'"
      @action="onActionSelected"
    />

    <!-- Pass Target Selection -->
    <PlayerSelector 
      v-if="gamePhase === 'PASS_SELECT' && possession === 'A'"
      :players="teamARoster?.players || []"
      :currentPlayerId="currentAttacker?.id"
      :currentZone="currentZone"
      @select="onPassTargetSelected"
      @cancel="gamePhase = 'SELECT'"
    />

    <!-- Opponent Turn Indicator -->
    <div v-if="gamePhase === 'SELECT' && possession === 'B'" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <div class="bg-red-600/80 backdrop-blur-lg rounded-2xl px-8 py-4 text-white font-bold animate-pulse">
        Opponent's Turn...
      </div>
    </div>

    <!-- Match End Overlay -->
    <div v-if="gamePhase === 'END'" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="text-6xl mb-4">🏆</div>
        <div class="text-4xl font-black text-white mb-2">MATCH OVER</div>
        <div class="text-2xl mb-8" :class="scoreA > scoreB ? 'text-green-400' : scoreA < scoreB ? 'text-red-400' : 'text-gray-400'">
          {{ teamAName }} {{ scoreA }} - {{ scoreB }} {{ teamBName }}
        </div>
        <div class="text-3xl mb-8">
          <span v-if="scoreA > scoreB" class="text-green-400 font-bold">YOU WIN!</span>
          <span v-else-if="scoreA < scoreB" class="text-red-400 font-bold">YOU LOSE</span>
          <span v-else class="text-gray-400">DRAW</span>
        </div>
        <button @click="$router.push('/dashboard')" class="px-12 py-4 bg-white text-black font-bold text-xl rounded-lg">
          BACK TO DASHBOARD
        </button>
      </div>
    </div>

    <!-- Event Log -->
    <div class="absolute bottom-6 right-6 w-64 h-32 bg-black/60 backdrop-blur-md rounded-lg p-2 overflow-hidden border border-white/10 font-mono text-xs text-gray-300">
       <div class="text-white font-bold mb-1 border-b border-white/10 pb-1">MATCH LOG</div>
       <div class="space-y-1 overflow-y-auto h-20">
         <div v-for="(log, i) in logs" :key="i" class="truncate" :class="{
           'text-green-400': log.type === 'GOAL',
           'text-blue-400': log.type === 'SAVE',
           'text-red-400': log.type === 'INTERCEPT',
           'text-gray-400': log.type === 'PASS'
         }">
           {{ log.text }}
         </div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSessionStore } from '../stores/session';
import ScoreBoard from '../components/game/ScoreBoard.vue';
import PlayerToken from '../components/game/PlayerToken.vue';
import RoundBattle from '../components/game/RoundBattle.vue';
import DiceRoll from '../components/game/DiceRoll.vue';
import RoundResult from '../components/game/RoundResult.vue';
import ActionSelector from '../components/game/ActionSelector.vue';
import PlayerSelector from '../components/game/PlayerSelector.vue';

const router = useRouter();
const route = useRoute();
const sessionStore = useSessionStore();

// Game State
const gamePhase = ref('SELECT'); // SELECT, PASS_SELECT, BATTLE, DICE, RESULT, END
const possession = ref('A'); // 'A' = user, 'B' = opponent
const currentZone = ref(1); // 0=GK, 1=DEF, 2=MID, 3=ATT
const scoreA = ref(0);
const scoreB = ref(0);
const round = ref(1);
const maxRounds = ref(20);
const currentAction = ref('PASS');
const roundOutcome = ref('');
const logs = ref([]);

// Teams data
const teamARoster = ref(null);
const teamBRoster = ref(null);

// Battle state
const currentAttacker = ref(null);
const currentDefender = ref(null);
const passTarget = ref(null); // Selected player to receive the pass
const diceResult = ref({ d1: 1, d2: 1, modifier: 0, modLabel: '', target: 0 });

// Computed
const teamAName = computed(() => teamARoster.value?.name || 'Your Team');
const teamBName = computed(() => teamBRoster.value?.name || 'Opponent');
const roundDisplay = computed(() => `Round ${round.value}/${maxRounds.value}`);

// Load teams on mount
onMounted(async () => {
  const teamId = route.query.teamId;
  const opponentId = route.query.opponentId;
  
  try {
    // Load user's team from API (hydrated with player data)
    if (teamId) {
      const userTeamRes = await fetch(`/api/teams/${teamId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (userTeamRes.ok) {
        teamARoster.value = await userTeamRes.json();
        console.log('User team loaded:', teamARoster.value);
      }
    }
    
    // Load opponent team
    if (opponentId) {
      // Try to load from predefined teams (JSON files)
      const teamsRes = await fetch('http://localhost:3000/api/teams');
      const teams = await teamsRes.json();
      teamBRoster.value = teams.find(t => t.id === opponentId) || teams[0];
    } else {
      // Fallback: load first available team as opponent
      const teamsRes = await fetch('http://localhost:3000/api/teams');
      const teams = await teamsRes.json();
      teamBRoster.value = teams[0];
    }
    
    console.log('Opponent team loaded:', teamBRoster.value);
    
    // Set initial attacker
    currentAttacker.value = getPlayerByZone(currentZone.value, 'A');
  } catch (e) {
    console.error("Failed to load teams", e);
  }
});

// Get player from roster by zone
const getPlayerByZone = (zone, team) => {
  const roster = team === 'A' ? teamARoster.value : teamBRoster.value;
  if (!roster?.players) return { name: 'Player', id: 'unknown', position: 'MF', attributes: {} };
  
  const zonePositions = {
    0: ['GK'],
    1: ['DF', 'CB', 'LB', 'RB'],
    2: ['MF', 'CM', 'LM', 'RM'],
    3: ['FW', 'ST', 'LW', 'RW']
  };
  
  const positions = zonePositions[zone] || ['MF'];
  let player = roster.players.find(p => positions.includes(p.position));
  if (!player) player = roster.players[zone] || roster.players[0];
  return player;
};

// Handle user action selection
const onActionSelected = (action) => {
  currentAction.value = action;
  
  // Pick current ball holder
  currentAttacker.value = getPlayerByZone(currentZone.value, possession.value);
  
  if (action === 'PASS') {
    // Show player selector for pass target
    gamePhase.value = 'PASS_SELECT';
    return;
  }
  
  // SHOOT action
  currentDefender.value = getPlayerByZone(0, possession.value === 'A' ? 'B' : 'A');
  startBattle();
};

// Handle pass target selection
const onPassTargetSelected = (player) => {
  passTarget.value = player;
  
  // Determine defender based on target zone
  const targetZone = getPlayerZone(player);
  const defZone = possession.value === 'A' ? (3 - targetZone) : targetZone;
  currentDefender.value = getPlayerByZone(defZone, possession.value === 'A' ? 'B' : 'A');
  
  startBattle();
};

// Get zone for a player based on position
const getPlayerZone = (player) => {
  const pos = player?.position;
  if (pos === 'GK') return 0;
  if (['DF', 'CB', 'LB', 'RB'].includes(pos)) return 1;
  if (['MF', 'CM', 'LM', 'RM'].includes(pos)) return 2;
  if (['FW', 'ST', 'LW', 'RW'].includes(pos)) return 3;
  return 2;
};

// Start the battle phase
const startBattle = () => {
  gamePhase.value = 'BATTLE';
  
  // After 2 seconds, roll dice
  setTimeout(() => {
    rollDice();
  }, 2000);
};

// Roll dice and calculate result
const rollDice = () => {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  
  // Get stats
  const attackStat = currentAction.value === 'SHOOT' 
    ? (currentAttacker.value?.attributes?.shoot || 75)
    : (currentAttacker.value?.attributes?.pass || 75);
    
  const defendStat = currentAction.value === 'SHOOT'
    ? (currentDefender.value?.attributes?.power || 75)
    : (currentDefender.value?.attributes?.tackle || 75);
  
  // Modifier from stat difference
  const statDiff = Math.floor((attackStat - defendStat) / 10);
  
  diceResult.value = {
    d1,
    d2,
    modifier: statDiff,
    modLabel: statDiff !== 0 ? 'Stat Bonus' : '',
    target: 7 // Need 7+ to succeed
  };
  
  gamePhase.value = 'DICE';
};

// When dice animation completes
const onDiceComplete = () => {
  const total = diceResult.value.d1 + diceResult.value.d2 + diceResult.value.modifier;
  const success = total >= 7;
  
  if (currentAction.value === 'SHOOT') {
    if (success && total >= 10) { // Higher threshold for goal
      roundOutcome.value = 'GOAL';
      if (possession.value === 'A') scoreA.value++;
      else scoreB.value++;
      addLog('GOAL', `⚽ GOAL by ${currentAttacker.value?.name}!`);
    } else {
      roundOutcome.value = 'SAVE';
      addLog('SAVE', `🧤 Save by ${currentDefender.value?.name}`);
    }
  } else {
    // PASS action
    const targetName = passTarget.value?.name || 'teammate';
    if (success) {
      roundOutcome.value = 'SUCCESS';
      addLog('PASS', `✓ Pass to ${targetName}`);
    } else {
      roundOutcome.value = 'INTERCEPT';
      addLog('INTERCEPT', `✗ Intercepted by ${currentDefender.value?.name}`);
    }
  }
  
  gamePhase.value = 'RESULT';
};

// Continue to next round
const onContinue = () => {
  // Handle outcome
  if (roundOutcome.value === 'GOAL') {
    // Reset to kickoff
    currentZone.value = 1;
    possession.value = possession.value === 'A' ? 'B' : 'A';
  } else if (roundOutcome.value === 'SAVE') {
    currentZone.value = 1;
    possession.value = possession.value === 'A' ? 'B' : 'A';
  } else if (roundOutcome.value === 'SUCCESS') {
    // Ball goes to the selected target player
    if (passTarget.value) {
      currentAttacker.value = passTarget.value;
      currentZone.value = getPlayerZone(passTarget.value);
    } else {
      // Fallback: advance zone
      currentZone.value = Math.min(currentZone.value + 1, 3);
    }
    passTarget.value = null;
  } else if (roundOutcome.value === 'INTERCEPT') {
    // Turnover
    possession.value = possession.value === 'A' ? 'B' : 'A';
    currentZone.value = 1;
  }
  
  round.value++;
  
  // Check end condition
  if (round.value > maxRounds.value || scoreA.value >= 3 || scoreB.value >= 3) {
    gamePhase.value = 'END';
    return;
  }
  
  // If opponent's turn, auto-play
  if (possession.value === 'B') {
    gamePhase.value = 'SELECT';
    setTimeout(() => simulateOpponentTurn(), 1500);
  } else {
    currentAttacker.value = getPlayerByZone(currentZone.value, 'A');
    gamePhase.value = 'SELECT';
  }
};

// Simple AI for opponent
const simulateOpponentTurn = () => {
  const action = currentZone.value >= 3 ? 'SHOOT' : 'PASS';
  
  currentAction.value = action;
  currentAttacker.value = getPlayerByZone(currentZone.value, 'B');
  currentDefender.value = action === 'SHOOT' 
    ? getPlayerByZone(0, 'A')
    : getPlayerByZone(currentZone.value + 1, 'A');
  
  gamePhase.value = 'BATTLE';
  setTimeout(() => rollDice(), 2000);
};

// Add to log
const addLog = (type, text) => {
  logs.value.unshift({ type, text });
  if (logs.value.length > 10) logs.value.pop();
};

// Player positioning
const getZoneX = (zone, teamSide) => {
  if (teamSide === 'A') {
    switch(zone) {
      case 0: return 5;
      case 1: return 20;
      case 2: return 40;
      case 3: return 70;
      default: return 50;
    }
  } else {
    switch(zone) {
      case 0: return 95;
      case 1: return 80;
      case 2: return 60;
      case 3: return 30;
      default: return 50;
    }
  }
};

const mapPlayers = (team, side) => {
  if (!team) return [];
  return team.players.map((p, index) => {
    let zone = 2;
    if (p.position === 'GK') zone = 0;
    else if (['DF', 'LB', 'RB', 'CB'].includes(p.position)) zone = 1;
    else if (['MF', 'CM', 'LM', 'RM'].includes(p.position)) zone = 2;
    else if (['FW', 'ST', 'RW', 'LW'].includes(p.position)) zone = 3;
    
    return {
      id: p.id,
      name: p.name,
      role: p.position,
      imageUrl: p.imageUrl,
      x: getZoneX(zone, side),
      y: 15 + ((index % 4) * 20) + (side === 'B' ? 5 : 0),
      team: side
    };
  });
};

const playersA = computed(() => mapPlayers(teamARoster.value, 'A'));
const playersB = computed(() => mapPlayers(teamBRoster.value, 'B'));

// Find player position by ID - searches through rendered player tokens
const getPlayerPosition = (playerId, team) => {
  const players = team === 'A' ? playersA.value : playersB.value;
  // Use string comparison to handle both number and string IDs
  const player = players.find(p => String(p.id) === String(playerId));
  if (player) {
    return { x: player.x, y: player.y };
  }
  // Fallback: try to find by name if ID doesn't match
  if (currentAttacker.value?.name) {
    const playerByName = players.find(p => p.name === currentAttacker.value.name);
    if (playerByName) {
      return { x: playerByName.x, y: playerByName.y };
    }
  }
  // Final fallback to zone-based position
  console.warn('Could not find player position for:', playerId, 'in team', team);
  const x = team === 'A' 
    ? getZoneX(currentZone.value, 'A') + 3
    : getZoneX(currentZone.value, 'B') - 3;
  return { x, y: 50 };
};

const ballPosition = computed(() => {
  // Ball follows the current ball holder
  if (currentAttacker.value) {
    const pos = getPlayerPosition(currentAttacker.value.id, possession.value);
    return { 
      top: `${pos.y + 3}%`, 
      left: `${pos.x + (possession.value === 'A' ? 3 : -3)}%`, 
      transform: 'translate(-50%, -50%)' 
    };
  }
  // Fallback
  const x = possession.value === 'A' 
    ? getZoneX(currentZone.value, 'A') + 5
    : getZoneX(currentZone.value, 'B') - 5;
  return { top: '50%', left: `${x}%`, transform: 'translate(-50%, -50%)' };
});
</script>
