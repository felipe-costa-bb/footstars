<template>
  <div class="absolute top-6 left-6 flex items-center shadow-2xl z-50 animate-slide-down">
    <!-- Team A -->
    <div class="bg-gradient-to-b from-blue-900 to-blue-800 text-white px-4 py-2 rounded-l-lg border-r border-blue-600 flex items-center gap-3 w-32 justify-end">
      <span class="font-display font-bold text-lg uppercase">{{ teamA }}</span>
      <div class="w-2 h-8 bg-blue-500 transform skew-x-[-20deg]"></div>
    </div>

    <!-- Score -->
    <div class="bg-white text-black px-5 py-2 font-display font-bold text-2xl border-x-2 border-gray-300 min-w-[80px] text-center shadow-inner">
      {{ scoreA }} - {{ scoreB }}
    </div>

    <!-- Team B -->
    <div class="bg-gradient-to-b from-red-900 to-red-800 text-white px-4 py-2 rounded-r-lg border-l border-red-600 flex items-center gap-3 w-32 justify-start">
      <div class="w-2 h-8 bg-red-500 transform skew-x-[-20deg]"></div>
      <span class="font-display font-bold text-lg uppercase">{{ teamB }}</span>
    </div>

    <!-- Timer (Floating below) -->
    <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-0.5 rounded text-xs font-mono border border-white/20">
      {{ time }}"
    </div>
  </div>
</template>

<script setup>
defineProps({
  teamA: { type: String, default: 'HOME' },
  teamB: { type: String, default: 'AWAY' },
  scoreA: { type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },
  time: { type: String, default: '00:00' }
});
</script>
