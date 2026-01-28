<template>
  <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
    <!-- Pre-Match Actions -->
    <ActionButton 
      v-if="status !== 'PLAYING'"
      label="KICK OFF" 
      icon="sports_soccer" 
      color="bg-green-600" 
      large
      @click="$emit('action', 'START_MATCH')"
    />

    <!-- In-Game Actions -->
    <template v-else>
      <ActionButton 
        label="PASS" 
        icon="sync_alt" 
        color="bg-yellow-500" 
        @click="$emit('action', 'pass')"
      />
      <ActionButton 
        label="SHOOT" 
        icon="sports_soccer" 
        color="bg-blue-600" 
        large 
        @click="$emit('action', 'shoot')"
      />
      <ActionButton 
        label="TACKLE" 
        icon="directions_run" 
        color="bg-red-500" 
        @click="$emit('action', 'tackle')"
      />
    </template>
  </div>
</template>

<script setup>
import ActionButton from './ActionButton.vue';

defineProps({
  status: {
    type: String,
    default: 'IDLE'
  }
});

defineEmits(['action']);
</script>
