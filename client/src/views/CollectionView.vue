<template>
  <div class="flex h-screen bg-gray-900 overflow-hidden text-white font-sports">
    <Sidebar />

    <main class="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-gray-800">
      <!-- Background -->
      <div class="absolute inset-0 bg-[url('/assets/carbon-fibre.png')] opacity-10 z-0 pointer-events-none"></div>

      <!-- Header -->
      <header class="h-20 flex items-center justify-between px-8 z-20 relative pointer-events-none">
         <div>
             <h2 class="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">MY ALBUM</h2>
             <p class="text-xs text-gray-400 font-bold tracking-widest">{{ collectedCount }} CARDS COLLECTED</p>
         </div>

         <!-- Filters & Controls (Pointer Events Enabled) -->
          <div class="pointer-events-auto flex items-center gap-4">
             
             <!-- Selection Toggle -->
             <button 
                @click="toggleSelectionMode"
                class="px-4 py-1.5 rounded-full font-bold text-sm transition-all border border-white/10 flex items-center gap-2 shadow-lg"
                :class="isSelectionMode ? 'bg-field-accent text-black scale-105' : 'bg-black/40 text-white hover:bg-white/10'"
             >
                <Check class="w-4 h-4" />
                <span>{{ isSelectionMode ? 'Done' : 'Select' }}</span>
             </button>

             <!-- Search -->
             <div class="relative group">
                 <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Search player..." 
                    class="bg-black/40 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all w-48 focus:w-64 placeholder-gray-500 text-white"
                 >
                 <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
             </div>

             <!-- Advanced Filters Toggle -->
             <button 
                @click="showAdvancedFilters = !showAdvancedFilters"
                class="px-4 py-1.5 rounded-full font-bold text-sm transition-all border border-white/10 flex items-center gap-2 shadow-lg"
                :class="showAdvancedFilters ? 'bg-white/20 text-white' : 'bg-black/40 text-white hover:bg-white/10'"
             >
                <span class="material-icons-outlined text-sm">tune</span>
                <span>Filters</span>
             </button>

             <!-- Position Filter -->
             <div class="flex bg-black/40 rounded-lg p-1 border border-white/10">
                 <button 
                    v-for="pos in ['ALL', 'FW', 'MF', 'DF', 'GK']" 
                    :key="pos"
                    @click="selectedPosition = pos"
                    class="px-3 py-1 rounded-md text-xs font-bold transition-all"
                    :class="selectedPosition === pos ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-gray-200'"
                 >
                    {{ pos }}
                 </button>
             </div>

             <!-- Sort -->
             <div class="relative">
                <select 
                    v-model="sortBy"
                    class="appearance-none bg-black/40 border border-white/10 rounded-full py-1.5 pl-4 pr-8 text-sm focus:outline-none focus:border-white/30 text-white font-bold cursor-pointer hover:bg-black/60 transition-all"
                >
                    <option value="rating_desc">Highest Rated</option>
                    <option value="rating_asc">Lowest Rated</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                </select>
                <ArrowUpDown class="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>

          </div>
      </header>

      <!-- Advanced Filters Panel -->
      <div v-if="showAdvancedFilters" class="bg-black/60 border-b border-white/10 px-8 py-4 z-20 relative animate-fadeIn">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input v-model="advancedFilters.nationality" @change="showAdvancedFilters = false" type="text" placeholder="Nationality" class="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 placeholder-gray-500" />
              <input v-model="advancedFilters.league" @change="showAdvancedFilters = false" type="text" placeholder="League" class="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 placeholder-gray-500" />
              <input v-model="advancedFilters.team" @change="showAdvancedFilters = false" type="text" placeholder="Club" class="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 placeholder-gray-500" />
              <select v-model="advancedFilters.type" @change="showAdvancedFilters = false" class="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                  <option value="">All Types</option>
                  <option value="bronze">Bronze (< 70)</option>
                  <option value="silver">Silver (70-79)</option>
                  <option value="gold">Gold (80-89)</option>
                  <option value="special">Special (90+)</option>
              </select>
          </div>
          <button @click="clearAdvancedFilters" class="mt-3 px-4 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-full text-sm font-bold transition-all">
              Clear Advanced Filters
          </button>
      </div>

      <!-- BINDER CONTAINER -->
      <div class="flex-1 w-full overflow-y-auto z-10 perspective-1500 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div class="min-h-full flex flex-col items-center justify-center p-4 lg:p-8">
        
        <div v-if="loading" class="flex flex-col items-center justify-center">
             <Loader2 class="w-16 h-16 animate-spin text-field-accent mb-4" />
             <p class="text-gray-400 font-bold">Loading Collection...</p>
        </div>

        <div v-else class="relative w-full max-w-7xl aspect-square lg:aspect-[5/4] xl:aspect-[4/3] rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex overflow-hidden border border-white/5 transition-transform duration-500">
             
             <!-- Leather Cover Texture -->
             <div class="absolute inset-0 bg-[#3e2723]">
                <div class="absolute inset-0 bg-[url('/assets/texture_leather.png')] bg-repeat opacity-80 mix-blend-multiply"></div>
                <div class="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
             </div>

             <!-- Binder Rings (Centered) -->
             <div class="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 z-40 flex flex-col justify-center gap-12 pointer-events-none py-10">
                 <img src="/assets/binder_rings.png" class="w-full h-auto drop-shadow-2xl opacity-90 brightness-110" />
                 <img src="/assets/binder_rings.png" class="w-full h-auto drop-shadow-2xl opacity-90 brightness-110" />
                 <img src="/assets/binder_rings.png" class="w-full h-auto drop-shadow-2xl opacity-90 brightness-110" />
             </div>

             <!-- Spine Shadow -->
             <div class="absolute left-1/2 top-0 bottom-0 w-32 -translate-x-1/2 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-30 pointer-events-none mix-blend-multiply"></div>
             
             <!-- Left Page -->
             <div class="flex-1 relative z-20 p-4 pr-10 flex flex-col items-center shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]">
                 <!-- Paper Texture -->
                 <div class="absolute inset-2 top-3 bottom-3 rounded-l-md bg-[#fdfbf7] shadow-md overflow-hidden flex flex-col">
                     <div class="absolute inset-0 bg-[url('/assets/texture_paper.png')] bg-repeat opacity-60 mix-blend-multiply pointer-events-none"></div>
                     <!-- Content Container (Scrollable if needed) -->
                     <div class="relative z-10 flex-1 overflow-y-auto scrollbar-hide p-4 pt-6 pr-6 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
                         <div v-for="card in leftPageCards" :key="card.slotId" 
                             class="aspect-[2/3] relative rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center group cursor-pointer transition-all"
                             :class="{ 'ring-4 ring-field-accent ring-offset-2 ring-offset-black scale-105': isSelected(card), 'opacity-50 grayscale': isSelectionMode && !isSelected(card) && selectedCardIds.size > 0 }"
                             @click.stop="handleCardClick(card)">
                            
                            <span v-if="!card.id" class="text-gray-300 font-display font-bold text-2xl select-none">{{ card.slotId }}</span>

                            <!-- Selection Checkbox Overlay -->
                            <div v-if="isSelectionMode && card.id" class="absolute top-2 right-2 z-50">
                                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-black/50 overflow-hidden"
                                    :class="isSelected(card) ? 'bg-field-accent border-field-accent' : 'border-white/50'">
                                    <Check v-if="isSelected(card)" class="w-4 h-4 text-black font-bold" />
                                </div>
                            </div>

                            <div v-if="card.id" class="w-full h-full p-1.5 hover:z-50 transition-all duration-300">
                                 <PlayerCard 
                                    :name="card.name||card.real_name"
                                    :rating="card.overallRating"
                                    :position="card.position"
                                    :imageUrl="card.imageUrl"
                                    :team="card.team"
                                    :nationality="card.nationality"
                                    :league="card.league"
                                    :stats="{power:card.power, shoot:card.shoot, pass:card.pass, tackle:card.tackle}" 
                                    :rarity="getCardRarity(card.overallRating)"
                                    class="w-full h-full shadow-lg pointer-events-none"
                                />
                            </div>
                         </div>
                     </div>
                     <!-- Page Number -->
                     <div class="absolute bottom-2 left-6 font-display text-gray-400 font-bold opacity-50 z-20 text-xs">PAGE {{ currentPage * 2 + 1 }}</div>
                 </div>
                 
                 <!-- Prev Button -->
                 <button @click="prevPage" :disabled="currentPage === 0" class="absolute bottom-8 left-10 z-50 w-10 h-10 bg-black/80 text-white rounded-full flex items-center justify-center hover:bg-black disabled:opacity-0 transition-all shadow-lg">
                     <ChevronLeft class="w-6 h-6" />
                 </button>
             </div>

             <!-- Right Page -->
             <div class="flex-1 relative z-20 p-4 pl-10 flex flex-col items-center shadow-[inset_10px_0_20px_rgba(0,0,0,0.2)]">
                 <!-- Paper Texture -->
                 <div class="absolute inset-2 top-3 bottom-3 rounded-r-md bg-[#fdfbf7] shadow-md overflow-hidden flex flex-col">
                     <div class="absolute inset-0 bg-[url('/assets/texture_paper.png')] bg-repeat opacity-60 mix-blend-multiply pointer-events-none"></div>
                      <!-- Content Container -->
                     <div class="relative z-10 flex-1 overflow-y-auto scrollbar-hide p-4 pt-6 pl-6 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
                         <div v-for="card in rightPageCards" :key="card.slotId" 
                             class="aspect-[2/3] relative rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center group cursor-pointer transition-all"
                             :class="{ 'ring-4 ring-field-accent ring-offset-2 ring-offset-black scale-105': isSelected(card), 'opacity-50 grayscale': isSelectionMode && !isSelected(card) && selectedCardIds.size > 0 }"
                             @click.stop="handleCardClick(card)">
                            
                            <span v-if="!card.id" class="text-gray-300 font-display font-bold text-2xl select-none">{{ card.slotId }}</span>

                             <!-- Selection Checkbox Overlay -->
                            <div v-if="isSelectionMode && card.id" class="absolute top-2 right-2 z-50">
                                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-black/50 overflow-hidden"
                                    :class="isSelected(card) ? 'bg-field-accent border-field-accent' : 'border-white/50'">
                                    <Check v-if="isSelected(card)" class="w-4 h-4 text-black font-bold" />
                                </div>
                            </div>

                            <div v-if="card.id" class="w-full h-full p-1.5 hover:z-50 transition-all duration-300">
                                 <PlayerCard 
                                    :name="card.name||card.real_name"
                                    :rating="card.overallRating"
                                    :position="card.position"
                                    :imageUrl="card.imageUrl"
                                    :team="card.team"
                                    :nationality="card.nationality"
                                    :league="card.league"
                                    :stats="{power:card.power, shoot:card.shoot, pass:card.pass, tackle:card.tackle}" 
                                    :rarity="getCardRarity(card.overallRating)"
                                    class="w-full h-full shadow-lg pointer-events-none"
                                />
                            </div>
                         </div>
                     </div>
                      <!-- Page Number -->
                     <div class="absolute bottom-2 right-6 font-display text-gray-400 font-bold opacity-50 z-20 text-xs">PAGE {{ currentPage * 2 + 2 }}</div>
                 </div>

                 <!-- Next Button -->
                 <button @click="nextPage" :disabled="!hasNextPage" class="absolute bottom-8 right-10 z-50 w-10 h-10 bg-black/80 text-white rounded-full flex items-center justify-center hover:bg-black disabled:opacity-0 transition-all shadow-lg">
                     <ChevronRight class="w-6 h-6" />
                 </button>
             </div>
        </div>
      </div>
      </div>
    </main>
    
    <!-- Action Floating Bar -->
    <div v-if="isSelectionMode && selectedCount > 0" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-white/20 rounded-full px-8 py-4 shadow-2xl flex items-center gap-8 animate-fade-in-up">
        <div class="flex flex-col">
            <span class="text-gray-400 text-xs font-bold uppercase tracking-widest">Selected</span>
            <span class="text-white font-bold text-xl">{{ selectedCount }} <span class="text-sm font-normal text-gray-500">Players</span></span>
        </div>
        <div class="h-10 w-px bg-white/10"></div>
         <div class="flex flex-col">
            <span class="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Value</span>
            <span class="text-field-accent font-bold text-xl flex items-center gap-1">
                <span class="material-icons-outlined text-sm">monetization_on</span>
                {{ selectedTotalValue.toLocaleString() }}
            </span>
        </div>
        <div v-if="confirmingSell" class="flex items-center gap-3 animate-fade-in">
            <span class="text-xs text-gray-300 font-bold uppercase mr-2">Are you sure?</span>
            <button 
                @click="confirmingSell = false"
                class="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors font-bold text-sm">
                CANCEL
            </button>
            <button 
                @click="executeSell"
                :disabled="selling"
                class="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors font-bold text-sm flex items-center gap-2">
                <Loader2 v-if="selling" class="w-4 h-4 animate-spin" />
                <span v-else class="material-icons-outlined text-sm">check</span>
                CONFIRM
            </button>
        </div>
        <button 
            v-else
            @click="confirmingSell = true"
            :disabled="selling"
            class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-full transition-all shadow-lg hover:shadow-red-900/50 flex items-center gap-2"
        >
            <span class="material-icons-outlined text-lg">delete_sweep</span>
            <span>SELL NOW</span>
        </button>
    </div>
    
    <!-- Player Detail Overlay -->
    <!-- Player Detail Overlay -->
    <PlayerDetailView 
        v-if="selectedCard" 
        :card="selectedCard" 
        @close="selectedCard = null" 
        @sold="onCardSold"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import PlayerCard from '../components/PlayerCard.vue';
import PlayerDetailView from '../components/PlayerDetailView.vue';
import { ChevronLeft, ChevronRight, Loader2, Search, ArrowUpDown, Check, Trash2 } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(true);
const cards = ref([]);
const currentPage = ref(0);
const selectedCard = ref(null);

// Filters & Sort State
const searchQuery = ref('');
const selectedPosition = ref('ALL');
const sortBy = ref('rating_desc');
const showAdvancedFilters = ref(false);
const advancedFilters = ref({
    nationality: '',
    league: '',
    team: '',
    type: ''
});

const clearAdvancedFilters = () => {
    advancedFilters.value = {
        nationality: '',
        league: '',
        team: '',
        type: ''
    };
};

const getRatingRange = (type) => {
    switch (type?.toLowerCase()) {
        case 'bronze': return { min: 0, max: 69 };
        case 'silver': return { min: 70, max: 79 };
        case 'gold': return { min: 80, max: 89 };
        case 'special': return { min: 90, max: 100 };
        default: return null;
    }
};

// Selection Mode State
const isSelectionMode = ref(false);
const selectedCardIds = ref(new Set());
const selling = ref(false);
const confirmingSell = ref(false);

const CARDS_PER_PAGE = 9; // 9 cards per page (3x3 grid)

const collectedCount = computed(() => cards.value.length);
const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredCards.value.length / (2 * CARDS_PER_PAGE)));
});

const totalSlots = computed(() => totalPages.value * 2 * CARDS_PER_PAGE);

// Filter & Sort Logic
const filteredCards = computed(() => {
    let result = [...cards.value];

    // 1. Text Search
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(card => 
            (card.name && card.name.toLowerCase().includes(query)) ||
            (card.real_name && card.real_name.toLowerCase().includes(query))
        );
    }

    // 2. Position Filter
    if (selectedPosition.value !== 'ALL') {
        const pos = selectedPosition.value;
        if (pos === 'FW') {
            result = result.filter(card => ['ST', 'LW', 'RW', 'CF', 'LS', 'RS', 'LF', 'RF'].includes(card.position));
        } else if (pos === 'MF') {
            result = result.filter(card => ['CM', 'CDM', 'LM', 'RM', 'CAM', 'LAM', 'RAM', 'LDM', 'RDM'].includes(card.position));
        } else if (pos === 'DF') {
            result = result.filter(card => ['CB', 'RCB', 'LCB', 'LB', 'RB', 'LWB', 'RWB'].includes(card.position));
        } else if (pos === 'GK') {
             result = result.filter(card => card.position === 'GK');
        }
    }

    // 3. Advanced Filters
    // Nationality filter
    if (advancedFilters.value.nationality) {
        const lowerNat = advancedFilters.value.nationality.toLowerCase();
        result = result.filter(card => card.nationality && card.nationality.toLowerCase() === lowerNat);
    }

    // League filter
    if (advancedFilters.value.league) {
        const lowerLeague = advancedFilters.value.league.toLowerCase();
        result = result.filter(card => card.league && card.league.toLowerCase() === lowerLeague);
    }

    // Team filter
    if (advancedFilters.value.team) {
        const lowerTeam = advancedFilters.value.team.toLowerCase();
        result = result.filter(card => card.team && card.team.toLowerCase().includes(lowerTeam));
    }

    // Type/rarity filter
    if (advancedFilters.value.type) {
        const range = getRatingRange(advancedFilters.value.type);
        if (range) {
            result = result.filter(card => {
                const rating = card.overallRating || 0;
                return rating >= range.min && rating <= range.max;
            });
        }
    }

    // 4. Sorting
    result.sort((a, b) => {
        if (sortBy.value === 'rating_desc') return b.overallRating - a.overallRating;
        if (sortBy.value === 'rating_asc') return a.overallRating - b.overallRating;
        if (sortBy.value === 'name_asc') {
            const nameA = a.name || a.real_name || '';
            const nameB = b.name || b.real_name || '';
            return nameA.localeCompare(nameB);
        }
        if (sortBy.value === 'name_desc') {
            const nameA = a.name || a.real_name || '';
            const nameB = b.name || b.real_name || '';
            return nameB.localeCompare(nameA);
        }
        return 0;
    });

    return result;
});

// Generate pages with empty slots
const flattenedPages = computed(() => {
    const pages = [];
    const count = totalSlots.value;
    
    // Use filtered cards instead of raw cards
    const sortedCards = filteredCards.value;

    for (let i = 0; i < count; i++) {
        if (i < sortedCards.length) {
            pages.push({ ...sortedCards[i], slotId: i + 1 });
        } else {
            pages.push({ id: null, slotId: i + 1 });
        }
    }
    return pages;
});

const leftPageCards = computed(() => {
    const start = currentPage.value * 2 * CARDS_PER_PAGE;
    return flattenedPages.value.slice(start, start + CARDS_PER_PAGE);
});

const rightPageCards = computed(() => {
    const start = (currentPage.value * 2 + 1) * CARDS_PER_PAGE;
    return flattenedPages.value.slice(start, start + CARDS_PER_PAGE);
});

const hasNextPage = computed(() => {
    // Check if we have more slots to show, bounded by totalPages
    return currentPage.value < totalPages.value - 1;
});

const nextPage = () => {
    if (hasNextPage.value) currentPage.value++;
};

const prevPage = () => {
    if (currentPage.value > 0) currentPage.value--;
};

// Selection Logic
const toggleSelectionMode = () => {
    isSelectionMode.value = !isSelectionMode.value;
    if (!isSelectionMode.value) {
        selectedCardIds.value.clear();
    }
};

const isSelected = (card) => {
    return card && card.id && selectedCardIds.value.has(card.id);
};

const handleCardClick = (card) => {
    if (!card || !card.id) return;

    if (isSelectionMode.value) {
        if (selectedCardIds.value.has(card.id)) {
            selectedCardIds.value.delete(card.id);
        } else {
            selectedCardIds.value.add(card.id);
        }
    } else {
        openDetail(card);
    }
};

const selectedCount = computed(() => selectedCardIds.value.size);

const selectedTotalValue = computed(() => {
    let total = 0;
    selectedCardIds.value.forEach(id => {
        const card = cards.value.find(c => c.id === id);
        if (card) {
            total += calculateSellPrice(card.overallRating);
        }
    });
    return total;
});

const calculateSellPrice = (rating) => {
    // Replicating backend logic for display (or we could fetch config)
    if (rating >= 98) return 10000;
    if (rating >= 94) return 5000;
    if (rating >= 91) return 3500;
    if (rating >= 88) return 2700;
    if (rating >= 85) return 1900;
    if (rating >= 82) return 1500;
    if (rating >= 79) return 1000;
    if (rating >= 76) return 900;
    if (rating >= 71) return 800;
    if (rating >= 66) return 700;
    if (rating >= 61) return 600;
    if (rating >= 56) return 500;
    if (rating >= 51) return 250;
    if (rating >= 46) return 175;
    if (rating >= 40) return 150;
    return 100;
};

const openDetail = (card) => {
    console.log('OPEN DETAIL CLICKED:', card);
    if (card && card.id) {
        selectedCard.value = card;
        console.log('Detail View Opened for:', card.name);
    } else {
        console.warn('Clicked card has no ID or is null:', card);
    }
};

const onCardSold = (data) => {
    console.log('Card Sold!', data);
    selectedCard.value = null;
    fetchCollection(); // Refresh collection
};

const executeSell = async () => {
    if (selectedCount.value === 0) return;
    
    selling.value = true;
    try {
        const res = await fetch('/api/sell-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify({ cardIds: Array.from(selectedCardIds.value) })
        });

        if (res.ok) {
            const result = await res.json();
            console.log('Sell result:', result);
            selectedCardIds.value.clear();
            isSelectionMode.value = false;
            fetchCollection();
        } else {
            const err = await res.json();
            console.error('Sell failed:', err);
            alert('Failed to sell cards: ' + (err.error || 'Unknown error'));
        }
    } catch (e) {
        console.error('Error selling cards:', e);
        alert('Error communicating with server');
    } finally {
        selling.value = false;
        confirmingSell.value = false;
    }
};

const getCardRarity = (rating) => {
    if (rating >= 85) return 'gold-rare';   // 85+: Gold Rare
    if (rating >= 76) return 'gold';        // 84-76: Gold
    if (rating >= 69) return 'silver-rare'; // 75-69: Silver Rare
    if (rating >= 59) return 'silver';      // 68-59: Silver
    if (rating >= 54) return 'bronze-rare'; // 58-54: Bronze Rare
    return 'bronze';                        // 53-: Bronze
};

const fetchCollection = async () => {
    loading.value = true;
    if (!authStore.isAuthenticated) {
        router.push('/');
        return;
    }

    try {
        const res = await fetch('/api/collection', {
             headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log('[DEBUG] Collection Fetched:', data.length, 'cards');
            if (data.length > 0) console.log('[DEBUG] First card:', data[0]);
            
            // Let's sort by Rating for now (Best players first).
            // data.sort((a,b) => b.overallRating - a.overallRating); // Sorting moved to flattenedPages computed
            cards.value = data;

            // Clear selected if they no longer exist
            const cardIds = new Set(data.map(c => c.id));
            const newSelected = new Set();
            selectedCardIds.value.forEach(id => {
                if (cardIds.has(id)) newSelected.add(id);
            });
            selectedCardIds.value = newSelected;

        } else {
            console.error('Fetch failed:', res.status, res.statusText);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCollection();
});
</script>

<style scoped>
.perspective-1500 {
    perspective: 1500px;
}
</style>
