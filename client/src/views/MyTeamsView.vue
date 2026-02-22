<template>
  <div class="flex h-screen bg-gray-900 overflow-hidden text-white font-sports">
    <Sidebar />

    <main class="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-gray-800">
      <!-- Background -->
      <div class="absolute inset-0 bg-[url('/assets/carbon-fibre.png')] opacity-10 z-0 pointer-events-none"></div>

      <!-- Header -->
      <header class="h-20 flex items-center justify-between px-8 z-20 relative border-b border-white/5 bg-black/20 backdrop-blur-md">
         <div>
             <h2 class="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">MY TEAMS</h2>
             <p class="text-xs text-gray-400 font-bold tracking-widest">{{ teams.length }} SQUADS CREATED</p>
         </div>
         
         <router-link 
           to="/team-builder" 
           class="px-6 py-3 bg-field-accent text-black font-display font-bold rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg flex items-center gap-2"
         >
           <span class="material-icons-outlined">add</span>
           CREATE NEW TEAM
         </router-link>
      </header>

      <!-- Content Area -->
      <div class="flex-1 p-6 lg:p-10 overflow-y-auto z-10 relative scrollbar-hide">
        
        <!-- Loading State -->
        <div v-if="loading" class="w-full h-96 flex justify-center items-center">
             <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-field-accent"></div>
        </div>

        <!-- No Teams State -->
        <div v-else-if="teams.length === 0" class="w-full h-full flex flex-col justify-center items-center text-center space-y-6 animate-fade-in">
             <div class="text-6xl mb-4">⚽</div>
             <h3 class="text-3xl font-display font-bold mb-2">No Teams Yet</h3>
             <p class="text-gray-400 max-w-md">Create your first squad using the Team Builder. Select 11 players from your collection to compete!</p>
             <router-link to="/team-builder" class="px-8 py-4 bg-field-accent text-black font-display font-bold text-xl rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_#00ff4140]">
                CREATE YOUR FIRST TEAM
             </router-link>
        </div>

        <!-- Teams Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="team in teams" 
            :key="team.id"
            class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 overflow-hidden hover:border-field-accent/50 transition-all group hover:shadow-[0_0_30px_rgba(0,255,65,0.1)]"
          >
            <!-- Team Header -->
            <div class="p-5 border-b border-white/5">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-display font-bold truncate">{{ team.name }}</h3>
                <div class="text-xs text-gray-400 font-mono bg-black/30 px-2 py-1 rounded">
                  {{ team.card_ids.filter(id => id).length }} players
                </div>
              </div>
              
              <!-- Average Rating -->
              <div class="flex items-center gap-2 mt-2">
                <span class="text-field-accent font-bold text-lg">{{ getAverageRating(team) }}</span>
                <span class="text-xs text-gray-500">AVG RATING</span>
              </div>
            </div>

            <!-- Player Preview -->
            <div class="p-4 grid grid-cols-5 gap-2">
              <div 
                v-for="(cardId, i) in team.card_ids.filter(id => id).slice(0, 5)" 
                :key="cardId"
                class="aspect-square rounded-lg bg-gray-700/50 flex items-center justify-center overflow-hidden"
              >
                <img 
                  :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${cardId}`" 
                  class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div 
                v-if="team.card_ids.filter(id => id).length > 5" 
                class="aspect-square rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 text-xs font-bold"
              >
                +{{ team.card_ids.filter(id => id).length - 5 }}
              </div>
            </div>

            <!-- Actions -->
            <div class="p-4 pt-0 flex gap-3">
              <button 
                @click="playMatch(team)"
                class="flex-1 py-3 bg-field-accent text-black font-display font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <span class="material-icons-outlined text-sm">sports_soccer</span>
                PLAY
              </button>

              <button 
                @click="editTeam(team)"
                class="px-4 py-3 bg-blue-900/30 text-blue-400 border border-blue-600/30 rounded-xl hover:bg-blue-900/50 transition-all"
                title="Edit Team"
              >
                <span class="material-icons-outlined text-sm">edit</span>
              </button>
              
              <button 
                @click="confirmDelete(team)"
                class="px-4 py-3 bg-red-900/30 text-red-400 border border-red-600/30 rounded-xl hover:bg-red-900/50 transition-all"
                title="Delete Team"
              >
                <span class="material-icons-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="teamToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-gray-900 rounded-2xl border border-white/10 p-8 max-w-md w-full mx-4">
        <h3 class="text-2xl font-display font-bold text-white mb-4">Delete Team?</h3>
        <p class="text-gray-400 mb-6">Are you sure you want to delete "{{ teamToDelete.name }}"? This action cannot be undone.</p>
        
        <div class="flex gap-4">
          <button 
            @click="teamToDelete = null"
            class="flex-1 py-3 bg-gray-800 text-white font-display font-bold rounded-xl hover:bg-gray-700 transition-all"
          >
            CANCEL
          </button>
          <button 
            @click="deleteTeam"
            :disabled="deleting"
            class="flex-1 py-3 bg-red-600 text-white font-display font-bold rounded-xl hover:bg-red-500 transition-all disabled:opacity-50"
          >
            {{ deleting ? 'DELETING...' : 'DELETE' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/Sidebar.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const teams = ref([]);
const teamToDelete = ref(null);
const deleting = ref(false);

const fetchTeams = async () => {
    loading.value = true;
    try {
        const res = await fetch('/api/my-teams', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (res.ok) {
            teams.value = await res.json();
        }
    } catch (err) {
        console.error('Failed to fetch teams:', err);
    } finally {
        loading.value = false;
    }
};

const getAverageRating = (team) => {
    // This would require fetching card details - for now return placeholder
    return team.card_ids.filter(id => id).length > 0 ? '80+' : '-';
};

const playMatch = (team) => {
    // Navigate to match setup to select opponent
    router.push({ 
        path: '/match-setup',
        query: { teamId: team.id }
    });
};

const editTeam = (team) => {
    router.push({
        path: '/team-builder',
        query: { teamId: team.id }
    });
};

const confirmDelete = (team) => {
    teamToDelete.value = team;
};

const deleteTeam = async () => {
    if (!teamToDelete.value) return;
    
    deleting.value = true;
    try {
        const res = await fetch(`/api/teams/${teamToDelete.value.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        
        if (res.ok) {
            teams.value = teams.value.filter(t => t.id !== teamToDelete.value.id);
            teamToDelete.value = null;
        }
    } catch (err) {
        console.error('Failed to delete team:', err);
    } finally {
        deleting.value = false;
    }
};

onMounted(() => {
    if (!authStore.isAuthenticated) {
        router.push('/');
        return;
    }
    fetchTeams();
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
