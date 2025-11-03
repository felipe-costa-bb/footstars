import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const matchStarted = ref(false)
  const events = ref([])
  const score = ref({ A: 0, B: 0 })
  const currentTeam = ref(null)
  const currentZone = ref(null)
  const finished = ref(false)
  const winner = ref(null)

  const addEvent = (event) => {
    events.value.push({
      ...event,
      id: Math.random(),
      timestamp: new Date()
    })
  }

  const updateScore = (teamId, newScore) => {
    score.value[teamId] = newScore
  }

  const updatePossession = (teamId, zone) => {
    currentTeam.value = teamId
    currentZone.value = zone
  }

  const finishMatch = (winnerTeam) => {
    finished.value = true
    winner.value = winnerTeam
  }

  const startMatch = () => {
    matchStarted.value = true
  }

  const reset = () => {
    matchStarted.value = false
    events.value = []
    score.value = { A: 0, B: 0 }
    currentTeam.value = null
    currentZone.value = null
    finished.value = false
    winner.value = null
  }

  return {
    matchStarted,
    events,
    score,
    currentTeam,
    currentZone,
    finished,
    winner,
    addEvent,
    updateScore,
    updatePossession,
    finishMatch,
    startMatch,
    reset
  }
})
