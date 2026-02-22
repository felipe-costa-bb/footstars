
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAudioStore = defineStore('audio', () => {
    const isPlaying = ref(false);
    const isMuted = ref(false);
    const volume = ref(0.5);
    const soundEnabled = ref(false); // Master switch for user intent

    function toggleMute() {
        isMuted.value = !isMuted.value;
    }

    function setVolume(val) {
        volume.value = val;
    }

    function setPlaying(val) {
        isPlaying.value = val;
    }

    function enableSound() {
        soundEnabled.value = true;
        isMuted.value = false;
    }

    return {
        isPlaying,
        isMuted,
        volume,
        soundEnabled,
        toggleMute,
        setVolume,
        setPlaying,
        enableSound
    };
});
