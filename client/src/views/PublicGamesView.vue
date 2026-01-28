<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/join" class="text-field-accent hover:text-field-accent/80 mb-4 inline-block">
          ← Back to Join Game
        </router-link>
        <h1 class="text-4xl font-bold text-white mb-2">Public Games</h1>
        <p class="text-gray-400">Browse and join available games</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-field-accent"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-900/30 border border-red-600 rounded-lg p-6 text-center text-red-400">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="games.length === 0" class="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
        <div class="text-6xl mb-4">🎮</div>
        <h3 class="text-xl font-bold text-white mb-2">No Public Games Available</h3>
        <p class="text-gray-400 mb-6">Be the first to create a public game!</p>
        <router-link
          to="/create"
          class="inline-block bg-field-accent hover:bg-field-accent/90 text-white font-bold px-6 py-3 rounded transition"
        >
          Create a Game
        </router-link>
      </div>

      <!-- Games List -->
      <div v-else class="space-y-4">
        <div
          v-for="game in games"
          :key="game.sessionId"
          class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-field-accent transition"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">👤</span>
                <h3 class="text-xl font-bold text-white">{{ game.creatorName }}</h3>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-400">
                <span class="flex items-center gap-1">
                  <span>🏆</span> {{ getTeamName(game.teamId) }}
                </span>
                <span class="flex items-center gap-1">
                  <span>⏰</span> {{ formatTime(game.createdAt) }}
                </span>
              </div>
            </div>
            
            <button
              @click="joinGame(game.sessionId)"
              :disabled="joining === game.sessionId"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition flex items-center gap-2"
            >
              <span v-if="joining !== game.sessionId">Join Game</span>
              <span v-else>Joining...</span>
            </button>
          </div>
        </div>

        <!-- Refresh hint -->
        <p class="text-center text-gray-500 text-sm mt-6">
          Auto-refreshes every 5 seconds • {{ games.length }} game(s) available
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from '../composables/useWebSocket'

const router = useRouter()
const sessionStore = useSessionStore()
const authStore = useAuthStore()
const { send } = useWebSocket()

const games = ref([])
const loading = ref(true)
const error = ref('')
const joining = ref(null)
const teams = ref([])
let refreshInterval = null

const fetchGames = async () => {
  try {
    const res = await fetch('/api/public-games')
    if (!res.ok) throw new Error('Failed to load games')
    games.value = await res.json()
    error.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const fetchTeams = async () => {
  try {
    const res = await fetch('/api/teams')
    teams.value = await res.json()
  } catch (err) {
    console.error('Failed to load teams:', err)
  }
}

const getTeamName = (teamId) => {
  if (!teamId) return 'Unknown Team'
  const team = teams.value.find(t => t.id === teamId)
  return team?.name || teamId
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  return `${Math.floor(diffMins / 60)}h ago`
}

const joinGame = async (sessionId) => {
  if (!authStore.isAuthenticated) {
    router.push('/')
    return
  }

  joining.value = sessionId

  // Get user's first team for joining
  let selectedTeam = null
  try {
    const myTeamRes = await fetch('/api/my-team', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (myTeamRes.ok) {
      const myTeam = await myTeamRes.json()
      selectedTeam = myTeam?.id
    }
  } catch (e) {
    console.error('Failed to load my team:', e)
  }

  // Fallback to default team if user has none
  if (!selectedTeam && teams.value.length > 0) {
    selectedTeam = teams.value[0].id
  }

  sessionStore.setTeamId(selectedTeam)

  // Send join request
  send('join_session', {
    sessionId: sessionId,
    name: authStore.user?.username || 'Player',
    teamId: selectedTeam,
    token: authStore.token
  })

  // Wait for response
  const unwatch = sessionStore.$subscribe((mutation, state) => {
    if (state.sessionId && state.sessionId === sessionId) {
      unwatch()
      router.push({
        name: 'Lobby',
        params: { sessionId }
      })
    }
  })

  // Timeout
  setTimeout(() => {
    if (joining.value === sessionId) {
      joining.value = null
      error.value = 'Failed to join game. It may have been closed.'
      fetchGames() // Refresh the list
    }
  }, 5000)
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/')
    return
  }

  await Promise.all([fetchGames(), fetchTeams()])
  
  // Auto-refresh every 5 seconds
  refreshInterval = setInterval(fetchGames, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
