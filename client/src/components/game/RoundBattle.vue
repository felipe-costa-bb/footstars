<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="w-full max-w-4xl px-4">
      
      <!-- Battle Header -->
      <div class="text-center mb-6">
        <div class="text-yellow-400 text-xl font-bold tracking-wider mb-1">
          {{ actionType === 'SHOOT' ? '⚽ SHOOTING ATTEMPT' : '📤 PASSING' }}
        </div>
        <div class="text-gray-400 text-sm">{{ actionType === 'SHOOT' ? 'Shooter vs Goalkeeper' : 'Passer vs Defender' }}</div>
      </div>
      
      <!-- Cards Battle -->
      <div class="flex items-center justify-center gap-8">
        
        <!-- Attacker Card -->
        <div class="transform -rotate-3 hover:rotate-0 transition-transform">
          <div class="w-48 h-64 bg-gradient-to-b from-green-600 to-green-800 rounded-xl border-4 border-green-400 shadow-2xl overflow-hidden relative">
            <!-- Card Header -->
            <div class="bg-black/30 px-3 py-2 text-center">
              <div class="text-green-300 text-xs font-bold">{{ attackerTeam }}</div>
            </div>
            
            <!-- Avatar -->
            <div class="w-20 h-20 mx-auto mt-2 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${attacker.id}`" class="w-full h-full" />
            </div>
            
            <!-- Name -->
            <div class="text-center mt-2 px-2">
              <div class="text-white font-bold text-sm truncate">{{ attacker.name }}</div>
              <div class="text-green-300 text-xs">{{ attacker.position }}</div>
            </div>
            
            <!-- Stat -->
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 py-3 text-center">
              <div class="text-gray-400 text-xs">{{ statLabel }}</div>
              <div class="text-4xl font-bold text-white">{{ attackerStat }}</div>
            </div>
          </div>
        </div>
        
        <!-- VS Badge -->
        <div class="flex flex-col items-center">
          <div class="text-5xl font-black text-red-500 animate-pulse">VS</div>
        </div>
        
        <!-- Defender Card -->
        <div class="transform rotate-3 hover:rotate-0 transition-transform">
          <div class="w-48 h-64 bg-gradient-to-b from-red-600 to-red-800 rounded-xl border-4 border-red-400 shadow-2xl overflow-hidden relative">
            <!-- Card Header -->
            <div class="bg-black/30 px-3 py-2 text-center">
              <div class="text-red-300 text-xs font-bold">{{ defenderTeam }}</div>
            </div>
            
            <!-- Avatar -->
            <div class="w-20 h-20 mx-auto mt-2 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
              <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${defender.id}`" class="w-full h-full" />
            </div>
            
            <!-- Name -->
            <div class="text-center mt-2 px-2">
              <div class="text-white font-bold text-sm truncate">{{ defender.name }}</div>
              <div class="text-red-300 text-xs">{{ defender.position }}</div>
            </div>
            
            <!-- Stat -->
            <div class="absolute bottom-0 left-0 right-0 bg-black/50 py-3 text-center">
              <div class="text-gray-400 text-xs">{{ defenderStatLabel }}</div>
              <div class="text-4xl font-bold text-white">{{ defenderStat }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Continue Hint -->
      <div class="text-center mt-8 text-gray-500 text-sm animate-pulse">
        Rolling dice...
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  attacker: { type: Object, required: true },
  defender: { type: Object, required: true },
  attackerTeam: { type: String, default: 'HOME' },
  defenderTeam: { type: String, default: 'AWAY' },
  actionType: { type: String, default: 'PASS' } // PASS or SHOOT
});

const statLabel = computed(() => props.actionType === 'SHOOT' ? 'SHOOT' : 'PASS');
const defenderStatLabel = computed(() => props.actionType === 'SHOOT' ? 'POWER' : 'TACKLE');

const attackerStat = computed(() => {
  if (props.actionType === 'SHOOT') {
    return props.attacker.attributes?.shoot || 75;
  }
  return props.attacker.attributes?.pass || 75;
});

const defenderStat = computed(() => {
  if (props.actionType === 'SHOOT') {
    return props.defender.attributes?.power || 75;
  }
  return props.defender.attributes?.tackle || 75;
});
</script>
