<template>
  <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
    <div class="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/20 p-4 flex items-center gap-4">
      
      <!-- Current Zone Info -->
      <div class="text-center px-4 border-r border-white/20">
        <div class="text-gray-400 text-xs">ZONE</div>
        <div class="text-white font-bold">{{ zoneName }}</div>
      </div>
      
      <!-- Ball Holder Info -->
      <div class="text-center px-4 border-r border-white/20">
        <div class="text-gray-400 text-xs">BALL HOLDER</div>
        <div class="text-green-400 font-bold truncate max-w-[100px]">{{ ballHolder }}</div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex gap-3">
        <!-- PASS Button -->
        <button 
          @click="$emit('action', 'PASS')"
          class="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <span class="text-xl">📤</span>
          PASS
        </button>
        
        <!-- SHOOT Button -->
        <button 
          @click="$emit('action', 'SHOOT')"
          :disabled="!canShoot"
          :class="canShoot 
            ? 'bg-red-600 hover:bg-red-500 text-white' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'"
          class="px-8 py-3 font-bold rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 disabled:hover:scale-100"
        >
          <span class="text-xl">⚽</span>
          SHOOT
        </button>
      </div>
      
    </div>
    
    <!-- Hint -->
    <div v-if="!canShoot" class="text-center text-gray-500 text-xs mt-2">
      Move to Attack zone to shoot
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  zone: { type: Number, required: true }, // 0=GK, 1=DEF, 2=MID, 3=ATT
  ballHolder: { type: String, default: 'Player' }
});

defineEmits(['action']);

const zoneName = computed(() => {
  const zones = ['GOALKEEPER', 'DEFENSE', 'MIDFIELD', 'ATTACK'];
  return zones[props.zone] || 'UNKNOWN';
});

const canShoot = computed(() => props.zone >= 3);
</script>
