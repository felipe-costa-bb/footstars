<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/" class="text-field-accent hover:text-field-accent/80 mb-4 inline-block">
          ← Back to Home
        </router-link>
        <h1 class="text-4xl font-bold text-white mb-2">Join a Game</h1>
        <p class="text-gray-400">Enter the session ID and choose your team</p>
      </div>

      <!-- Join Form -->
      <div class="max-w-md mx-auto bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div class="mb-6">
          <label class="block text-gray-300 mb-2 font-semibold">Session ID</label>
          <input
            v-model="sessionId"
            type="text"
            placeholder="e.g., ABC123"
            maxlength="10"
            class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-field-accent uppercase text-center text-lg tracking-wider"
          />
          <p class="text-gray-500 text-sm mt-2">Ask your friend for the session ID</p>
        </div>

        <div class="mb-6">
          <label class="block text-gray-300 mb-2 font-semibold">Your Name</label>
          <input
            v-model="playerName"
            type="text"
            placeholder="Enter your name"
            class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-field-accent"
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-300 mb-2 font-semibold">Select Your Team</label>
          <select
            v-model="selectedTeam"
            class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-field-accent"
          >
            <option value="">-- Choose Team --</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>

        <button
          @click="joinGame"
          :disabled="!sessionId || !playerName || !selectedTeam || loading"
          class="w-full bg-field-accent hover:bg-field-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition"
        >
          <span v-if="!loading">Join Game</span>
          <span v-else>Joining...</span>
        </button>

        <div v-if="error" class="mt-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-400">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { useWebSocket } from '../composables/useWebSocket'

const router = useRouter()
const sessionStore = useSessionStore()
const { send } = useWebSocket()

const sessionId = ref('')
const playerName = ref('')
const selectedTeam = ref('')
const loading = ref(false)
const error = ref('')
const teams = ref([])

onMounted(async () => {
  // Fetch teams
  try {
    const response = await fetch('/api/teams')
    teams.value = await response.json()
  } catch (err) {
    console.error('Failed to load teams:', err)
  }
})

const joinGame = () => {
  if (!sessionId.value) {
    error.value = 'Please enter session ID'
    return
  }

  if (!playerName.value) {
    error.value = 'Please enter your name'
    return
  }

  if (!selectedTeam.value) {
    error.value = 'Please select a team'
    return
  }

  loading.value = true
  error.value = ''

  // Send join_session message
  send('join_session', {
    sessionId: sessionId.value.toUpperCase(),
    name: playerName.value,
    teamId: selectedTeam.value
  })

  // Wait for response
  setTimeout(() => {
    sessionStore.setSession(sessionId.value.toUpperCase())
    sessionStore.setPlayerInfo(playerName.value, 'B')
    sessionStore.selectTeam(selectedTeam.value)
    
    router.push({
      name: 'Lobby',
      params: { sessionId: sessionId.value.toUpperCase() }
    })
    
    loading.value = false
  }, 500)
}
</script>
