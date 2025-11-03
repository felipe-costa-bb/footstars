<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useWebSocket } from './composables/useWebSocket'

const { connect, disconnect } = useWebSocket()

onMounted(() => {
  connect()
})

// Cleanup on unmount
onBeforeUnmount(() => {
  disconnect()
})
</script>
