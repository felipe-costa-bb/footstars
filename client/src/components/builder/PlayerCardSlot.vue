<template>
  <div class="relative w-full h-full flex flex-col items-center justify-center group">
    <!-- Empty Slot -->
    <div 
      v-if="!player"
      class="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center transition-all group-hover:bg-white/20 group-hover:border-white/50 cursor-pointer"
    >
      <span class="text-white/50 text-xs font-bold">{{ type }}</span>
    </div>

    <!-- Filled Slot - Shield Card -->
    <div 
      v-else
      class="relative w-24 h-32 cursor-pointer transform hover:scale-110 transition-all duration-200"
    >
      <!-- Remove Button (Hover) -->
      <button 
        @click.stop="$emit('remove')"
        class="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md border border-white"
        title="Remove"
      >
        ×
      </button>

      <!-- Captain Badge -->
      <button 
        @click.stop="$emit('toggleCaptain')"
        class="absolute -top-2 -left-2 w-8 h-8 flex items-center justify-center rounded-lg shadow-md border border-yellow-200 z-30 transition-all duration-200"
        :class="isCaptain ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-black scale-100 opacity-100 ring-2 ring-yellow-400/50' : 'bg-black/40 text-white/50 hover:bg-black/60 opacity-0 group-hover:opacity-100 border-white/20'"
        title="Toggle Captain"
      >
        <span v-if="isCaptain" class="font-bold text-sm">C</span>
        <span v-else class="text-xs">C</span>
      </button>

      <!-- Kit Number Editor -->
      <button 
        @click.stop="$emit('editKit')"
        class="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full shadow-md z-30 transition-all duration-200 border border-white/20 bg-blue-900/80 text-white hover:bg-blue-600"
        title="Edit Kit Number"
      >
        <span class="text-xs font-bold font-mono">{{ kitNumber || '#' }}</span>
      </button>

      <!-- Player Card Component -->
      <PlayerCard 
        :name="player.name || player.real_name"
        :rating="displayRating"
        :position="player.position"
        :imageUrl="player.imageUrl"
        :team="player.team"
        :nationality="player.nationality"
        :league="player.league"
        :rarity="cardRarity"
        noHover
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PlayerCard from '../PlayerCard.vue';

const props = defineProps({
  player: Object,
  type: String,
  isCaptain: Boolean,
  kitNumber: [Number, String]
});

defineEmits(['remove', 'toggleCaptain', 'editKit']);

// Calculate effective rating based on position
const displayRating = computed(() => {
  if (!props.player) return 0;
  // If player has ratings map and we have a valid position type, use it
  if (props.player.ratings && props.player.ratings[props.type]) {
    return props.player.ratings[props.type];
  }
  return props.player.overallRating || 0;
});

// Rarity calculation based on the EFFECTIVE rating in this position
const cardRarity = computed(() => {
  const rating = displayRating.value;
  if (rating >= 85) return 'gold-rare';
  if (rating >= 76) return 'gold';
  if (rating >= 69) return 'silver-rare';
  if (rating >= 59) return 'silver';
  if (rating >= 54) return 'bronze-rare';
  return 'bronze';
});
</script>
