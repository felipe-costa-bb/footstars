<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="text-center">
      
      <!-- Dice Container -->
      <div class="flex justify-center gap-8 mb-8">
        <!-- Dice 1 -->
        <div 
          class="w-24 h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-gray-200"
          :class="{ 'animate-bounce': rolling }"
        >
          <span class="text-5xl font-black text-gray-800">{{ displayDice1 }}</span>
        </div>
        
        <!-- Dice 2 -->
        <div 
          class="w-24 h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-gray-200"
          :class="{ 'animate-bounce': rolling, 'delay-75': true }"
        >
          <span class="text-5xl font-black text-gray-800">{{ displayDice2 }}</span>
        </div>
      </div>
      
      <!-- Roll Info -->
      <div v-if="!rolling" class="space-y-2">
        <div class="text-gray-400">Base Roll</div>
        <div class="text-6xl font-black text-white">{{ dice1 + dice2 }}</div>
        
        <!-- Modifier -->
        <div v-if="modifier !== 0" class="text-2xl">
          <span :class="modifier > 0 ? 'text-green-400' : 'text-red-400'">
            {{ modifier > 0 ? '+' : '' }}{{ modifier }}
          </span>
          <span class="text-gray-500 text-sm ml-2">{{ modifierLabel }}</span>
        </div>
        
        <!-- Total -->
        <div class="mt-4 pt-4 border-t border-white/20">
          <div class="text-gray-400 text-sm">TOTAL</div>
          <div class="text-7xl font-black" :class="isSuccess ? 'text-green-400' : 'text-red-400'">
            {{ total }}
          </div>
        </div>
      </div>
      
      <div v-else class="text-white text-xl animate-pulse">
        Rolling...
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
  targetValue: { type: Number, default: 0 }
});

const emit = defineEmits(['complete']);

const rolling = ref(true);
const displayDice1 = ref(1);
const displayDice2 = ref(1);

const total = computed(() => props.dice1 + props.dice2 + props.modifier);
const isSuccess = computed(() => total.value >= props.targetValue);

// Animation
onMounted(() => {
  let rollCount = 0;
  const maxRolls = 15;
  
  const rollInterval = setInterval(() => {
    displayDice1.value = Math.floor(Math.random() * 6) + 1;
    displayDice2.value = Math.floor(Math.random() * 6) + 1;
    rollCount++;
    
    if (rollCount >= maxRolls) {
      clearInterval(rollInterval);
      displayDice1.value = props.dice1;
      displayDice2.value = props.dice2;
      rolling.value = false;
      
      // Emit complete after showing result
      setTimeout(() => emit('complete'), 1500);
    }
  }, 100);
});
</script>

<style scoped>
.delay-75 {
  animation-delay: 75ms;
}
</style>
