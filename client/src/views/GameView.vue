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
      :attackerData="diceResult.attackerData"
      :defenderData="diceResult.defenderData"
      :actionType="currentAction"
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
      :passTarget="passTarget?.name"
      @continue="onContinue"
    />

    <!-- Action Selector (when waiting for user input) -->
    <ActionSelector 
      v-if="gamePhase === 'SELECT' && possession === sessionStore.playerRole && isInteractive"
      :zone="currentZone"
      :ballHolder="currentAttacker?.name || 'Player'"
      @action="onActionSelected"
    />

    <!-- Pass Target Selection -->
    <PlayerSelector 
      v-if="gamePhase === 'PASS_SELECT' && possession === sessionStore.playerRole && isInteractive"
      :players="teamARoster?.players || []"
      :currentPlayerId="currentAttacker?.id"
      :currentZone="currentZone"
      @select="onPassTargetSelected"
      @cancel="gamePhase = 'SELECT'"
    />

    <!-- Defender Selection -->
    <DefenderSelector
      v-if="gamePhase === 'DEFENDER_SELECT' && possession === sessionStore.playerRole && isInteractive"
      :players="sessionStore.playerRole === 'A' ? teamARoster?.players : teamBRoster?.players"
      :attacker="currentAttacker"
      :zone="currentZone"
      @select="onDefenderSelected"
    />

    <!-- Message when waiting for server -->
    <div v-if="gamePhase === 'WAITING'" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-black/60 px-6 py-2 rounded-full border border-white/20">
      <div class="flex items-center gap-2 text-white/80">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Waiting for match events... (Q: {{ eventQueue.length }})
      </div>
    </div>

    <!-- Match End Overlay -->
    <div v-if="gamePhase === 'END'" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="flex justify-center mb-4">
            <Trophy class="w-24 h-24 text-yellow-400 animate-bounce" />
        </div>
        <div class="text-4xl font-black text-white mb-2">MATCH OVER</div>
        <div class="text-2xl mb-8" :class="scoreA > scoreB ? 'text-green-400' : scoreA < scoreB ? 'text-red-400' : 'text-gray-400'">
          {{ teamAName }} {{ scoreA }} - {{ scoreB }} {{ teamBName }}
        </div>
        <div class="text-3xl mb-8">
          <span v-if="scoreA > scoreB" class="text-green-400 font-bold">YOU WIN!</span>
          <span v-else-if="scoreA < scoreB" class="text-red-400 font-bold">YOU LOSE</span>
          <span v-else class="text-gray-400">DRAW</span>
        </div>
        <button @click="$router.push('/dashboard')" class="px-12 py-4 bg-white text-black font-bold text-xl rounded-lg hover:bg-gray-200 transition-colors">
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSessionStore } from '../stores/session';
import { useGameStore } from '../stores/game';
import { useWebSocket } from '../composables/useWebSocket';
import ScoreBoard from '../components/game/ScoreBoard.vue';
import PlayerToken from '../components/game/PlayerToken.vue';
import RoundBattle from '../components/game/RoundBattle.vue';
import DiceRoll from '../components/game/DiceRoll.vue';
import RoundResult from '../components/game/RoundResult.vue';
import ActionSelector from '../components/game/ActionSelector.vue';
import PlayerSelector from '../components/game/PlayerSelector.vue';
import DefenderSelector from '../components/game/DefenderSelector.vue';
import { Trophy } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const sessionStore = useSessionStore();
const gameStore = useGameStore();
const { connect, connected } = useWebSocket();

// Game State
const gamePhase = ref('WAITING'); // SELECT, PASS_SELECT, DEFENDER_SELECT, BATTLE, DICE, RESULT, END, WAITING
const possession = ref('A'); // 'A' = user, 'B' = opponent
const currentZone = ref(1); // 0=GK, 1=DEF, 2=MID, 3=ATT
const round = ref(1);
const maxRounds = ref(20);
const currentAction = ref('PASS');
const roundOutcome = ref('');
const logs = ref([]);
const isInteractive = ref(true); // Set to true if we enable manual control later

// Teams data
const teamARoster = ref(null);
const teamBRoster = ref(null);

// Battle state
const currentAttacker = ref(null);
const currentDefender = ref(null);
const passTarget = ref(null); 
const diceResult = ref({ d1: 1, d2: 1, modifier: 0, modLabel: '', target: 0 });

// Event Queue for Replay
const eventQueue = ref([]);
const isProcessingEvent = ref(false);

// Computed
const teamAName = computed(() => teamARoster.value?.name || 'Your Team');
const teamBName = computed(() => teamBRoster.value?.name || 'Opponent');
const roundDisplay = computed(() => `Round ${round.value}`);
const scoreA = ref(0);
const scoreB = ref(0);

// Load teams on mount
onMounted(async () => {
  // gameStore.reset(); // MOVED to Lobby/Setup to avoid clearing events received during transition
  connect();
  
  // Sync initial score
  scoreA.value = gameStore.score.A;
  scoreB.value = gameStore.score.B;

  const teamId = route.query.teamId;
  const opponentId = route.query.opponentId;
  
  try {
    // Load team A (my team) using the teamId from query params
    if (teamId) {
      const userTeamRes = await fetch(`http://localhost:3000/api/teams/${teamId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (userTeamRes.ok) {
        teamARoster.value = await userTeamRes.json();
      }
    }
    
    // Load team B (opponent) using opponentId from query params
    if (opponentId) {
      const oppTeamRes = await fetch(`http://localhost:3000/api/teams/${opponentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (oppTeamRes.ok) {
        teamBRoster.value = await oppTeamRes.json();
      }
    }
    
    // Fallback to default teams if needed
    if (!teamARoster.value || !teamBRoster.value) {
      const teamsRes = await fetch('http://localhost:3000/api/teams');
      const defaultTeams = await teamsRes.json();
      if (!teamARoster.value && defaultTeams.length > 0) {
        teamARoster.value = defaultTeams[0];
      }
      if (!teamBRoster.value && defaultTeams.length > 1) {
        teamBRoster.value = defaultTeams[1];
      }
    }
    
  } catch (e) {
    console.error("Failed to load teams", e);
  }

  // Replay any events that arrived before mount (e.g. PHASE_CHANGE)
  if (gameStore.events.length > 0) {
      console.log(`[DEBUG] GameView mounted with ${gameStore.events.length} existing events.`);
      gameStore.events.forEach(event => {
        if (['PASS', 'GOAL', 'SAVE', 'INTERCEPT', 'MATCH_END', 'PHASE_CHANGE'].includes(event.type)) {
          console.log(`[DEBUG] Queuing existing event: ${event.type}`);
          eventQueue.value.push(event);
        }
      });
      processQueue();
  } else {
      console.log('[DEBUG] GameView mounted with no events.');
  }
});

// Watch for new server events
watch(() => gameStore.events.length, (newLen, oldLen) => {
  console.log(`[DEBUG] gameStore.events updated: ${oldLen} -> ${newLen}`);
  const newEvents = gameStore.events.slice(oldLen);
  newEvents.forEach(event => {
    // Only queue gameplay events
    if (['PASS', 'GOAL', 'SAVE', 'INTERCEPT', 'MATCH_END', 'PHASE_CHANGE'].includes(event.type)) {
      console.log(`[DEBUG] Queuing new event: ${event.type}`);
      eventQueue.value.push(event);
    } else {
      console.log(`[DEBUG] Ignoring event type: ${event.type}`);
    }
  });
  
  processQueue();
});

const processQueue = async () => {
  if (isProcessingEvent.value) {
    if (eventQueue.value.length > 0) console.log(`[DEBUG] Queue busy. Pending events: ${eventQueue.value.length}`);
    return;
  }
  if (eventQueue.value.length === 0) return;
  
  isProcessingEvent.value = true;
  const event = eventQueue.value.shift();
  
  console.log(`[DEBUG] Processing event: ${event.type}. Remaining in queue: ${eventQueue.value.length}`);
  await playEvent(event);
  
  // Update round info
  round.value++;
  
  // Check for end
  if (event.type === 'MATCH_END') {
    gamePhase.value = 'END';
  } else {
     // Wait a moment then process next or go to WAITING
     isProcessingEvent.value = false;
     if (eventQueue.value.length > 0) {
        setTimeout(processQueue, 500); // Small pause between events
     } else {
        // Only reset to WAITING if we haven't transitioned to an interactive phase
        if (gamePhase.value !== 'SELECT' && gamePhase.value !== 'PASS_SELECT') {
            console.log('[DEBUG] Queue empty, setting phase to WAITING');
            gamePhase.value = 'WAITING';
        }
     }
  }
};

const playEvent = (event) => {
  return new Promise((resolve) => {
    console.log('Playing event:', event.type, event.phase || '');
    
    if (event.type === 'PHASE_CHANGE') {
        if (event.phase === 'SELECTION') {
            console.log('Phase Change -> SELECTION. Team:', event.teamId);
            gamePhase.value = 'SELECT';
            possession.value = event.teamId;
            addLog('INFO', event.description);
        } else if (event.phase === 'RESPONSE') {
            console.log('Phase Change -> RESPONSE. Team:', event.teamId);
            gamePhase.value = 'DEFENDER_SELECT';
            possession.value = event.teamId; // This should be the defender's team ID now
            addLog('INFO', event.description);
        } else {
             console.warn('Unknown Phase:', event.phase);
        }
        // Immediate resolve for phase changes
        resolve();
        return;
    }
    
    // 1. Setup Phase
    currentAction.value = (event.type === 'GOAL' || event.type === 'SAVE' || event.type === 'MISS') ? 'SHOOT' : 'PASS';
    possession.value = event.teamId;
    currentZone.value = event.zone;
    
    // Find players involved
    const attackerId = event.playerId;
    const defenderId = event.defenderId;
    
    currentAttacker.value = getPlayerById(attackerId, event.teamId) || { name: event.playerName, id: event.playerId };
    currentDefender.value = getPlayerById(defenderId, event.teamId === 'A' ? 'B' : 'A') || { name: event.defenderName, id: event.defenderId };
    
    addLog(event.type, event.description);
    
    // Update local score IF it's a direct goal event (animation start? or end?)
    // Best to update it when result is shown or slightly before.
    // Let's update it here, but maybe we want to wait for "GOAL" text?
    // Let's defer it to the Result phase for drama.
    
    // 2. Battle Phase
    gamePhase.value = 'BATTLE';
    
    setTimeout(() => {
        // 3. Dice Phase
        if (event.contestResult) {
            diceResult.value = {
                d1: event.contestResult.attackerRoll || 5,
                d2: event.contestResult.defenderRoll || 5,
                modifier: 0,
                modLabel: '',
                target: 0,
                attackerData: {
                  name: currentAttacker.value?.name || 'Attacker',
                  baseStat: 0, // We could get this from player stats if available
                  dice: event.contestResult.attackerRoll,
                  total: event.contestResult.attackerRoll // Simplified
                },
                defenderData: {
                  name: currentDefender.value?.name || 'Defender',
                  baseStat: 0,
                  dice: event.contestResult.defenderRoll,
                  total: event.contestResult.defenderRoll
                }
            };
            gamePhase.value = 'DICE';
            
            setTimeout(() => {
               // 4. Result Phase
               roundOutcome.value = event.type; // PASS, INTERCEPT, GOAL, SAVE
               if (event.type === 'PASS') roundOutcome.value = 'SUCCESS';
               
               // Update score for display now
               if (event.type === 'GOAL') {
                   if (event.teamId === 'A') scoreA.value++;
                   else scoreB.value++;
               }
               
               gamePhase.value = 'RESULT';
               
               // Auto continue after 2 seconds
               setTimeout(() => {
                   onContinue();
               }, 2000);
               
               // We return resolver when this is done, but UI shows Result until onContinue is called.
               // We will hook onContinue to resolve the promise.
               
               // Store the resolve function to be called by onContinue
               currentEventResolve = resolve;
               
            }, 2000); // Show dice for 2s
        } else {
             // No contest (e.g. simple possession change or start)
             resolve();
        }
    }, 1500); // Show battle for 1.5s
  });
};

let currentEventResolve = null;

// Called by RoundResult component
const onContinue = () => {
    // Clear phase
    // Update local state based on result for "between turns" visuals
     if (roundOutcome.value === 'GOAL' || roundOutcome.value === 'SAVE') {
        currentZone.value = 1; // Reset to Kickoff/Defense
        // Possession swap handled by next event usually
     }
     
    gamePhase.value = 'WAITING';
    if (currentEventResolve) {
        const resolve = currentEventResolve;
        currentEventResolve = null;
        resolve();
    }
};

// Interactive Actions
const { send } = useWebSocket();

const onActionSelected = (action) => {
    // Basic check for turn is done by v-if in template, but good to have here
    console.log('Action selected:', action);
    if (action === 'SHOOT') {
        send('player_action', {
            action: 'SHOOT',
            playerId: currentAttacker.value?.id
        });
        // Optimistic UI update could go here, but we wait for server event
        gamePhase.value = 'WAITING';
    } else {
        // For PASS, we go to PASS_SELECT phase locally
        // We don't send anything yet
        gamePhase.value = 'PASS_SELECT';
    }
};

const onPassTargetSelected = (targetPlayer) => {
    console.log('Pass target selected:', targetPlayer);
    send('player_action', {
        action: 'PASS',
        playerId: currentAttacker.value?.id,
        targetZone: getPlayerZone(targetPlayer) // Helper function
    });
    // Wait for server response
    gamePhase.value = 'WAITING';
};

const onDefenderSelected = (defenderId) => {
    console.log('Defender selected:', defenderId);
    send('player_action', {
        defenderId: defenderId
    });
    // Wait for server
    gamePhase.value = 'WAITING';
};

// Helper needed for zone calculation
const getPlayerZone = (player) => {
  const pos = player?.role || player?.position;
  if (pos === 'GK') return 0;
  if (['DF', 'CB', 'LB', 'RB'].includes(pos)) return 1;
  if (['MF', 'CM', 'LM', 'RM'].includes(pos)) return 2;
  if (['FW', 'ST', 'LW', 'RW'].includes(pos)) return 3;
  return 2;
};
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
    
    // GK should be vertically centered in the goal area
    const yPosition = p.position === 'GK' 
      ? 50 
      : 15 + ((index % 4) * 20) + (side === 'B' ? 5 : 0);
    
    return {
      id: p.id,
      name: p.name,
      role: p.position,
      imageUrl: p.imageUrl,
      x: getZoneX(zone, side),
      y: yPosition,
      team: side
    };
  });
};

const playersA = computed(() => mapPlayers(teamARoster.value, 'A'));
const playersB = computed(() => mapPlayers(teamBRoster.value, 'B'));

const getPlayerById = (id, team) => {
    const players = team === 'A' ? playersA.value : playersB.value;
    return players.find(p => String(p.id) === String(id));
};

const ballPosition = computed(() => {
  if (!currentAttacker.value) {
    const x = possession.value === 'A' 
      ? getZoneX(currentZone.value, 'A') + 5
      : getZoneX(currentZone.value, 'B') - 5;
    return { top: '50%', left: `${x}%`, transform: 'translate(-50%, -50%)' };
  }
  
  const players = possession.value === 'A' ? playersA.value : playersB.value;
  let player = players.find(p => String(p.id) === String(currentAttacker.value.id));
  
  if (!player && currentAttacker.value.name) {
    player = players.find(p => p.name === currentAttacker.value.name);
  }
  
  if (player) {
    const offsetX = possession.value === 'A' ? 3 : -3;
    return { 
      top: `${player.y + 3}%`, 
      left: `${player.x + offsetX}%`, 
      transform: 'translate(-50%, -50%)' 
    };
  }

  const x = possession.value === 'A' 
    ? getZoneX(currentZone.value, 'A') + 5
    : getZoneX(currentZone.value, 'B') - 5;
  return { top: '50%', left: `${x}%`, transform: 'translate(-50%, -50%)' };
});

const addLog = (type, text) => {
  logs.value.unshift({ type, text });
  if (logs.value.length > 10) logs.value.pop();
};
</script>
