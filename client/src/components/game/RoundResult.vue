<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="text-center max-w-md">
      
      <!-- Result Icon -->
      <div class="text-8xl mb-4" :class="resultAnimation">
        {{ resultIcon }}
      </div>
      
      <!-- Result Text -->
      <div class="text-4xl font-black mb-2" :class="resultColor">
        {{ resultTitle }}
      </div>
      
      <div class="text-gray-400 text-lg mb-8">
        {{ resultDescription }}
      </div>
      
      <!-- Score Update (for goals) -->
      <div v-if="outcome === 'GOAL'" class="bg-green-500/20 border border-green-500 rounded-xl p-4 mb-6">
        <div class="text-green-400 text-2xl font-bold">
          {{ attackerTeam }} {{ scoreA }} - {{ scoreB }} {{ defenderTeam }}
        </div>
      </div>
      
      <!-- Continue Button -->
      <button 
        @click="$emit('continue')"
        class="px-12 py-4 bg-white text-black font-bold text-xl rounded-lg hover:bg-gray-200 transition-all transform hover:scale-105"
      >
        CONTINUE
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  outcome: { type: String, required: true }, // 'SUCCESS', 'INTERCEPT', 'GOAL', 'SAVE'
  attackerTeam: { type: String, default: 'HOME' },
  defenderTeam: { type: String, default: 'AWAY' },
  scoreA: { type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },
  passTarget: { type: String, default: '' }
});

defineEmits(['continue']);

const resultIcon = computed(() => {
  switch (props.outcome) {
    case 'GOAL': return '⚽🎉';
    case 'SAVE': return '🧤';
    case 'SUCCESS': return '✅';
    case 'INTERCEPT': return '🚫';
    default: return '❓';
  }
});

const resultTitle = computed(() => {
  switch (props.outcome) {
    case 'GOAL': return 'GOOOAL!';
    case 'SAVE': return 'SAVED!';
    case 'SUCCESS': return 'PASS COMPLETE!';
    case 'INTERCEPT': return 'INTERCEPTED!';
    default: return 'RESULT';
  }
});

const resultDescription = computed(() => {
  switch (props.outcome) {
    case 'GOAL': return 'The ball flies into the net!';
    case 'SAVE': return 'Goalkeeper makes a brilliant save!';
    case 'SUCCESS': return props.passTarget ? `Ball goes to ${props.passTarget}!` : 'Ball advances to the next zone.';
    case 'INTERCEPT': return 'Possession changes hands!';
    default: return '';
  }
});

const resultColor = computed(() => {
  if (props.outcome === 'GOAL' || props.outcome === 'SUCCESS') {
    return 'text-green-400';
  }
  return 'text-red-400';
});

const resultAnimation = computed(() => {
  if (props.outcome === 'GOAL') {
    return 'animate-bounce';
  }
  return 'animate-pulse';
});
</script>
