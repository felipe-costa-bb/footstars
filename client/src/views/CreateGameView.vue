<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/" class="text-field-accent hover:text-field-accent/80 mb-4 inline-block">
          ← Back to Home
        </router-link>
        <h1 class="text-4xl font-bold text-white mb-2">Create a New Game</h1>
        <p class="text-gray-400">Choose your team and wait for an opponent</p>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Player Info -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold mb-4">Your Info</h2>
          
          <div class="mb-4">
            <label class="block text-gray-300 mb-2">Your Name</label>
            <input
              v-model="playerName"
              type="text"
              placeholder="Enter your name"
              class="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-field-accent"
            />
          </div>

          <button
            @click="createGame"
            :disabled="!playerName || loading"
            class="w-full bg-field-accent hover:bg-field-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition"
          >
            <span v-if="!loading">Create Game</span>
            <span v-else>Creating...</span>
          </button>

          <div v-if="error" class="mt-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-400">
            {{ error }}
          </div>
        </div>

        <!-- Team Selection -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold mb-4">Select Your Team</h2>
          
          <div v-if="teamsLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-field-accent mx-auto"></div>
            <p class="text-gray-400 mt-2">Loading teams...</p>
          </div>

          <div v-else class="space-y-3 max-h-64 overflow-y-auto">
            <div
              v-for="team in teams"
              :key="team.id"
              @click="selectedTeam = team.id"
              class="p-3 rounded border-2 cursor-pointer transition"
              :class="selectedTeam === team.id
                ? 'border-field-accent bg-field-accent/20'
                : 'border-gray-600 bg-gray-700 hover:bg-gray-600'"
            >
              <div class="font-semibold">{{ team.name }}</div>
              <div class="text-sm text-gray-400">{{ team.players.length }} players</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { useTeamsStore } from '../stores/teams'
import { useWebSocket } from '../composables/useWebSocket'

const router = useRouter()
const sessionStore = useSessionStore()
const teamsStore = useTeamsStore()
const { send } = useWebSocket()

const playerName = ref('')
const selectedTeam = ref(null)
const loading = ref(false)
const error = ref('')
const teams = ref([])
const teamsLoading = ref(true)

onMounted(async () => {
  // Fetch teams
  try {
    const response = await fetch('/api/teams')
    teams.value = await response.json()
    if (teams.value.length > 0) {
      selectedTeam.value = teams.value[0].id
    }
  } catch (err) {
    console.error('Failed to load teams:', err)
    error.value = 'Failed to load teams'
  } finally {
    teamsLoading.value = false
  }
})

const createGame = () => {
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

  // Send create_session message to server
  send('create_session', {
    name: playerName.value,
    teamId: selectedTeam.value
  })

  // Wait for response (session_info)
  // In real implementation, use event listener
  setTimeout(() => {
    // Simulate receiving session info
    const sessionId = 'DEMO123'
    sessionStore.setSession(sessionId)
    sessionStore.selectTeam(selectedTeam.value)
    
    router.push({
      name: 'Lobby',
      params: { sessionId }
    })
    
    loading.value = false
  }, 500)
}
</script>
