<template>
  <button 
    class="relative group transition-all duration-200 active:scale-95"
    :class="large ? 'w-32 h-24 -mt-4' : 'w-24 h-20'"
  >
    <!-- Background Shape -->
    <div 
      class="absolute inset-0 transform skew-x-[-10deg] rounded-lg shadow-lg border-b-4 border-black/20 overflow-hidden transition-colors group-hover:brightness-110"
      :class="color"
    >
      <!-- Glossy sheen -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
    </div>

    <!-- Content -->
    <div class="absolute inset-0 flex flex-col items-center justify-center transform skew-x-[-10deg] text-white">
      <span class="material-icons-outlined text-3xl mb-1 drop-shadow-md">{{ icon }}</span>
      <span class="font-display font-bold text-lg tracking-wide drop-shadow-md">{{ label }}</span>
    </div>

    <!-- Active Glow -->
    <div class="absolute inset-0 bg-white/30 blur-xl opacity-0 group-active:opacity-100 transition-opacity rounded-lg"></div>
  </button>
</template>

<script setup>
defineProps({
  label: String,
  icon: String,
  color: String,
  large: Boolean
});
</script>
