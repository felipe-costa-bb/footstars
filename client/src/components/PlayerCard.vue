<template>
  <div class="relative w-full h-full min-h-[220px] group cursor-pointer perspective-1000 font-display">
    <!-- Card Container -->
    <div class="relative w-full h-full duration-500 transform-style-3d group-hover:scale-105 group-hover:-translate-y-2 transition-transform ease-out">
      
      <!-- Glass Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden z-0">
          <!-- Geometric Decoration -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent z-0"></div>
      </div>

      <!-- Rating Circle (Top Left) -->
      <div class="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center z-20 shadow-lg">
          <span class="text-white font-bold text-lg leading-none pt-0.5">{{ rating }}</span>
      </div>

      <!-- Position (Top Right) -->
      <div class="absolute top-4 right-4 text-white/80 font-bold text-xs tracking-widest z-20">
          {{ position }}
      </div>

      <!-- Player Image (Cutout, escaping bounds slightly) -->
      <div class="absolute inset-0 z-10 flex items-end justify-center pb-12">
           <img 
             v-if="imageUrl" 
             :src="imageUrl" 
             alt="Player" 
             class="h-5/6 w-auto object-contain drop-shadow-2xl filter brightness-110 contrast-110 transform transition-transform duration-500 group-hover:scale-110 origin-bottom"
             @error="$event.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`"
           />
           <img 
             v-else 
             :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`" 
             alt="Player" 
             class="w-24 h-24 rounded-full border-2 border-white/20 mb-8" 
           />
      </div>

      <!-- Name & Info (Bottom) -->
      <div class="absolute bottom-0 left-0 right-0 p-3 z-30 flex flex-col items-center">
          <div class="uppercase text-white font-black text-xl tracking-tighter drop-shadow-lg leading-none text-center truncate w-full">{{ name }}</div>
          <div class="text-xs text-gray-300 font-bold tracking-widest uppercase mb-2 opacity-80">{{ team }}</div>

          <!-- Stats Bar (Horizontal) -->
          <div class="w-full h-8 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-between px-3 text-[9px] font-sports text-white/90">
             <div class="flex flex-col items-center">
                 <span class="opacity-50 text-[6px] tracking-wider">PAC</span>
                 <span class="font-bold">{{ stats.pace || stats.pac || 0 }}</span>
             </div>
             <div class="w-px h-3 bg-white/10"></div>
             <div class="flex flex-col items-center">
                 <span class="opacity-50 text-[6px] tracking-wider">SHO</span>
                 <span class="font-bold">{{ stats.shoot || stats.sho || 0 }}</span>
             </div>
             <div class="w-px h-3 bg-white/10"></div>
             <div class="flex flex-col items-center">
                 <span class="opacity-50 text-[6px] tracking-wider">PAS</span>
                 <span class="font-bold">{{ stats.pass || stats.pas || 0 }}</span>
             </div>
             <div class="w-px h-3 bg-white/10"></div>
             <div class="flex flex-col items-center">
                 <span class="opacity-50 text-[6px] tracking-wider">DEF</span>
                 <span class="font-bold">{{ stats.tackle || stats.def || 0 }}</span>
             </div>
          </div>
      </div>

      <!-- Shine/Reflection -->
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-40 rounded-2xl"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  rating: Number,
  position: String,
  imageUrl: String,
  team: String,
  stats: Object,
  rarity: String
});
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
