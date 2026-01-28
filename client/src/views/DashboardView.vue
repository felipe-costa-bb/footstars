<template>
  <div class="flex h-screen bg-gray-900 overflow-hidden text-white font-sports">
    <Sidebar />

    <main class="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-gray-800">
      <!-- Background Texture -->
      <div class="absolute inset-0 bg-[url('/assets/carbon-fibre.png')] opacity-10 z-0 pointer-events-none"></div>

      <!-- Header -->
      <header class="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md z-20">
         <h2 class="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">MY CLUB</h2>
         
         <div class="flex items-center gap-6">
            <!-- Balance -->
            <div class="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm group hover:border-field-accent/50 transition-colors">
                <span class="text-yellow-400 font-display text-lg drop-shadow-md">🪙</span>
                <span class="font-bold font-display text-xl tracking-wider">{{ formattedCoins }}</span>
            </div>

            <!-- Profile -->
            <div class="flex items-center gap-4 pl-6 border-l border-white/10">
                <div class="text-right hidden md:block">
                    <div class="font-bold font-display text-lg leading-none tracking-wide">{{ username }}</div>
                    <div class="text-xs text-brand-blue font-bold tracking-widest mt-1">MANAGER</div>
                </div>
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue to-purple-600 p-[2px] shadow-lg">
                    <div class="w-full h-full rounded-full bg-gray-900 overflow-hidden relative">
                        <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`" alt="User" class="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
         </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 p-6 lg:p-10 overflow-y-auto z-10 relative scrollbar-hide">
        
        <!-- Loading State -->
        <div v-if="loading" class="w-full h-96 flex justify-center items-center">
             <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-field-accent"></div>
        </div>

        <!-- No Team State -->
        <div v-else-if="!team" class="w-full h-full flex flex-col justify-center items-center text-center space-y-6 animate-fade-in">
             <h3 class="text-3xl font-display font-bold mb-2">Build Your Dream Team</h3>
             <p class="text-gray-400 max-w-md">You haven't set up your squad yet. Head to the Team Builder to select your starting XI.</p>
             <router-link to="/team-builder" class="px-8 py-4 bg-field-accent text-black font-display font-bold text-xl rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_#00ff4140]">
                CREATE SQUAD
             </router-link>
        </div>

        <!-- Pitch View -->
        <div v-else class="w-full max-w-6xl mx-auto aspect-[16/9] bg-pitch-green rounded-[2.5rem] border-[6px] border-white/10 relative shadow-2xl overflow-hidden flex flex-col justify-center items-center bg-[url('https://www.transparenttextures.com/patterns/grass.png')] group">
             <!-- Pitch Lines Overlay -->
             <div class="absolute inset-5 border-2 border-white/20 rounded-3xl opacity-60"></div>
             <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20"></div>
             <div class="absolute h-40 w-40 border-2 border-white/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
             <div class="absolute top-0 bottom-0 left-0 w-32 border-r-2 border-white/20 rounded-r-3xl opacity-40"></div>
             <div class="absolute top-0 bottom-0 right-0 w-32 border-l-2 border-white/20 rounded-l-3xl opacity-40"></div>


             <!-- Dynamic Formation Grid -->
             <div class="w-[85%] h-[85%] relative z-20 flex flex-col justify-between py-4">
                
                <!-- Forwards -->
                <div class="flex justify-center gap-16 lg:gap-32 items-end flex-1">
                     <div v-for="p in forwards" :key="p.id" class="transform hover:scale-110 transition-transform duration-300 relative group/card">
                        <PlayerCard 
                            :name="p.name || p.real_name" 
                            :rating="p.overallRating" 
                            :position="p.position" 
                            :imageUrl="p.imageUrl"
                            :team="p.team"
                            :stats="{pace: p.power, shoot: p.shoot, pass: p.pass, tackle: p.tackle}" 
                            :rarity="getCardRarity(p.overallRating)"
                        />
                     </div>
                </div>

                <!-- Midfielders -->
                <div class="flex justify-center gap-8 lg:gap-20 items-center flex-1">
                     <div v-for="p in midfielders" :key="p.id" class="transform hover:scale-110 transition-transform duration-300 mt-8">
                        <PlayerCard 
                            :name="p.name || p.real_name" 
                            :rating="p.overallRating" 
                            :position="p.position" 
                            :imageUrl="p.imageUrl"
                            :team="p.team"
                            :stats="{pace: p.power, shoot: p.shoot, pass: p.pass, tackle: p.tackle}" 
                            :rarity="getCardRarity(p.overallRating)"
                        />
                     </div>
                </div>

                 <!-- Defenders -->
                <div class="flex justify-center gap-6 lg:gap-16 items-start flex-1">
                     <div v-for="p in defenders" :key="p.id" class="transform hover:scale-110 transition-transform duration-300">
                        <PlayerCard 
                            :name="p.name || p.real_name" 
                            :rating="p.overallRating" 
                            :position="p.position" 
                            :imageUrl="p.imageUrl"
                            :team="p.team"
                            :stats="{pace: p.power, shoot: p.shoot, pass: p.pass, tackle: p.tackle}" 
                            :rarity="getCardRarity(p.overallRating)"
                        />
                     </div>
                </div>
             </div>
             
             <!-- GK Section (Absolute bottom) -->
             <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <div v-if="goalkeeper" class="transform hover:scale-110 transition-transform duration-300">
                    <PlayerCard 
                            :name="goalkeeper.name || goalkeeper.real_name" 
                            :rating="goalkeeper.overallRating" 
                            :position="goalkeeper.position" 
                            :imageUrl="goalkeeper.imageUrl"
                            :team="goalkeeper.team"
                            :stats="{pace: goalkeeper.power, shoot: goalkeeper.shoot, pass: goalkeeper.pass, tackle: goalkeeper.tackle}" 
                            :rarity="getCardRarity(goalkeeper.overallRating)"
                    />
                </div>
             </div>
             
             <!-- Vignette -->
             <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none rounded-[2.5rem]"></div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-10 flex justify-center gap-6 flex-wrap">
            <button @click="startGame" class="group relative px-10 py-4 bg-field-accent text-black font-display font-bold text-xl rounded-xl overflow-hidden hover:scale-105 transition-all shadow-[0_0_30px_#00ff4130]">
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span class="relative flex items-center gap-2">
                    <span class="material-icons-outlined">sports_soccer</span>
                    FIND MATCH
                </span>
            </button>
            
            <router-link to="/team-builder" class="px-8 py-4 bg-gray-800 text-white font-display font-bold text-lg rounded-xl border border-white/10 hover:bg-gray-700 hover:border-white/30 transition-all flex items-center gap-2">
                <span class="material-icons-outlined text-field-accent">edit</span>
                MANAGE SQUAD
            </router-link>
            
            <router-link to="/shop" class="px-8 py-4 bg-gradient-to-r from-purple-900 to-purple-800 text-white font-display font-bold text-lg rounded-xl border border-white/10 hover:from-purple-800 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg">
                <span class="material-icons-outlined text-yellow-400">shopping_bag</span>
                STORE
            </router-link>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/Sidebar.vue';
import PlayerCard from '../components/PlayerCard.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const team = ref(null);
const coins = ref(0);

const username = computed(() => authStore.user?.username || 'Coach');
const formattedCoins = computed(() => coins.value.toLocaleString());

// Separated squad for layout
const goalkeeper = ref(null);
const defenders = ref([]);
const midfielders = ref([]);
const forwards = ref([]);

const getCardRarity = (rating) => {
    if (rating >= 88) return 'gold';
    if (rating >= 80) return 'silver';
    return 'bronze';
};

const fetchUserData = async () => {
    try {
        // Fetch Coins
        const coinsRes = await fetch('/api/coins', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (coinsRes.ok) {
            const data = await coinsRes.json();
            coins.value = data.coins;
        }

        // Fetch Team
        const teamRes = await fetch('/api/my-team', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        
        if (teamRes.ok) {
            const data = await teamRes.json();
            team.value = data;
            console.log('Team loaded:', data);
            organizeSquad(data.players || []);
        } else {
             team.value = null; // No team found
        }

    } catch (e) {
        console.error('Failed to load dashboard data:', e);
    } finally {
        loading.value = false;
    }
};

const organizeSquad = (players) => {
    // Reset
    goalkeeper.value = null;
    defenders.value = [];
    midfielders.value = [];
    forwards.value = [];

    // Filter nulls just in case
    const validPlayers = players.filter(p => p && p.position);

    // Naive distribution logic (can be smarter based on specific formation)
    validPlayers.forEach(p => {
        if (p.position === 'GK') {
            if (!goalkeeper.value) goalkeeper.value = p;
            else defenders.value.push(p); // Overflow
        } else if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DF'].includes(p.position)) {
            defenders.value.push(p);
        } else if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'MF'].includes(p.position)) {
            midfielders.value.push(p);
        } else {
            forwards.value.push(p); // ST, CF, LW, RW, FW
        }
    });
    
    // Sort slightly by rating for neatness
    defenders.value.sort((a,b) => b.overallRating - a.overallRating);
    midfielders.value.sort((a,b) => b.overallRating - a.overallRating);
    forwards.value.sort((a,b) => b.overallRating - a.overallRating);
};

const startGame = () => {
    const sessionId = Math.random().toString(36).substring(7).toUpperCase();
    router.push(`/game/${sessionId}`);
};

onMounted(() => {
    if (!authStore.isAuthenticated) {
        router.push('/');
        return;
    }
    fetchUserData();
});
</script>

<style>
/* Custom Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

