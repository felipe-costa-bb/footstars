<template>
  <div 
    class="absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out cursor-pointer hover:scale-110 z-20"
    :style="{ top: `${y}%`, left: `${x}%` }"
  >
    <!-- Selection Ring -->
    <div v-if="selected" class="absolute -inset-2 border-2 border-yellow-400 rounded-full animate-pulse"></div>

    <!-- Token Body -->
    <div 
      class="w-full h-full rounded-full border-2 shadow-lg flex items-center justify-center overflow-hidden bg-gradient-to-br relative"
      :class="team === 'A' ? 'from-blue-500 to-blue-700 border-white' : 'from-red-500 to-red-700 border-white'"
    >
       <!-- Player Face -->
       <img 
         :src="imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || id}`" 
         class="w-full h-full object-cover" 
         :alt="name"
       />
       
       <!-- Role Badge -->
       <div v-if="role" class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-black text-white text-[8px] flex items-center justify-center font-bold border border-white">
         {{ role[0] }}
       </div>

       <!-- Rating Badge -->
       <div v-if="rating" class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 text-black text-xs flex items-center justify-center font-bold border-2 border-white z-10 shadow-md">
         {{ rating }}
       </div>
    </div>
    
    <!-- Name Tag -->
    <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap font-sports">
      {{ name }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  x: Number,
  y: Number,
  team: String, // 'A' or 'B'
  id: [String, Number],
  number: [String, Number],
  name: String,
  role: String,
  imageUrl: String,
  rating: [Number, String],
  selected: Boolean
});
</script>

