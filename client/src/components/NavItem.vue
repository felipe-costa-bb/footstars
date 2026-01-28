<template>
  <button 
    class="w-full flex flex-col items-center group relative py-2"
    :class="active ? 'text-pitch-green' : 'text-gray-400 hover:text-white'"
  >
    <!-- Active Indicator -->
    <div v-if="active" class="absolute left-0 top-0 bottom-0 w-1 bg-pitch-green rounded-r shadow-[0_0_10px_#00ff41]"></div>

    <!-- Icon Placeholder (using simple svg or text for now) -->
    <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors mb-1">
      <!-- Use specific SVGs based on 'icon' prop here later -->
       <span class="material-icons-outlined text-xl">{{ icon }}</span> 
       <!-- Fallback Text Icon -->
       <span class="font-bold text-lg leading-none">{{ icon[0].toUpperCase() }}</span>
    </div>

    <span class="text-[10px] font-sports font-bold tracking-widest">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  active: Boolean
});
</script>
