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
             <p class="text-xs text-gray-400 font-bold tracking-widest">{{ collectedCount }} / {{ totalSlots }} STICKERS COLLECTED</p>
         </div>
      </header>

      <!-- BINDER CONTAINER -->
      <div class="flex-1 flex items-center justify-center p-4 lg:p-8 z-10 perspective-1500 flex-col">
        
        <div v-if="loading" class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-field-accent"></div>

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
                             class="aspect-[2/3] relative rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center group cursor-pointer"
                             @click.stop="openDetail(card)">
                            
                            <span v-if="!card.id" class="text-gray-300 font-display font-bold text-2xl select-none">{{ card.slotId }}</span>

                            <div v-else class="w-full h-full p-1.5 hover:z-50 transition-all duration-300">
                                 <PlayerCard 
                                    :name="card.name||card.real_name"
                                    :rating="card.overallRating"
                                    :position="card.position"
                                    :imageUrl="card.imageUrl"
                                    :team="card.team"
                                    :stats="{pace:card.power, shoot:card.shoot, pass:card.pass, tackle:card.tackle}" 
                                    :rarity="getCardRarity(card.overallRating)"
                                    class="w-full h-full shadow-lg"
                                />
                            </div>
                         </div>
                     </div>
                     <!-- Page Number -->
                     <div class="absolute bottom-2 left-6 font-display text-gray-400 font-bold opacity-50 z-20 text-xs">PAGE {{ currentPage * 2 + 1 }}</div>
                 </div>
                 
                 <!-- Prev Button -->
                 <button @click="prevPage" :disabled="currentPage === 0" class="absolute bottom-8 left-10 z-50 w-10 h-10 bg-black/80 text-white rounded-full flex items-center justify-center hover:bg-black disabled:opacity-0 transition-all shadow-lg text-2xl pb-1">
                     &lsaquo;
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
                             class="aspect-[2/3] relative rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center group cursor-pointer"
                             @click.stop="openDetail(card)">
                            
                            <span v-if="!card.id" class="text-gray-300 font-display font-bold text-2xl select-none">{{ card.slotId }}</span>

                            <div v-else class="w-full h-full p-1.5 hover:z-50 transition-all duration-300">
                                 <PlayerCard 
                                    :name="card.name||card.real_name"
                                    :rating="card.overallRating"
                                    :position="card.position"
                                    :imageUrl="card.imageUrl"
                                    :team="card.team"
                                    :stats="{pace:card.power, shoot:card.shoot, pass:card.pass, tackle:card.tackle}" 
                                    :rarity="getCardRarity(card.overallRating)"
                                    class="w-full h-full shadow-lg"
                                />
                            </div>
                         </div>
                     </div>
                      <!-- Page Number -->
                     <div class="absolute bottom-2 right-6 font-display text-gray-400 font-bold opacity-50 z-20 text-xs">PAGE {{ currentPage * 2 + 2 }}</div>
                 </div>

                 <!-- Next Button -->
                 <button @click="nextPage" :disabled="!hasNextPage" class="absolute bottom-8 right-10 z-50 w-10 h-10 bg-black/80 text-white rounded-full flex items-center justify-center hover:bg-black disabled:opacity-0 transition-all shadow-lg text-2xl pb-1">
                     &rsaquo;
                 </button>
             </div>
        </div>
      </div>
    </main>
    
    <!-- Player Detail Overlay -->
    <PlayerDetailView v-if="selectedCard" :card="selectedCard" @close="selectedCard = null" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';
import PlayerCard from '../components/PlayerCard.vue';
import PlayerDetailView from '../components/PlayerDetailView.vue';

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(true);
const cards = ref([]);
const currentPage = ref(0);
const selectedCard = ref(null);

const CARDS_PER_PAGE = 9; // 9 cards per page (3x3 grid)
const TOTAL_PAGES = 5;    // Fixed number of pages for the album feel
const TOTAL_SLOTS = TOTAL_PAGES * 2 * CARDS_PER_PAGE; 

const collectedCount = computed(() => cards.value.length);
const totalSlots = computed(() => TOTAL_SLOTS);

// Generate pages with empty slots
const flattenedPages = computed(() => {
    const pages = [];
    const count = TOTAL_SLOTS;
    
    // Sort cards by rating (High to Low)
    // Note: We already sort after fetch, but this ensures reactivity if cards change
    const sortedCards = [...cards.value].sort((a,b) => b.overallRating - a.overallRating);

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
    // Check if we have more slots to show, bounded by TOTAL_PAGES
    return currentPage.value < TOTAL_PAGES - 1;
});

const nextPage = () => {
    if (hasNextPage.value) currentPage.value++;
};

const prevPage = () => {
    if (currentPage.value > 0) currentPage.value--;
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

const getCardRarity = (rating) => {
    if (rating >= 88) return 'gold';
    if (rating >= 80) return 'silver';
    return 'bronze';
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
            console.log('Collection Fetched:', data.length, 'cards', data[0]);
            // Let's sort by Rating for now (Best players first).
            // data.sort((a,b) => b.overallRating - a.overallRating); // Sorting moved to flattenedPages computed
            cards.value = data;
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
