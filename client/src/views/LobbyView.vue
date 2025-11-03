<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">Lobby</h1>
          <p class="text-gray-400">Waiting for players...</p>
        </div>
        <router-link to="/" class="text-gray-400 hover:text-white">
          ← Home
        </router-link>
      </div>

      <!-- Session Info -->
      <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-400 text-sm mb-1">Session ID</p>
            <p class="text-3xl font-mono font-bold text-field-accent">{{ sessionId }}</p>
          </div>
          <button
            @click="copySessionId"
            class="bg-field-accent hover:bg-field-accent/90 text-white px-4 py-2 rounded transition"
          >
            {{ copied ? '✓ Copied!' : 'Copy ID' }}
          </button>
        </div>
      </div>

      <!-- Players -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          v-for="role in ['A', 'B']"
          :key="role"
          class="bg-gray-800 rounded-lg p-6 border-2 transition"
          :class="displayPlayers[role] ? 'border-field-accent' : 'border-gray-700 opacity-50'"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-gray-400 text-sm mb-1">Player {{ role }}</p>
              <p class="text-2xl font-bold text-white">{{ displayPlayers[role]?.name || 'Waiting...' }}</p>
            </div>
            <span
              v-if="displayPlayers[role]"
              class="text-2xl"
              :class="displayPlayers[role].ready ? 'opacity-100' : 'opacity-30'"
            >
              ✓
            </span>
          </div>

          <div v-if="displayPlayers[role]" class="pt-4 border-t border-gray-700">
            <p class="text-gray-400 text-sm mb-2">Selected Team</p>
            <p class="text-lg font-semibold text-field-accent">{{ displayPlayers[role].teamName || 'Not selected' }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 justify-center">
        <button
          v-if="!playerReady"
          @click="setReady"
          class="bg-field-accent hover:bg-field-accent/90 text-white font-bold px-6 py-3 rounded transition"
        >
          I'm Ready
        </button>
        <button
          v-else
          disabled
          class="bg-gray-600 text-white font-bold px-6 py-3 rounded cursor-not-allowed"
        >
          ✓ Ready
        </button>

        <button
          v-if="isCreator && bothReady"
          @click="startMatch"
          class="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded transition"
        >
          Start Match →
        </button>
      </div>

      <!-- Waiting Message -->
      <div v-if="!bothReady" class="mt-8 text-center text-gray-400">
        <p>Waiting for both players to be ready...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { useWebSocket } from '../composables/useWebSocket'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const { send, connect } = useWebSocket()

const sessionId = ref(route.params.sessionId)
const copied = ref(false)
const playerReady = ref(false)
const teams = ref([])

const bothReady = computed(() => sessionStore.bothReady)
const isCreator = computed(() => sessionStore.playerRole === 'A')

const displayPlayers = computed(() => {
  const players = sessionStore.players
  const playerA = players.find(p => p.role === 'A') || null
  const playerB = players.find(p => p.role === 'B') || null

  return {
    A: playerA ? {
      ...playerA,
      teamName: playerA.teamId ? getTeamName(playerA.teamId) : null
    } : null,
    B: playerB ? {
      ...playerB,
      teamName: playerB.teamId ? getTeamName(playerB.teamId) : null
    } : null
  }
})

onMounted(() => {
  connect()

  // Fetch teams for name mapping
  fetch('/api/teams')
    .then(r => r.json())
    .then(data => {
      teams.value = data
    })
    .catch(err => console.error('Failed to load teams:', err))
})

const getTeamName = (teamId) => {
  const team = teams.value.find(t => t.id === teamId)
  return team ? team.name : 'Unknown'
}

const copySessionId = () => {
  navigator.clipboard.writeText(sessionId.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const setReady = () => {
  playerReady.value = true
  send('client_ready')
}

const startMatch = () => {
  send('start_match', { seed: Date.now() })
  
  // Navigate to game view
  setTimeout(() => {
    router.push({
      name: 'Game',
      params: { sessionId: sessionId.value }
    })
  }, 500)
}
</script>
