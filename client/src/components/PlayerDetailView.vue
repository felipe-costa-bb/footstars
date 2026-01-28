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
              class="relative z-10 w-full h-full object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] mask-image-gradient"
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
        <div class="lg:w-1/2 flex flex-col gap-8 h-full overflow-y-auto pr-4 scrollbar-hide py-8">
            
            <!-- Radar Chart Section -->
            <div class="bg-white/5 rounded-3xl p-6 border border-white/10 relative overflow-hidden">
                <h3 class="text-field-accent uppercase tracking-widest text-sm font-bold mb-4">Skill Analysis</h3>
                <div class="flex justify-center relative h-64 w-full">
                    <!-- Simple SVG Radar Chart -->
                    <svg viewBox="0 0 100 100" class="h-full w-auto overflow-visible">
                        <!-- Background Pentagons -->
                        <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
                        <polygon points="50,25 70,40 62,65 38,65 30,40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
                        
                        <!-- Data Shape -->
                        <polygon :points="radarPoints" fill="rgba(202, 246, 70, 0.2)" stroke="#caf646" stroke-width="1.5" class="drop-shadow-glow" />
                        
                        <!-- Labels -->
                        <text x="50" y="5" text-anchor="middle" fill="#ccc" font-size="4">PAC</text>
                        <text x="95" y="40" text-anchor="middle" fill="#ccc" font-size="4">SHO</text>
                        <text x="75" y="98" text-anchor="middle" fill="#ccc" font-size="4">PAS</text>
                        <text x="25" y="98" text-anchor="middle" fill="#ccc" font-size="4">DEF</text>
                        <text x="5" y="40" text-anchor="middle" fill="#ccc" font-size="4">PHY</text>
                    </svg>
                </div>
            </div>

            <!-- Matches Played List -->
            <div class="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h3 class="text-field-accent uppercase tracking-widest text-sm font-bold mb-4">Recent Performance</h3>
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
            <div class="bg-white/5 rounded-3xl p-6 border border-white/10">
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
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['card']);
const emit = defineEmits(['close']);

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
    const p1 = getPoint(c.power || c.pace || c.pac || 50, 0);   // Top (PAC)
    const p2 = getPoint(c.shoot || c.sho || 50, 72);            // Right Top (SHO)
    const p3 = getPoint(c.pass || c.pas || 50, 144);            // Right Bot (PAS)
    const p4 = getPoint(c.tackle || c.def || 50, 216);          // Left Bot (DEF)
    const p5 = getPoint(c.physical || c.phy || 70, 288);        // Left Top (PHY)

    return `${p1} ${p2} ${p3} ${p4} ${p5}`;
});

const mockMatches = [
    { id: 1, opponent: 'Arsenal', score: '3-1', date: '2 DAYS AGO' },
    { id: 2, opponent: 'Real Madrid', score: '1-1', date: '5 DAYS AGO' },
    { id: 3, opponent: 'Liverpool', score: '2-2', date: '1 WEEK AGO' },
];

const mockHistory = [40, 60, 55, 80, 95];
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
