<template>
  <button 
    class="w-full flex flex-col items-center group relative py-3 my-1 transition-all duration-300"
    :class="active ? 'text-pitch-green' : 'text-gray-500 hover:text-gray-300'"
  >
    <!-- Active Indicator -->
    <div v-if="active" class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-pitch-green rounded-r shadow-[0_0_15px_#00ff41]"></div>

    <!-- Icon Container -->
    <div 
      class="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg backdrop-blur-sm"
      :class="active ? 'bg-pitch-green/20 text-pitch-green shadow-[0_0_20px_rgba(0,255,65,0.3)]' : 'bg-white/5 group-hover:bg-white/10'"
    >
      <span class="material-icons-outlined text-2xl transition-transform duration-300 group-hover:rotate-6">{{ icon }}</span> 
    </div>

    <span 
      class="text-[10px] font-display uppercase tracking-[0.2em] font-medium transition-all duration-300"
      :class="active ? 'text-pitch-green opacity-100' : 'opacity-70 group-hover:opacity-100'"
    >
      {{ label }}
    </span>
  </button>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  active: Boolean
});
</script>
