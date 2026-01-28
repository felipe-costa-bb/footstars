<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-display font-bold text-white">SELECT PASS TARGET</h2>
        <p class="text-gray-400 text-sm">Choose a teammate to receive the ball</p>
      </div>

      <!-- Player Grid -->
      <div class="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
        <div 
          v-for="player in availablePlayers" 
          :key="player.id"
          @click="selectPlayer(player)"
          class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 p-4 cursor-pointer transition-all hover:scale-105"
          :class="getPlayerStyle(player)"
        >
          <!-- Player Avatar -->
          <div class="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-700 border-2 border-white/20">
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

          <!-- Pass Stat -->
          <div class="mt-3 flex items-center justify-center gap-2">
            <span class="text-gray-400 text-xs">PASS</span>
            <div class="bg-black/30 px-2 py-1 rounded">
              <span class="text-field-accent font-bold text-sm">{{ player.pass || player.attributes?.pass || 75 }}</span>
            </div>
          </div>

          <!-- Direction Indicator -->
          <div class="mt-2 text-center text-xs font-bold" :class="getDirectionColor(player)">
            {{ getPassDirection(player) }}
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
  currentPlayerId: { type: [String, Number], default: null },
  currentZone: { type: Number, default: 1 }
});

const emit = defineEmits(['select', 'cancel']);

// Filter out current ball holder from available targets
const availablePlayers = computed(() => {
  return props.players.filter(p => p.id !== props.currentPlayerId);
});

const selectPlayer = (player) => {
  emit('select', player);
};

const getPlayerZone = (player) => {
  const pos = player.position;
  if (pos === 'GK') return 0;
  if (['DF', 'CB', 'LB', 'RB'].includes(pos)) return 1;
  if (['MF', 'CM', 'LM', 'RM'].includes(pos)) return 2;
  if (['FW', 'ST', 'LW', 'RW'].includes(pos)) return 3;
  return 2;
};

const getPassDirection = (player) => {
  const targetZone = getPlayerZone(player);
  if (targetZone > props.currentZone) return '↗ FORWARD';
  if (targetZone < props.currentZone) return '↙ BACKWARD';
  return '→ LATERAL';
};

const getDirectionColor = (player) => {
  const targetZone = getPlayerZone(player);
  if (targetZone > props.currentZone) return 'text-green-400';
  if (targetZone < props.currentZone) return 'text-yellow-400';
  return 'text-blue-400';
};

const getPlayerStyle = (player) => {
  const targetZone = getPlayerZone(player);
  if (targetZone > props.currentZone) {
    return 'border-green-500/50 hover:border-green-400';
  } else if (targetZone < props.currentZone) {
    return 'border-yellow-500/50 hover:border-yellow-400';
  }
  return 'border-blue-500/50 hover:border-blue-400';
};

const getPositionColor = (position) => {
  if (position === 'GK') return 'text-yellow-400';
  if (['DF', 'CB', 'LB', 'RB'].includes(position)) return 'text-blue-400';
  if (['MF', 'CM', 'LM', 'RM'].includes(position)) return 'text-green-400';
  if (['FW', 'ST', 'LW', 'RW'].includes(position)) return 'text-red-400';
  return 'text-gray-400';
};
</script>
