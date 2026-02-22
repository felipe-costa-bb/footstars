<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">Lobby</h1>
          <p class="text-gray-400">Waiting for players...</p>
        </div>
        <router-link to="/" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft class="w-4 h-4" />
          <span>Home</span>
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
            class="bg-field-accent hover:bg-field-accent/90 text-white px-4 py-2 rounded transition flex items-center gap-2"
          >
            <component :is="copied ? Check : Copy" class="w-4 h-4" />
            <span>{{ copied ? 'Copied!' : 'Copy ID' }}</span>
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
            <CheckCircle
              v-if="displayPlayers[role]"
              class="w-8 h-8 transition-colors"
              :class="displayPlayers[role].ready ? 'text-green-500 opacity-100' : 'text-gray-600 opacity-50'"
            />
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
          class="bg-field-accent hover:bg-field-accent/90 text-white font-bold px-6 py-3 rounded transition flex items-center gap-2"
        >
          <span>I'm Ready</span>
        </button>
        <button
          v-else
          disabled
          class="bg-gray-600 text-white font-bold px-6 py-3 rounded cursor-not-allowed flex items-center gap-2"
        >
          <Check class="w-5 h-5" />
          <span>Ready</span>
        </button>

        <button
          v-if="isCreator && bothReady"
          @click="startMatch"
          class="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded transition flex items-center gap-2"
        >
          <span>Start Match</span>
          <ArrowRight class="w-5 h-5" />
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
import { useGameStore } from '../stores/game'
import { useWebSocket } from '../composables/useWebSocket'
import { ArrowLeft, Copy, Check, CheckCircle, ArrowRight } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const gameStore = useGameStore()
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
      teamName: playerA.teamName || (playerA.teamId ? getTeamName(playerA.teamId) : null)
    } : null,
    B: playerB ? {
      ...playerB,
      teamName: playerB.teamName || (playerB.teamId ? getTeamName(playerB.teamId) : null)
    } : null
  }
})

onMounted(() => {
  gameStore.reset() // Clear any old game state when entering lobby
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
  console.log('[DEBUG] User clicked Ready')
  playerReady.value = true
  send('client_ready')
}

const startMatch = () => {
  console.log('[DEBUG] startMatch called. isCreator:', isCreator.value)
  if (!isCreator.value) {
    console.warn('[DEBUG] startMatch ignored: Not creator')
    return
  }
  console.log('[DEBUG] Sending start_match to server with seed')
  send('start_match', { seed: Date.now() })
}

// Subscribe to store changes to catch match_started
sessionStore.$subscribe((mutation, state) => {
    console.log('Session store update:', mutation.type, state.matchState)
    
    // Check matchState directly from state (computed properties are not in state)
    if (state.matchState && state.matchState.active && state.matchState.params) {
        console.log('Match started! Navigating to game...')
        const params = state.matchState.params
        
        // Determine which team is "mine" and which is "opponent"
        const myRole = sessionStore.playerRole
        const myTeamId = myRole === 'A' ? params.teamAId : params.teamBId
        const oppTeamId = myRole === 'A' ? params.teamBId : params.teamAId
        
        router.push({
            name: 'Game',
            params: { sessionId: sessionId.value },
            query: { 
                teamId: myTeamId,
                opponentId: oppTeamId
            }
        })
    }
})
</script>
