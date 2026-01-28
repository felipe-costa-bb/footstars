<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="text-center w-full max-w-4xl px-4">
      
      <!-- Rolling Animation -->
      <div v-if="rolling" class="space-y-8">
        <div class="flex justify-center gap-8">
          <!-- Dice 1 -->
          <div 
            class="w-24 h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-gray-200 animate-bounce"
          >
            <span class="text-5xl font-black text-gray-800">{{ displayDice1 }}</span>
          </div>
          
          <!-- Dice 2 -->
          <div 
            class="w-24 h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-gray-200 animate-bounce delay-75"
          >
            <span class="text-5xl font-black text-gray-800">{{ displayDice2 }}</span>
          </div>
        </div>
        <div class="text-white text-xl animate-pulse">Rolling...</div>
      </div>
      
      <!-- Result Display with Full Breakdown -->
      <div v-else class="space-y-6">
        
        <!-- VS Header -->
        <div class="flex items-center justify-center gap-4 mb-4">
          <span class="text-green-400 font-bold text-xl">{{ attackerData?.name || 'Attacker' }}</span>
          <span class="text-gray-500 text-2xl font-black">VS</span>
          <span class="text-red-400 font-bold text-xl">{{ defenderData?.name || 'Defender' }}</span>
        </div>
        
        <!-- Breakdown Grid -->
        <div class="grid grid-cols-2 gap-8">
          
          <!-- Attacker Side -->
          <div class="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-2xl border border-green-500/30 p-6">
            <div class="text-green-400 font-bold text-lg mb-4 border-b border-green-500/30 pb-2">
              {{ actionType === 'SHOOT' ? 'SHOOTER' : 'PASSER' }}
            </div>
            
            <div class="space-y-3 text-left">
              <!-- Base Stat -->
              <div class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Base ({{ actionType === 'SHOOT' ? 'SHOOT' : 'PASS' }})</span>
                <span class="text-white font-bold bg-black/30 px-3 py-1 rounded">{{ attackerData?.baseStat || 0 }}</span>
              </div>
              
              <!-- Dice Roll -->
              <div class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Dice Roll</span>
                <span class="text-yellow-400 font-bold bg-black/30 px-3 py-1 rounded">+{{ attackerData?.dice || 0 }}</span>
              </div>
              
              <!-- Fatigue (if any) -->
              <div v-if="attackerData?.fatigue !== 0" class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Fatigue</span>
                <span class="text-red-400 font-bold bg-black/30 px-3 py-1 rounded">{{ attackerData?.fatigue || 0 }}</span>
              </div>
              
              <!-- Super Move (if any) -->
              <div v-if="attackerData?.superMove" class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Super Move</span>
                <span class="text-purple-400 font-bold bg-black/30 px-3 py-1 rounded">+{{ attackerData?.superMove }}</span>
              </div>
              
              <!-- Counter Attack (if any) -->
              <div v-if="attackerData?.counterAttack" class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Counter Attack</span>
                <span class="text-blue-400 font-bold bg-black/30 px-3 py-1 rounded">+{{ attackerData?.counterAttack }}</span>
              </div>
              
              <!-- Total -->
              <div class="flex justify-between items-center border-t border-green-500/30 pt-3 mt-3">
                <span class="text-green-400 font-bold">TOTAL</span>
                <span class="text-green-400 font-black text-2xl">{{ attackerData?.total || 0 }}</span>
              </div>
            </div>
          </div>
          
          <!-- Defender Side -->
          <div class="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-2xl border border-red-500/30 p-6">
            <div class="text-red-400 font-bold text-lg mb-4 border-b border-red-500/30 pb-2">
              {{ actionType === 'SHOOT' ? 'GOALKEEPER' : 'DEFENDER' }}
            </div>
            
            <div class="space-y-3 text-left">
              <!-- Base Stat -->
              <div class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Base ({{ actionType === 'SHOOT' ? 'POWER' : 'TACKLE' }})</span>
                <span class="text-white font-bold bg-black/30 px-3 py-1 rounded">{{ defenderData?.baseStat || 0 }}</span>
              </div>
              
              <!-- Dice Roll -->
              <div class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Dice Roll</span>
                <span class="text-yellow-400 font-bold bg-black/30 px-3 py-1 rounded">+{{ defenderData?.dice || 0 }}</span>
              </div>
              
              <!-- Fatigue (if any) -->
              <div v-if="defenderData?.fatigue !== 0" class="flex justify-between items-center">
                <span class="text-gray-400 text-sm">Fatigue</span>
                <span class="text-red-400 font-bold bg-black/30 px-3 py-1 rounded">{{ defenderData?.fatigue || 0 }}</span>
              </div>
              
              <!-- Total -->
              <div class="flex justify-between items-center border-t border-red-500/30 pt-3 mt-3">
                <span class="text-red-400 font-bold">TOTAL</span>
                <span class="text-red-400 font-black text-2xl">{{ defenderData?.total || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Winner Announcement -->
        <div class="mt-6 p-4 rounded-xl" :class="isSuccess ? 'bg-green-600/30 border border-green-500/50' : 'bg-red-600/30 border border-red-500/50'">
          <div class="text-3xl font-black" :class="isSuccess ? 'text-green-400' : 'text-red-400'">
            {{ isSuccess ? (actionType === 'SHOOT' ? 'GOAL!' : 'PASS COMPLETE!') : (actionType === 'SHOOT' ? 'SAVED!' : 'INTERCEPTED!') }}
          </div>
          <div class="text-gray-400 text-sm mt-1">
            {{ attackerData?.total || 0 }} vs {{ defenderData?.total || 0 }}
            <span v-if="diff !== 0"> ({{ diff > 0 ? '+' : '' }}{{ diff }})</span>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  dice1: { type: Number, required: true },
  dice2: { type: Number, required: true },
  modifier: { type: Number, default: 0 },
  modifierLabel: { type: String, default: '' },
  targetValue: { type: Number, default: 0 },
  // New props for full breakdown
  attackerData: { 
    type: Object, 
    default: () => ({ name: 'Attacker', baseStat: 0, dice: 0, fatigue: 0, superMove: 0, counterAttack: 0, total: 0 })
  },
  defenderData: { 
    type: Object, 
    default: () => ({ name: 'Defender', baseStat: 0, dice: 0, fatigue: 0, superMove: 0, counterAttack: 0, total: 0 })
  },
  actionType: { type: String, default: 'PASS' }
});

const emit = defineEmits(['complete']);

const rolling = ref(true);
const displayDice1 = ref(1);
const displayDice2 = ref(1);

// Calculate based on breakdown data if available, otherwise use legacy props
const attackerTotal = computed(() => props.attackerData?.total || (props.dice1 + props.dice2 + props.modifier));
const defenderTotal = computed(() => props.defenderData?.total || props.targetValue);
const diff = computed(() => attackerTotal.value - defenderTotal.value);
const isSuccess = computed(() => diff.value > 0);

// Animation
onMounted(() => {
  let rollCount = 0;
  const maxRolls = 15;
  
  const rollInterval = setInterval(() => {
    displayDice1.value = Math.floor(Math.random() * 10) + 1;
    displayDice2.value = Math.floor(Math.random() * 10) + 1;
    rollCount++;
    
    if (rollCount >= maxRolls) {
      clearInterval(rollInterval);
      displayDice1.value = props.attackerData?.dice || props.dice1;
      displayDice2.value = props.defenderData?.dice || props.dice2;
      rolling.value = false;
      
      // Emit complete after showing result
      setTimeout(() => emit('complete'), 2500);
    }
  }, 100);
});
</script>

<style scoped>
.delay-75 {
  animation-delay: 75ms;
}
</style>

