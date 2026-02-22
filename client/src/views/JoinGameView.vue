<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/" class="flex items-center gap-2 text-field-accent hover:text-field-accent/80 mb-4 inline-block transition-colors">
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Home</span>
        </router-link>
        <h1 class="text-4xl font-bold text-white mb-2">Join a Game</h1>
        <p class="text-gray-400 mb-4">Enter the session ID and choose your team</p>
        
        <!-- Public Games Link -->
        <router-link
          to="/public-games"
          class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Globe class="w-5 h-5" />
          <span>Browse Public Games</span>
        </router-link>
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
          class="w-full bg-field-accent hover:bg-field-accent/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition flex items-center justify-center gap-2"
        >
          <span v-if="!loading">Join Game</span>
          <span v-else class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span>Joining...</span>
          </span>
        </button>

        <div v-if="error" class="mt-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-400">
          {{ error }}
        </div>
        <!-- Team Selection -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-bold mb-4">Select Your Team</h2>
          
          <div v-if="teamsLoading" class="text-center py-8">
            <Loader2 class="w-8 h-8 animate-spin mx-auto text-field-accent" />
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
import { useGameStore } from '../stores/game'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../composables/useWebSocket'
import { ArrowLeft, Globe, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const sessionStore = useSessionStore()
const gameStore = useGameStore()
const authStore = useAuthStore()
const { send } = useWebSocket()

const sessionId = ref('')
const playerName = ref(authStore.user?.username || '')
const selectedTeam = ref('')
const loading = ref(false)
const error = ref('')
const teams = ref([])
const teamsLoading = ref(true)

onMounted(async () => {
    // Check auth
  if (!authStore.isAuthenticated) {
      router.push('/');
      return;
  }

  // Reset previous session state
  sessionStore.reset()
  gameStore.reset()
  
  // Fetch defaults
  try {
    const response = await fetch('/api/teams')
    const defaults = await response.json()
    teams.value = [...defaults]
    
    // Fetch MY custom team
    if (authStore.isAuthenticated) {
        try {
           const myTeamRes = await fetch('/api/my-team', {
               headers: { 'Authorization': `Bearer ${authStore.token}` }
           });
           if (myTeamRes.ok) {
               const myTeam = await myTeamRes.json();
               if (myTeam) {
                   teams.value.unshift(myTeam); // Put my team first
               }
           }
        } catch (e) {
            console.error("Failed to load my team", e);
        }
    }

    if (teams.value.length > 0) {
       selectedTeam.value = teams.value[0].id
    }
  } catch (err) {
    console.error('Failed to load teams:', err)
  } finally {
    teamsLoading.value = false
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

  // Store selection
  sessionStore.setTeamId(selectedTeam.value)

  // Get team name
  const team = teams.value.find(t => t.id === selectedTeam.value)
  const teamName = team ? team.name : 'Unknown Team'

  // Send join_session message
  send('join_session', {
    sessionId: sessionId.value.toUpperCase(),
    name: playerName.value,
    teamId: selectedTeam.value,
    teamName: teamName,
    token: authStore.token
  })

  // Wait for response (session_info) via store subscription
  const unwatch = sessionStore.$subscribe((mutation, state) => {
    if (state.sessionId && state.sessionId === sessionId.value.toUpperCase()) {
      unwatch()
      router.push({
        name: 'Lobby',
        params: { sessionId: state.sessionId }
      })
    }
  })

  // Timeout safety
  setTimeout(() => {
    if (loading.value) {
      loading.value = false
      error.value = 'Could not join session. Check ID and try again.'
      unwatch()
    }
  }, 5000)
}
</script>
