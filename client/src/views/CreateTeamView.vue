<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-7xl mx-auto h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
           <router-link to="/dashboard" class="text-field-accent hover:text-field-accent/80 mb-2 inline-block">
            ← Back to Dashboard
          </router-link>
          <h1 class="text-3xl font-bold text-white">Team Builder</h1>
        </div>
        
        <div class="flex items-center space-x-4">
            <input 
              v-model="teamName"
              type="text" 
              placeholder="Enter Team Name"
              class="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-field-accent"
            />
            <button 
              @click="saveTeam"
              :disabled="loading || !isValidTeam"
              class="bg-field-accent hover:bg-field-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded transition"
            >
              <span v-if="loading">Saving...</span>
              <span v-else>Save Team</span>
            </button>
        </div>
      </div>

      <div v-if="error" class="bg-red-900/30 border border-red-600 rounded-lg p-3 text-center text-red-400 mb-4 flex-shrink-0">
        {{ error }}
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        <!-- Left: Collection (Available Players) -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
            <div class="p-4 border-b border-gray-700 bg-gray-900">
                <h2 class="font-bold text-white">Available Players ({{ availablePlayers.length }})</h2>
            </div>
            <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div 
                      v-for="card in availablePlayers" 
                      :key="card.id"
                      @click="selectPlayer(card)"
                      class="bg-gray-700 border border-gray-600 rounded p-2 cursor-pointer hover:border-field-accent hover:bg-gray-600 transition flex flex-col items-center"
                    >
                        <div class="w-10 h-10 rounded-full bg-gray-800 mb-2 overflow-hidden">
                            <img :src="card.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${card.playerId}`" class="w-full h-full object-cover" />
                        </div>
                        <div class="text-xs font-bold text-white truncate w-full text-center">{{ card.name }}</div>
                        <div class="text-[10px] text-field-accent font-bold mt-1">{{ card.position || 'CM' }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Squad Pitch (Selected Players) -->
        <div class="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-700 relative overflow-hidden flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/grass.png')]">
             <!-- Pitch Lines (Simplified) -->
             <div class="absolute inset-4 border-2 border-white/20 rounded opacity-70"></div>
             <div class="absolute top-4 bottom-4 left-1/2 w-0.5 bg-white/20 opacity-70"></div>
             <div class="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-70"></div>

             <!-- Squad Slots -->
             <!-- We just visually place them in a 4-4-2 or similar approximate grid -->
             <div class="relative w-full h-full max-w-2xl max-h-[80vh] p-8 grid grid-rows-4 gap-4">
                 
                 <!-- Forwards -->
                 <div class="row-span-1 flex justify-center items-center space-x-12">
                     <div v-for="(slot, i) in getSlots('FW')" :key="'FW'+i" class="w-16 h-20" @click="handleSlotClick('FW', i)">
                         <PlayerCardSlot :player="squad['FW'][i]" @remove="removePlayer('FW', i)" type="FW"/>
                     </div>
                 </div>

                 <!-- Midfielders -->
                 <div class="row-span-1 flex justify-center items-center space-x-8">
                     <div v-for="(slot, i) in getSlots('MF')" :key="'MF'+i" class="w-16 h-20" @click="handleSlotClick('MF', i)">
                         <PlayerCardSlot :player="squad['MF'][i]" @remove="removePlayer('MF', i)" type="MF"/>
                     </div>
                 </div>

                 <!-- Defenders -->
                 <div class="row-span-1 flex justify-center items-center space-x-8">
                     <div v-for="(slot, i) in getSlots('DF')" :key="'DF'+i" class="w-16 h-20" @click="handleSlotClick('DF', i)">
                         <PlayerCardSlot :player="squad['DF'][i]" @remove="removePlayer('DF', i)" type="DF"/>
                     </div>
                 </div>

                 <!-- Goalkeeper -->
                 <div class="row-span-1 flex justify-center items-center">
                     <div class="w-16 h-20" @click="handleSlotClick('GK', 0)">
                         <PlayerCardSlot :player="squad['GK'][0]" @remove="removePlayer('GK', 0)" type="GK"/>
                     </div>
                 </div>

             </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import PlayerCardSlot from '../components/builder/PlayerCardSlot.vue'; // Need to create this

const router = useRouter();
const authStore = useAuthStore();

const teamName = ref('My Squad');
const loading = ref(false);
const error = ref('');
const allCards = ref([]);

// Squad State: Simple fixed slots for now: 1 GK, 4 DF, 4 MF, 2 FW
const squad = ref({
    GK: [null],
    DF: [null, null, null, null],
    MF: [null, null, null, null],
    FW: [null, null]
});

// Helper to determine slot counts
const getSlots = (pos) => {
    if (pos === 'GK') return new Array(1);
    if (pos === 'FW') return new Array(2);
    return new Array(4);
};

const occupiedCardIds = computed(() => {
    const ids = new Set();
    Object.values(squad.value).flat().forEach(p => {
        if (p) ids.add(p.id);
    });
    return ids;
});

const availablePlayers = computed(() => {
    return allCards.value.filter(c => !occupiedCardIds.value.has(c.id));
});

const isValidTeam = computed(() => {
    // Check if team name exists and all 11 slots are filled
    const totalPlayers = Object.values(squad.value).flat().filter(p => p !== null).length;
    return teamName.value.length > 2 && totalPlayers === 11;
});

const fetchCollection = async () => {
  if (!authStore.isAuthenticated) {
      router.push('/');
      return;
  }

  try {
    const res = await fetch('/api/collection', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch cards');
    
    // Process cards with mock data if needed
    const data = await res.json();
    allCards.value = data.map(c => ({
        ...c,
        position: c.position || guessPosition(c.player_id) // Fallback if pos missing
    }));
  } catch (err) {
    console.error(err);
    error.value = "Failed to load collection";
  }
};

const guessPosition = (id) => {
    // Deterministic random for consistent demos
    const hash = id.split('').reduce((a,b)=>a+b.charCodeAt(0),0);
    const roles = ['GK', 'DF', 'MF', 'FW'];
    // Weight probability towards non-GK
    const r = hash % 100;
    if (r < 10) return 'GK';
    if (r < 40) return 'DF';
    if (r < 80) return 'MF';
    return 'FW';
};

const selectPlayer = (player) => {
    // Auto-slot logic: Find first empty slot for position
    const pos = player.position;
    
    // Loose matching: If pos is 'ST' treat as 'FW', 'CB' as 'DF' etc.
    let targetPos = pos;
    if (['ST', 'RW', 'LW'].includes(pos)) targetPos = 'FW';
    if (['CM', 'CDM', 'CAM', 'RM', 'LM'].includes(pos)) targetPos = 'MF';
    if (['CB', 'LB', 'RB', 'WB'].includes(pos)) targetPos = 'DF';
    // Fallback if strict slotting fails or exact match needed
    
    const slots = squad.value[targetPos];
    if (!slots) {
        error.value = `Unknown position ${pos}`;
        return;
    }
    
    const emptyIndex = slots.findIndex(s => s === null);
    if (emptyIndex !== -1) {
        squad.value[targetPos][emptyIndex] = player;
        error.value = ''; // Clear errors
    } else {
        error.value = `No empty slots for ${targetPos}`;
        // Optional: Swap?
    }
};

const removePlayer = (pos, index) => {
    squad.value[pos][index] = null;
};

const saveTeam = async () => {
    if (!isValidTeam.value) return;
    
    loading.value = true;
    error.value = '';
    
    try {
        const cardIds = Object.values(squad.value).flat().map(p => p.id);
        
        const res = await fetch('/api/teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify({
                name: teamName.value,
                cardIds: cardIds
            })
        });
        
        if (!res.ok) throw new Error('Failed to save team');
        
        // Redirect to My Teams view to see all saved teams
        router.push('/my-teams');
    } catch (err) {
        console.error(err);
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCollection();
});

// Helper for slot clicks if we want double-duty
const handleSlotClick = (pos, index) => {
    // Could open a filtered modal, for now just placeholder
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #374151; 
}
</style>
