<template>
  <div class="relative w-full h-full flex flex-col items-center justify-center group">
    <!-- Empty Slot -->
    <div 
      v-if="!player"
      class="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center transition-all group-hover:bg-white/20 group-hover:border-white/50 cursor-pointer"
    >
      <span class="text-white/50 text-xs font-bold">{{ type }}</span>
    </div>

    <!-- Filled Slot -->
    <div 
      v-else
      class="relative w-14 h-14 cursor-pointer transform hover:scale-110 transition-all duration-200"
    >
      <!-- Remove Button (Hover) -->
      <button 
        @click.stop="$emit('remove')"
        class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md border border-white"
      >
        ×
      </button>

      <!-- Token -->
      <div 
        class="w-full h-full rounded-full border-2 border-white/90 shadow-xl overflow-hidden bg-gradient-to-b from-gray-700 to-gray-900 relative"
      >
        <img :src="player.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.playerId}`" class="w-full h-full object-cover" />
      </div>

      <!-- Info Tag -->
      <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap border border-white/20 shadow-sm z-10 w-20 text-center truncate">
        {{ player.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  player: Object,
  type: String
});

defineEmits(['remove']);
</script>
