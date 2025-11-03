import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchTeams = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      teams.value = await response.json()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching teams:', err)
    } finally {
      loading.value = false
    }
  }

  const getTeamById = (teamId) => {
    return teams.value.find(t => t.id === teamId)
  }

  return {
    teams,
    loading,
    error,
    fetchTeams,
    getTeamById
  }
})
