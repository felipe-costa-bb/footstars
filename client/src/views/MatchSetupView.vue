<template>
  <div class="flex h-screen bg-gray-900 overflow-hidden text-white font-sports">
    <Sidebar />

    <main class="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-gray-800">
      <!-- Background -->
      <div class="absolute inset-0 bg-[url('/assets/carbon-fibre.png')] opacity-10 z-0 pointer-events-none"></div>

      <!-- Header -->
      <header class="h-20 flex items-center justify-between px-8 z-20 relative border-b border-white/5 bg-black/20 backdrop-blur-md">
         <div>
             <h2 class="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">SELECT OPPONENT</h2>
             <p class="text-xs text-gray-400 font-bold tracking-widest">CHOOSE A TEAM TO PLAY AGAINST</p>
         </div>
         
         <router-link 
           to="/my-teams" 
           class="px-6 py-3 bg-gray-800 text-white font-display font-bold rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2"
         >
           <span class="material-icons-outlined">arrow_back</span>
           BACK
         </router-link>
      </header>

      <!-- Content Area -->
      <div class="flex-1 p-6 lg:p-10 overflow-y-auto z-10 relative scrollbar-hide">
        
        <!-- Your Team Preview -->
        <div v-if="userTeam" class="mb-8 bg-gradient-to-r from-field-accent/10 to-transparent rounded-2xl border border-field-accent/30 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-field-accent font-bold tracking-widest mb-1">YOUR TEAM</p>
              <h3 class="text-2xl font-display font-bold">{{ userTeam.name }}</h3>
              <p class="text-gray-400 text-sm">{{ userTeam.players?.length || 0 }} players</p>
            </div>
            <div class="flex -space-x-3">
              <div 
                v-for="player in userTeam.players?.slice(0, 5)" 
                :key="player.id"
                class="w-12 h-12 rounded-full border-2 border-gray-900 overflow-hidden"
              >
                <img 
                  :src="player.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-if="userTeam.players?.length > 5" class="w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-xs font-bold">
                +{{ userTeam.players.length - 5 }}
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="w-full h-64 flex justify-center items-center">
             <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-field-accent"></div>
        </div>

        <!-- Opponent Teams Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="team in opponentTeams" 
            :key="team.id"
            @click="selectOpponent(team)"
            class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-red-500/50 transition-all group hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            :class="{ 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]': selectedOpponent?.id === team.id }"
          >
            <!-- Team Header -->
            <div class="p-5 border-b border-white/5">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-display font-bold truncate">{{ team.name }}</h3>
                <div class="text-xs text-gray-400 font-mono bg-black/30 px-2 py-1 rounded">
                  {{ team.players?.length || 11 }} players
                </div>
              </div>
            </div>

            <!-- Player Preview -->
            <div class="p-4 grid grid-cols-5 gap-2">
              <div 
                v-for="(player, i) in team.players?.slice(0, 5)" 
                :key="i"
                class="aspect-square rounded-lg bg-gray-700/50 flex items-center justify-center overflow-hidden"
              >
                <img 
                  :src="player.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id || player.name}`" 
                  class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div 
                v-if="team.players?.length > 5" 
                class="aspect-square rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 text-xs font-bold"
              >
                +{{ team.players.length - 5 }}
              </div>
            </div>

            <!-- Select Indicator -->
            <div class="p-4 pt-0">
              <div 
                class="w-full py-3 rounded-xl font-display font-bold text-center transition-all"
                :class="selectedOpponent?.id === team.id ? 'bg-red-600 text-white' : 'bg-gray-700/50 text-gray-400 group-hover:bg-red-900/30 group-hover:text-red-400'"
              >
                {{ selectedOpponent?.id === team.id ? 'SELECTED' : 'SELECT' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Start Match Button -->
        <div v-if="selectedOpponent" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <button 
            @click="startMatch"
            class="px-12 py-4 bg-field-accent text-black font-display font-bold text-xl rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_40px_rgba(0,255,65,0.3)] flex items-center gap-3"
          >
            <span class="material-icons-outlined">sports_soccer</span>
            START MATCH VS {{ selectedOpponent.name }}
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSessionStore } from '../stores/session';
import Sidebar from '../components/Sidebar.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const sessionStore = useSessionStore();

const loading = ref(true);
const userTeam = ref(null);
const opponentTeams = ref([]);
const selectedOpponent = ref(null);

// Get the user's team ID from route query
const userTeamId = route.query.teamId;

const fetchData = async () => {
    loading.value = true;
    try {
        // Fetch user's selected team
        if (userTeamId) {
            const teamRes = await fetch(`/api/teams/${userTeamId}`, {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            });
            if (teamRes.ok) {
                userTeam.value = await teamRes.json();
            }
        }

        // Fetch available opponent teams (from JSON files for now)
        const opponentRes = await fetch('/api/teams');
        if (opponentRes.ok) {
            opponentTeams.value = await opponentRes.json();
        }
    } catch (err) {
        console.error('Failed to fetch data:', err);
    } finally {
        loading.value = false;
    }
};

const selectOpponent = (team) => {
    selectedOpponent.value = team;
};

const startMatch = () => {
    if (!selectedOpponent.value || !userTeam.value) return;
    
    // Store team IDs in session
    sessionStore.setTeamId(userTeam.value.id);
    
    const sessionId = Math.random().toString(36).substring(7).toUpperCase();
    router.push({ 
        path: `/game/${sessionId}`,
        query: { 
            teamId: userTeam.value.id,
            opponentId: selectedOpponent.value.id 
        }
    });
};

onMounted(() => {
    if (!authStore.isAuthenticated) {
        router.push('/');
        return;
    }
    
    if (!userTeamId) {
        router.push('/my-teams');
        return;
    }
    
    fetchData();
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
