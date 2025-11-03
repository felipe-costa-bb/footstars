<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">Match in Progress</h1>
          <p class="text-gray-400">{{ sessionId }}</p>
        </div>
        <router-link to="/" class="text-gray-400 hover:text-white">
          ← Home
        </router-link>
      </div>

      <!-- Game Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Left Column: Score & Field -->
        <div class="lg:col-span-2">
          <!-- Score Board -->
          <div class="bg-gray-800 rounded-lg p-6 border-2 border-field-accent mb-6">
            <div class="flex justify-between items-center text-center">
              <div class="flex-1">
                <p class="text-gray-400 text-sm mb-1">Team A</p>
                <p class="text-5xl font-bold text-white">{{ gameStore.score.A }}</p>
              </div>
              <div class="px-6 text-gray-400">
                <p class="text-sm">vs</p>
              </div>
              <div class="flex-1">
                <p class="text-gray-400 text-sm mb-1">Team B</p>
                <p class="text-5xl font-bold text-white">{{ gameStore.score.B }}</p>
              </div>
            </div>
          </div>

          <!-- Field Zones -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h3 class="text-lg font-bold mb-4 text-white">Field Position</h3>
            <div class="flex gap-2 mb-4">
              <div
                v-for="(zone, idx) in zones"
                :key="idx"
                class="flex-1 p-3 rounded text-center text-sm font-semibold transition"
                :class="gameStore.currentZone === zone ? 'bg-field-accent text-black' : 'bg-gray-700 text-gray-300'"
              >
                {{ zone }}
              </div>
            </div>
            <p class="text-gray-400 text-sm">
              Current possession: <span class="text-field-accent font-bold">Team {{ gameStore.currentTeam }}</span>
            </p>
          </div>

          <!-- Match Status -->
          <div v-if="gameStore.finished" class="bg-gray-800 rounded-lg p-6 border-2 border-green-600">
            <p class="text-xl font-bold text-green-400 mb-2">Match Finished!</p>
            <p v-if="gameStore.winner" class="text-lg text-white">
              🏆 Team {{ gameStore.winner }} wins!
            </p>
            <p v-else class="text-lg text-white">
              Draw!
            </p>
          </div>
        </div>

        <!-- Right Column: Event Log -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 h-full max-h-96 overflow-y-auto">
          <h3 class="text-lg font-bold mb-4 text-white sticky top-0 bg-gray-800 py-2">Match Events</h3>
          
          <div class="space-y-2">
            <div
              v-for="event in gameStore.events"
              :key="event.id"
              class="p-3 rounded text-xs font-mono bg-gray-700/50 border-l-2 border-field-accent text-gray-200"
              :class="getEventColor(event.type)"
            >
              <div class="font-bold text-field-accent">{{ formatEventType(event.type) }}</div>
              <div class="mt-1 text-xs text-gray-300">{{ event.description }}</div>
            </div>

            <div v-if="gameStore.events.length === 0" class="text-gray-500 text-center py-4">
              Waiting for events...
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex gap-4 justify-center" v-if="!gameStore.finished">
        <button
          v-if="false"
          class="bg-field-accent hover:bg-field-accent/90 text-white font-bold px-6 py-2 rounded transition"
        >
          Next Action
        </button>
        <button
          @click="exitGame"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded transition"
        >
          Exit Game
        </button>
      </div>

      <div v-else class="flex gap-4 justify-center">
        <router-link
          to="/"
          class="bg-field-accent hover:bg-field-accent/90 text-white font-bold px-6 py-2 rounded transition text-center"
        >
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useWebSocket } from '../composables/useWebSocket'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const sessionId = ref(route.params.sessionId)
const zones = ref(['GK', 'DEF', 'MID', 'ATT', 'GOAL'])

const { connect } = useWebSocket()

onMounted(() => {
  connect()
})

const formatEventType = (type) => {
  const typeMap = {
    'MATCH_START': '🏁 Match Start',
    'PASS': '⚽ Pass',
    'INTERCEPT': '🔄 Intercept',
    'SHOT': '🎯 Shot',
    'SAVE': '🧤 Save',
    'GOAL': '⚽ GOAL!',
    'HALFTIME': '⏸ Halftime',
    'MATCH_END': '🏁 Match End',
    'GOAL_CELEBRATION': '🎉 Goal!',
  }
  return typeMap[type] || type
}

const getEventColor = (type) => {
  if (type === 'GOAL') return 'bg-yellow-900/50'
  if (type === 'INTERCEPT') return 'bg-blue-900/50'
  if (type === 'PASS') return 'bg-green-900/50'
  if (type === 'SAVE') return 'bg-purple-900/50'
  return ''
}

const exitGame = () => {
  router.push('/')
}
</script>
