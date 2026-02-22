<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-display font-bold text-red-400">SELECT DEFENDER</h2>
        <p class="text-gray-400 text-sm">Choose a player to intercept the pass</p>
      </div>

      <!-- Player Grid -->
      <div class="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
        <div 
          v-for="player in availablePlayers" 
          :key="player.id"
          @click="selectPlayer(player)"
          class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 p-4 cursor-pointer transition-all hover:scale-105 border-red-500/50 hover:border-red-400"
        >
          <!-- Player Avatar -->
          <div class="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-700 border-2 border-red-500/30">
            <img 
              :src="player.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`" 
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Player Info -->
          <div class="text-center">
            <div class="text-white font-bold text-sm truncate">{{ player.name }}</div>
            <div class="text-xs font-bold mt-1" :class="getPositionColor(player.position)">
              {{ player.position }}
            </div>
          </div>

          <!-- Tackle Stat -->
          <div class="mt-3 flex items-center justify-center gap-2">
            <span class="text-gray-400 text-xs">TACKLE</span>
            <div class="bg-black/30 px-2 py-1 rounded">
              <span class="text-red-400 font-bold text-sm">{{ player.tackle || player.attributes?.tackle || 75 }}</span>
            </div>
          </div>

          <!-- Zone Indicator -->
          <div class="mt-2 text-center text-xs font-bold text-gray-500">
            {{ getZoneName(player) }}
          </div>
        </div>
      </div>

      <!-- Cancel Button -->
      <div class="mt-4 text-center">
        <button 
          @click="$emit('cancel')"
          class="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  players: { type: Array, required: true },
  targetZone: { type: Number, default: 2 }
});

const emit = defineEmits(['select', 'cancel']);

// Filter available defenders (exclude GK for interceptions, show field players)
const availablePlayers = computed(() => {
  return props.players.filter(p => p.position !== 'GK');
});

const selectPlayer = (player) => {
  emit('select', player);
};

const getPlayerZone = (player) => {
  const pos = player.position;
  if (pos === 'GK') return 0;
  if (['DF', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'WB'].includes(pos)) return 1;
  if (['MF', 'CM', 'LM', 'RM', 'CDM', 'CAM'].includes(pos)) return 2;
  if (['FW', 'ST', 'LW', 'RW', 'CF'].includes(pos)) return 3;
  return 2;
};

const getZoneName = (player) => {
  const zone = getPlayerZone(player);
  switch(zone) {
    case 0: return 'GOALKEEPER';
    case 1: return 'DEFENSE';
    case 2: return 'MIDFIELD';
    case 3: return 'ATTACK';
    default: return 'FIELD';
  }
};

const getPositionColor = (position) => {
  if (position === 'GK') return 'text-yellow-400';
  if (['DF', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'WB'].includes(position)) return 'text-blue-400';
  if (['MF', 'CM', 'LM', 'RM', 'CDM', 'CAM'].includes(position)) return 'text-green-400';
  if (['FW', 'ST', 'LW', 'RW', 'CF'].includes(position)) return 'text-red-400';
  return 'text-gray-400';
};
</script>
