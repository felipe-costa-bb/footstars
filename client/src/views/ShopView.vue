<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/dashboard" class="flex items-center gap-2 text-field-accent hover:text-field-accent/80 mb-2 inline-block transition-colors">
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Dashboard</span>
        </router-link>
        <h1 class="text-4xl font-bold text-white">Pack Shop</h1>
        <p class="text-gray-400">Spend your coins to get new players</p>
      </div>

      <!-- Coin Balance -->
      <div class="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-4 mb-8 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Coins class="w-8 h-8 text-yellow-300" />
          <div>
            <div class="text-black/60 text-sm font-semibold">Your Balance</div>
            <div class="text-3xl font-bold text-black">{{ coins.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-field-accent"></div>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-900/30 border border-red-600 rounded-lg p-4 text-center text-red-400 mb-6">
        {{ error }}
      </div>

      <!-- Player Search Section -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-white mb-4">Transfer Market</h2>
        <div class="bg-field-semidark rounded-lg p-6 border border-white/10">
          <!-- Search Bar -->
          <div class="flex gap-4 mb-4">
            <input 
              v-model="filters.name" 
              @keyup.enter="searchPlayers"
              type="text" 
              placeholder="Search by player name..." 
              class="flex-1 bg-black/40 border border-white/20 rounded px-4 py-3 text-white focus:outline-none focus:border-field-accent transition-colors"
            />
            <button 
              @click="toggleFilters"
              class="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded transition-colors flex items-center gap-2"
            >
              <Filter class="w-4 h-4" />
              Filters
            </button>
            <button 
              @click="searchPlayers"
              class="bg-field-accent hover:bg-field-accent/90 text-black font-bold px-8 py-3 rounded transition-colors"
              :disabled="loadingSearch"
            >
              {{ loadingSearch ? 'Searching...' : 'Search' }}
            </button>
          </div>

          <!-- Advanced Filters (Collapsible) -->
          <div v-if="showFilters" class="mb-6 p-4 bg-black/30 rounded-lg border border-white/10">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Position Filter -->
              <div>
                <label class="block text-sm font-semibold text-gray-400 mb-2">Position</label>
                <select 
                  v-model="filters.position"
                  class="w-full bg-black/40 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-field-accent transition-colors"
                >
                  <option value="">All Positions</option>
                  <option value="GK">GK - Goalkeeper</option>
                  <option value="CB">CB - Center Back</option>
                  <option value="LB">LB - Left Back</option>
                  <option value="RB">RB - Right Back</option>
                  <option value="LWB">LWB - Left Wing Back</option>
                  <option value="RWB">RWB - Right Wing Back</option>
                  <option value="CDM">CDM - Defensive Mid</option>
                  <option value="CM">CM - Center Mid</option>
                  <option value="CAM">CAM - Attacking Mid</option>
                  <option value="LM">LM - Left Mid</option>
                  <option value="RM">RM - Right Mid</option>
                  <option value="LW">LW - Left Wing</option>
                  <option value="RW">RW - Right Wing</option>
                  <option value="ST">ST - Striker</option>
                  <option value="CF">CF - Center Forward</option>
                </select>
              </div>

              <!-- Nationality Filter -->
              <div>
                <label class="block text-sm font-semibold text-gray-400 mb-2">Nationality</label>
                <input 
                  v-model="filters.nationality"
                  type="text" 
                  placeholder="e.g., Argentina, Brazil" 
                  class="w-full bg-black/40 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-field-accent transition-colors"
                />
              </div>

              <!-- League Filter -->
              <div>
                <label class="block text-sm font-semibold text-gray-400 mb-2">League</label>
                <input 
                  v-model="filters.league"
                  type="text" 
                  placeholder="e.g., Premier League, La Liga" 
                  class="w-full bg-black/40 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-field-accent transition-colors"
                />
              </div>

              <!-- Team/Club Filter -->
              <div>
                <label class="block text-sm font-semibold text-gray-400 mb-2">Club</label>
                <input 
                  v-model="filters.team"
                  type="text" 
                  placeholder="e.g., Arsenal, Real Madrid" 
                  class="w-full bg-black/40 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-field-accent transition-colors"
                />
              </div>

              <!-- Type/Rarity Filter -->
              <div>
                <label class="block text-sm font-semibold text-gray-400 mb-2">Card Type</label>
                <select 
                  v-model="filters.type"
                  class="w-full bg-black/40 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-field-accent transition-colors"
                >
                  <option value="">All Types</option>
                  <option value="bronze">Bronze (< 70)</option>
                  <option value="silver">Silver (70-79)</option>
                  <option value="gold">Gold (80-89)</option>
                  <option value="special">Special (90+)</option>
                </select>
              </div>
            </div>

            <!-- Clear Filters Button -->
            <div class="mt-4 flex justify-end">
              <button 
                @click="clearFilters"
                class="bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold px-4 py-2 rounded transition-colors flex items-center gap-2"
              >
                <X class="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap gap-2">
            <span class="text-sm text-gray-400">Active filters:</span>
            <span v-if="filters.name" class="bg-field-accent/20 text-field-accent px-3 py-1 rounded-full text-sm font-semibold">
              Name: {{ filters.name }}
            </span>
            <span v-if="filters.position" class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
              Position: {{ filters.position }}
            </span>
            <span v-if="filters.nationality" class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
              Nationality: {{ filters.nationality }}
            </span>
            <span v-if="filters.league" class="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
              League: {{ filters.league }}
            </span>
            <span v-if="filters.team" class="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
              Club: {{ filters.team }}
            </span>
            <span v-if="filters.type" class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
              Type: {{ filters.type.charAt(0).toUpperCase() + filters.type.slice(1) }}
            </span>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div v-for="player in searchResults" :key="player.id" class="bg-black/60 p-4 rounded-lg border border-white/10 hover:border-white/30 transition-colors">
              <div class="mb-4 cursor-pointer" @click="openDetail(player)">
                 <PlayerCard
                  :name="player.name"
                  :rating="player.overallRating"
                  :position="player.position"
                  :image-url="player.imageUrl"
                  :team="player.team"
                  :nationality="player.nationality"
                  :league="player.league"
                  :stats="{
                    power: player.power,
                    shoot: player.shoot,
                    pass: player.pass,
                    tackle: player.tackle
                  }"
                />
              </div>
              <button 
                @click="initiateBuy(player)"
                class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="coins < player.buyPrice"
              >
                <span>Buy for</span>
                <span class="flex items-center text-yellow-300">{{ player.buyPrice.toLocaleString() }} <Coins class="w-4 h-4 ml-1" /></span>
              </button>
            </div>
          </div>
          <div v-else-if="searched && searchResults.length === 0" class="text-center text-gray-400 py-8">
            No players found matching your search criteria
          </div>
        </div>
      </div>

      <!-- Pack Options -->
      <h2 class="text-2xl font-bold text-white mb-4">Store Packs</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Bronze Pack -->
        <div class="bg-gradient-to-b from-amber-700 to-amber-900 rounded-xl p-6 border-2 border-amber-600 hover:border-amber-400 transition transform hover:scale-105 cursor-pointer" @click="buyPack('bronze')">
          <div class="text-center">
            <div class="mb-4 flex justify-center">
              <Package class="w-16 h-16 text-amber-200" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">Bronze Pack</h3>
            <p class="text-amber-200 mb-4">3 Random Players</p>
            <div class="bg-black/30 rounded-lg py-3 px-4">
              <span class="text-yellow-400 font-bold text-xl flex items-center justify-center gap-1">300,000 <Coins class="w-5 h-5" /></span>
            </div>
          </div>
        </div>

        <!-- Silver Pack -->
        <div class="bg-gradient-to-b from-gray-400 to-gray-600 rounded-xl p-6 border-2 border-gray-300 hover:border-white transition transform hover:scale-105 cursor-pointer" @click="buyPack('silver')">
          <div class="text-center">
            <div class="mb-4 flex justify-center">
              <Gift class="w-16 h-16 text-gray-200" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">Silver Pack</h3>
            <p class="text-gray-200 mb-4">5 Random Players</p>
            <div class="bg-black/30 rounded-lg py-3 px-4">
              <span class="text-yellow-400 font-bold text-xl flex items-center justify-center gap-1">500,000 <Coins class="w-5 h-5" /></span>
            </div>
          </div>
        </div>

        <!-- Gold Pack -->
        <div class="bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-xl p-6 border-2 border-yellow-400 hover:border-yellow-200 transition transform hover:scale-105 cursor-pointer" @click="buyPack('gold')">
          <div class="text-center">
            <div class="mb-4 flex justify-center">
              <Trophy class="w-16 h-16 text-yellow-400" />
            </div>
            <h3 class="text-2xl font-bold text-black mb-2">Gold Pack</h3>
            <p class="text-yellow-900 mb-4">7 Random Players</p>
            <div class="bg-black/30 rounded-lg py-3 px-4">
              <span class="text-yellow-300 font-bold text-xl flex items-center justify-center gap-1">750,000 <Coins class="w-5 h-5" /></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pack Opening Result -->
      <div v-if="packResult" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click="packResult = null">
        <div class="w-full max-w-6xl max-h-screen overflow-y-auto">
          <div class="text-center mb-8">
            <h2 class="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <PartyPopper class="w-8 h-8 text-yellow-400" />
              Pack Opened!
            </h2>
            <p class="text-gray-400">Click anywhere to close</p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-12 pb-20">
            <div v-for="card in packResult.cards" :key="card.id" class="flex flex-col items-center animate-fade-in-up">
                <!-- Card -->
                <div class="w-64 h-96 transition-transform hover:scale-105 duration-300 cursor-pointer" @click.stop="openDetail(card.player || card)">
                  <PlayerCard
                    :name="card.player?.name || card.name"
                    :rating="card.player?.overallRating || card.overallRating"
                    :position="card.player?.position || card.position"
                    :image-url="card.player?.imageUrl || card.imageUrl"
                    :team="card.player?.team || card.team"
                    :nationality="card.player?.nationality || card.nationality"
                    :league="card.player?.league || card.league"
                    :stats="{
                      power: card.player?.power || card.power,
                      shoot: card.player?.shoot || card.shoot,
                      pass: card.player?.pass || card.pass,
                      tackle: card.player?.tackle || card.tackle
                    }"
                  />
                </div>

                <!-- New Details Section -->
                <div class="mt-6 bg-black/60 rounded-xl p-6 border border-white/10 w-full max-w-sm backdrop-blur-md shadow-2xl">
                     <!-- Personal Info -->
                     <div class="text-center mb-4 border-b border-white/10 pb-4">
                        <h3 class="text-2xl font-black text-white uppercase italic tracking-tighter">{{ card.player?.name || card.name }}</h3>
                        <div class="flex flex-wrap items-center justify-center gap-2 mt-2">
                             <div class="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs text-gray-300 font-bold uppercase" title="Country">
                                <span class="material-icons-outlined text-[10px]">public</span>
                                <span>{{ card.player?.nationality || card.nationality || 'Unknown' }}</span>
                             </div>
                             <div class="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs text-gray-300 font-bold uppercase" title="Club">
                                <span class="material-icons-outlined text-[10px]">shield</span>
                                <span>{{ card.player?.team || card.team || 'Unknown Club' }}</span>
                             </div>
                             <div v-if="card.player?.league || card.league" class="flex items-center gap-1 bg-field-accent/20 text-field-accent text-xs px-2 py-1 rounded font-bold uppercase" title="League">
                                <span class="material-icons-outlined text-[10px]">emoji_events</span>
                                <span>{{ card.player?.league || card.league }}</span>
                             </div>
                        </div>
                     </div>

                     <!-- Explicit Attributes Grid -->
                     <div class="grid grid-cols-4 gap-2">
                         <div class="flex flex-col items-center bg-black/40 p-2 rounded border border-white/5">
                             <span class="text-[10px] text-gray-500 font-bold tracking-widest">POW</span>
                             <span class="text-xl font-mono font-bold text-white">{{ card.player?.power || card.power || 0 }}</span>
                         </div>
                         <div class="flex flex-col items-center bg-black/40 p-2 rounded border border-white/5">
                             <span class="text-[10px] text-gray-500 font-bold tracking-widest">SHO</span>
                             <span class="text-xl font-mono font-bold text-white">{{ card.player?.shoot || card.shoot || 0 }}</span>
                         </div>
                         <div class="flex flex-col items-center bg-black/40 p-2 rounded border border-white/5">
                             <span class="text-[10px] text-gray-500 font-bold tracking-widest">PAS</span>
                             <span class="text-xl font-mono font-bold text-white">{{ card.player?.pass || card.pass || 0 }}</span>
                         </div>
                         <div class="flex flex-col items-center bg-black/40 p-2 rounded border border-white/5">
                             <span class="text-[10px] text-gray-500 font-bold tracking-widest">DEF</span>
                             <span class="text-xl font-mono font-bold text-white">{{ card.player?.tackle || card.tackle || 0 }}</span>
                         </div>
                     </div>

                     <!-- Position & Rating Footer -->
                     <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-center px-2">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-gray-500 font-bold uppercase">POS</span>
                            <span class="text-lg font-black text-white">{{ card.player?.position || card.position }}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-[10px] text-gray-500 font-bold uppercase">RATING</span>
                            <span class="text-lg font-black text-field-accent">{{ card.player?.overallRating || card.overallRating }}</span>
                        </div>
                     </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Confirmation Modal -->
      <div v-if="selectedPlayerToBuy" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div class="bg-field-semidark rounded-xl p-8 border border-white/20 max-w-md w-full text-center">
            <h3 class="text-2xl font-bold text-white mb-2">Confirm Purchase</h3>
            <p class="text-gray-300 mb-6">
                Are you sure you want to buy <span class="text-field-accent font-bold">{{ selectedPlayerToBuy.name }}</span> for <span class="text-yellow-400 font-bold">{{ selectedPlayerToBuy.buyPrice.toLocaleString() }}</span> coins?
            </p>

            <div class="flex justify-center gap-4">
                <button 
                    @click="selectedPlayerToBuy = null"
                    class="px-6 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white font-bold transition-colors"
                >
                    Cancel
                </button>
                <button 
                    @click="confirmBuy"
                    class="px-6 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition-colors flex items-center gap-2"
                >
                    Confirm <Coins class="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Player Detail Overlay -->
  <PlayerDetailView 
    v-if="selectedCard" 
    :card="selectedCard" 
    @close="selectedCard = null" 
    @sold="onCardSold"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import PlayerCard from '../components/PlayerCard.vue';
import PlayerDetailView from '../components/PlayerDetailView.vue';
import { ArrowLeft, Coins, Package, Gift, Trophy, PartyPopper, Filter, X } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const coins = ref(0);
const loading = ref(true);
const error = ref('');
const packResult = ref(null);

const searchResults = ref([]);
const selectedCard = ref(null);
const searched = ref(false);
const loadingSearch = ref(false);
const showFilters = ref(false);

// Filter state
const filters = ref({
  name: '',
  nationality: '',
  position: '',
  league: '',
  team: '',
  type: ''
});

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.value.name || filters.value.nationality || filters.value.position || 
         filters.value.league || filters.value.team || filters.value.type;
});

const fetchCoins = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/coins', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      coins.value = data.coins;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openDetail = (card) => {
  if (card && card.id) {
    selectedCard.value = card;
  }
};

const onCardSold = () => {
  selectedCard.value = null;
  fetchCoins();
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  filters.value = {
    name: '',
    nationality: '',
    position: '',
    league: '',
    team: '',
    type: ''
  };
};

const searchPlayers = async () => {
  // Check if at least one filter is provided
  if (!hasActiveFilters.value) return;
  
  loadingSearch.value = true;
  searched.value = true;
  searchResults.value = [];
  
  try {
    // Build query string from active filters
    const params = new URLSearchParams();
    
    if (filters.value.name) params.append('q', filters.value.name);
    if (filters.value.nationality) params.append('nationality', filters.value.nationality);
    if (filters.value.position) params.append('position', filters.value.position);
    if (filters.value.league) params.append('league', filters.value.league);
    if (filters.value.team) params.append('team', filters.value.team);
    if (filters.value.type) params.append('type', filters.value.type);
    
    const res = await fetch(`http://localhost:3000/api/players/search?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    
    if (res.ok) {
      searchResults.value = await res.json();
    }
  } catch (err) {
    console.error("Search error:", err);
  } finally {
    loadingSearch.value = false;
  }
};

const selectedPlayerToBuy = ref(null);

const initiateBuy = (player) => {
  selectedPlayerToBuy.value = player;
};

const confirmBuy = async () => {
  if (!selectedPlayerToBuy.value) return;
  const player = selectedPlayerToBuy.value;
  selectedPlayerToBuy.value = null; // Close modal

  error.value = '';
  
  try {
    const res = await fetch('http://localhost:3000/api/buy-player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ playerId: player.id })
    });

    const data = await res.json();
    
    if (res.ok && data.success) {
      packResult.value = {
        cards: [data.card]
      };
      
      coins.value = data.newBalance;
    } else {
      error.value = data.error || 'Failed to buy player';
      window.scrollTo(0, 0);
    }
  } catch (err) {
    error.value = err.message;
  }
};

const buyPack = async (packType) => {
  error.value = '';
  
  try {
    const res = await fetch('http://localhost:3000/api/buy-pack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ packType })
    });

    const data = await res.json();
    
    if (res.ok && data.success) {
      packResult.value = data;
      coins.value = data.newBalance;
    } else {
      error.value = data.error || 'Failed to buy pack';
    }
  } catch (err) {
    error.value = err.message;
  }
};

onMounted(() => {
  fetchCoins();
});
</script>
