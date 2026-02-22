<template>
  <div>
    <router-view />
    <audio ref="audioPlayer" loop preload="auto">
      <source src="/assets/soundtrack.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useWebSocket } from './composables/useWebSocket'
import { useAudioStore } from './stores/audio'

const { connect, disconnect } = useWebSocket()
const audioStore = useAudioStore()
const audioPlayer = ref(null)

onMounted(() => {
  connect()
  
  // Audio initialization
  if (audioPlayer.value) {
    audioPlayer.value.volume = audioStore.volume;
    
    // Attempt auto-play (might be blocked by browser)
    const promise = audioPlayer.value.play();
    if (promise !== undefined) {
      promise.then(() => {
        audioStore.setPlaying(true);
        audioStore.enableSound(); // If auto-play works, we consider sound enabled
      }).catch(error => {
        // Auto-play was prevented.
        // We wait for user interaction to enable sound.
        console.log("Autoplay prevented. Waiting for user interaction.");
        audioStore.setPlaying(false);
      });
    }
  }
  
  // Global click listener to unlock audio if needed
  window.addEventListener('click', handleFirstInteraction, { once: true });
})

const handleFirstInteraction = () => {
    if (!audioStore.soundEnabled && audioPlayer.value) {
        audioStore.enableSound();
        if (!audioStore.isMuted) {
            audioPlayer.value.play().then(() => {
                audioStore.setPlaying(true);
            }).catch(e => console.error("Audio play failed on interaction", e));
        }
    }
}

// Watchers for store state
watch(() => audioStore.isMuted, (newVal) => {
    if (audioPlayer.value) {
        audioPlayer.value.muted = newVal;
        if (!newVal && audioStore.soundEnabled) {
             const promise = audioPlayer.value.play();
             if (promise) promise.catch(e => console.error(e));
             audioStore.setPlaying(true);
        }
    }
});

watch(() => audioStore.volume, (newVal) => {
    if (audioPlayer.value) {
        audioPlayer.value.volume = newVal;
    }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  disconnect()
  window.removeEventListener('click', handleFirstInteraction);
})
</script>
