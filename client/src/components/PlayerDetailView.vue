<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4 lg:p-12 font-display text-white">
    <!-- Close Button -->
    <button @click="$emit('close')" class="absolute top-6 right-8 text-white/50 hover:text-white transition-colors z-50">
        <span class="material-icons-outlined text-4xl">close</span>
    </button>

    <div class="w-full max-w-7xl h-full flex flex-col lg:flex-row gap-8 overflow-hidden pointer-events-auto">
        
        <!-- Left Column: Hero Image -->
        <div class="lg:w-1/2 relative flex items-center justify-center">
            <!-- Background Glow -->
            <div class="absolute inset-0 bg-gradient-to-t from-field-accent/20 to-transparent opacity-50 blur-3xl"></div>
            
            <img 
              v-if="card.imageUrl" 
              :src="card.imageUrl" 
              @error="$event.target.src = '/assets/silhouette.svg'"
              class="relative z-10 w-full h-full object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] mask-image-gradient"
              alt="Hero"
            />
            <img 
              v-else 
              src="/assets/silhouette.svg" 
              class="relative z-10 w-full h-full object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] opacity-50 mask-image-gradient"
              alt="Hero"
            />
            
            <div class="absolute bottom-10 left-0 z-20">
                <h1 class="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 drop-shadow-2xl">
                    {{ card.name }}
                </h1>
                <div class="flex items-center gap-4 mt-2">
                     <span class="text-4xl font-bold text-field-accent">{{ card.overallRating }}</span>
                     <span class="text-2xl text-gray-400">{{ card.position }} | {{ card.team }}</span>
                </div>
            </div>
        </div>

        <!-- Right Column: Dashboard -->
        <div class="lg:w-1/2 flex flex-col h-full py-8 pr-4">
            
            <!-- Tabs -->
            <div class="flex items-center gap-6 mb-6 border-b border-white/10 pb-1">
                <button 
                    @click="activeTab = 'overview'" 
                    class="text-sm font-bold uppercase tracking-widest pb-3 transition-all border-b-2 relative"
                    :class="activeTab === 'overview' ? 'text-field-accent border-field-accent' : 'text-gray-500 border-transparent hover:text-white'"
                >
                    Overview
                </button>
                <button 
                    @click="activeTab = 'history'" 
                    class="text-sm font-bold uppercase tracking-widest pb-3 transition-all border-b-2 relative"
                    :class="activeTab === 'history' ? 'text-field-accent border-field-accent' : 'text-gray-500 border-transparent hover:text-white'"
                >
                    Career
                </button>
            </div>

            <!-- Content Container -->
            <div class="flex-1 overflow-hidden relative">
                
                <!-- Tab: Overview (Radar) -->
                <div v-if="activeTab === 'overview'" class="h-full flex flex-col animate-fade-in">
                    <div class="bg-white/5 rounded-3xl p-6 border border-white/10 relative flex-1 flex flex-col">
                        <h3 class="text-field-accent uppercase tracking-widest text-sm font-bold mb-4">Skill Analysis</h3>
                        <div class="flex-1 flex items-center justify-center relative w-full">
                            <!-- Simple SVG Radar Chart -->
                            <svg viewBox="0 0 100 100" class="h-full max-h-64 w-auto overflow-visible">
                                <!-- Background Diamonds -->
                                <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
                                <polygon points="50,30 70,50 50,70 30,50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
                                
                                <!-- Data Shape -->
                                <polygon :points="radarPoints" fill="rgba(202, 246, 70, 0.2)" stroke="#caf646" stroke-width="1.5" class="drop-shadow-glow" />
                                
                                <!-- Labels -->
                                <text x="50" y="5" text-anchor="middle" fill="#ccc" font-size="4">POW</text>
                                <text x="95" y="50" text-anchor="middle" fill="#ccc" font-size="4">SHO</text>
                                <text x="50" y="98" text-anchor="middle" fill="#ccc" font-size="4">PAS</text>
                                <text x="5" y="50" text-anchor="middle" fill="#ccc" font-size="4">DEF</text>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Tab: History (Matches & Graph) -->
                <div v-if="activeTab === 'history'" class="h-full flex flex-col gap-4 overflow-y-auto scrollbar-hide animate-fade-in custom-scrollbar">
                    
                    <!-- Matches Played List -->
                    <div class="bg-white/5 rounded-3xl p-6 border border-white/10 shrink-0">
                        <h3 class="text-field-accent uppercase tracking-widest text-sm font-bold mb-4">Recent Matches</h3>
                        <div class="space-y-3">
                             <div v-for="match in mockMatches" :key="match.id" class="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-white/5 transition-colors">
                                 <div class="flex items-center gap-3">
                                     <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{{ match.opponent.substring(0,2) }}</div>
                                     <span class="text-sm font-bold">{{ match.opponent }}</span>
                                 </div>
                                 <div class="flex items-center gap-4">
                                     <div class="text-xs text-gray-400 font-mono">{{ match.date }}</div>
                                     <div class="font-bold font-mono text-field-accent">{{ match.score }}</div>
                                 </div>
                             </div>
                        </div>
                    </div>
        
                    <!-- Graph: Goals per Season -->
                     <div class="bg-white/5 rounded-3xl p-6 border border-white/10 shrink-0">
                         <h3 class="text-field-accent uppercase tracking-widest text-sm font-bold mb-4">Career Trajectory</h3>
                         <div class="h-40 flex items-end justify-between gap-2 px-2 pb-2 border-b border-white/10">
                            <div v-for="(val, i) in mockHistory" :key="i" class="w-full bg-gradient-to-t from-field-accent/10 to-field-accent/80 rounded-t-sm transition-all hover:opacity-80 relative group" :style="{ height: val + '%' }">
                                 <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">{{ val }}</div>
                            </div>
                         </div>
                         <div class="flex justify-between mt-2 text-[10px] text-gray-500 font-mono uppercase">
                             <span>2020</span>
                             <span>2021</span>
                             <span>2022</span>
                             <span>2023</span>
                             <span>2024</span>
                         </div>
                    </div>
                </div>

            </div>

            <!-- Sell Section -->
            <div class="mt-auto pt-6 border-t border-white/10 flex items-center justify-between shrink-0">
                <div class="flex flex-col">
                    <span class="text-xs text-gray-400 font-bold tracking-widest uppercase">Quick Sell Value</span>
                    <div class="flex items-center gap-2 text-field-accent">
                         <span class="material-icons-outlined text-xl">monetization_on</span>
                         <span class="text-2xl font-black font-mono">{{ sellPrice.toLocaleString() }}</span>
                    </div>
                </div>

                <!-- Confirmation UI -->
                <div v-if="confirmingSell" class="flex items-center gap-3 animate-fade-in">
                    <span class="text-xs text-red-500 font-bold uppercase mr-2">Are you sure?</span>
                    <button 
                        @click="confirmingSell = false"
                        class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-bold text-sm">
                        CANCEL
                    </button>
                    <button 
                        @click="executeSell"
                        :disabled="selling"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-bold text-sm flex items-center gap-2">
                        <span v-if="selling" class="animate-spin material-icons-outlined text-sm">refresh</span>
                        CONFIRM
                    </button>
                </div>

                <!-- Default Sell Button -->
                <button 
                    v-else
                    @click="confirmingSell = true" 
                    class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-red-900/50 flex items-center gap-2">
                    <span class="material-icons-outlined">delete</span>
                    <span>SELL PLAYER</span>
                </button>
            </div>

        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps(['card']);
const emit = defineEmits(['close', 'sold']);

const activeTab = ref('overview');

// Generate Radar Chart Points dynamically based on stats
// Card data has stats as top-level properties, not nested
const radarPoints = computed(() => {
    const c = props.card || {};
    // Normalize stats 0-100 to chart radius 0-40 (center is 50,50)
    const center = 50;
    const maxR = 40;
    
    const getPoint = (val, angleDeg) => {
        const r = (val || 50) / 100 * maxR;
        const rad = (angleDeg - 90) * Math.PI / 180;
        return `${center + r * Math.cos(rad)},${center + r * Math.sin(rad)}`;
    };

    // Access stats directly from card object
    const p1 = getPoint(c.power || c.pace || c.pac || 50, 0);   // Top (POW)
    const p2 = getPoint(c.shoot || c.sho || 50, 90);            // Right (SHO)
    const p3 = getPoint(c.pass || c.pas || 50, 180);            // Bottom (PAS)
    const p4 = getPoint(c.tackle || c.def || 50, 270);          // Left (DEF)

    return `${p1} ${p2} ${p3} ${p4}`;
});

const mockMatches = [
    { id: 1, opponent: 'Arsenal', score: '3-1', date: '2 DAYS AGO' },
    { id: 2, opponent: 'Real Madrid', score: '1-1', date: '5 DAYS AGO' },
    { id: 3, opponent: 'Liverpool', score: '2-2', date: '1 WEEK AGO' },
];

const mockHistory = [40, 60, 55, 80, 95];

import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();
const selling = ref(false);
const confirmingSell = ref(false);

const sellPrice = computed(() => {
    if (!props.card) return 0;
    const rating = props.card.overallRating || 0;
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
});

const executeSell = async () => {
    selling.value = true;
    try {
        const res = await fetch('/api/sell-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify({ cardId: props.card.id })
        });

        if (res.ok) {
            const data = await res.json();
            emit('sold', { cardId: props.card.id, price: sellPrice.value });
            emit('close'); 
        } else {
            const err = await res.json();
            alert('Failed to sell: ' + (err.error || 'Unknown error'));
        }
    } catch (e) {
        console.error('Sell error:', e);
        alert('Error selling player');
    } finally {
        selling.value = false;
        confirmingSell.value = false;
    }
};
</script>

<style scoped>
.mask-image-gradient {
    -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}
.drop-shadow-glow {
    filter: drop-shadow(0 0 5px #caf646);
}
</style>
