import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSessionStore = defineStore('session', () => {
  const sessionId = ref(null)
  const playerName = ref('')
  const playerRole = ref(null)
  const players = ref([])
  const teamSelection = ref({
    A: null,
    B: null
  })
  const bothReady = ref(false)
  const teamId = ref(null) // New: Store the user's own team ID

  const setTeamId = (id) => {
    teamId.value = id
  }

  const getPlayerTeam = computed(() => {
    const role = playerRole.value
    return role ? teamSelection.value[role] : null
  })

  const setSession = (id) => {
    sessionId.value = id
  }

  const setPlayerInfo = (name, role) => {
    playerName.value = name
    playerRole.value = role
  }

  const updatePlayers = (playersList) => {
    players.value = playersList
  }

  const selectTeam = (team) => {
    if (playerRole.value) {
      teamSelection.value[playerRole.value] = team
    }
  }

  const setBothReady = (ready) => {
    bothReady.value = ready
  }

  const reset = () => {
    sessionId.value = null
    playerName.value = ''
    playerRole.value = null
    players.value = []
    teamSelection.value = { A: null, B: null }
    bothReady.value = false
  }

  return {
    sessionId,
    playerName,
    playerRole,
    players,
    teamSelection,
    bothReady,
    getPlayerTeam,
    setSession,
    setPlayerInfo,
    updatePlayers,
    selectTeam,
    setBothReady,
    setTeamId,  // New action
    teamId,     // New state
    reset
  }
});
