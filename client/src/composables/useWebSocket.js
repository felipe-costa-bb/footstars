import { ref, watch } from 'vue'
import { useSessionStore } from '../stores/session'
import { useGameStore } from '../stores/game'

let ws = null

export const useWebSocket = (onMessage) => {
  const connected = ref(false)
  const error = ref(null)
  const sessionStore = useSessionStore()
  const gameStore = useGameStore()

  const getWebSocketURL = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    // Always connect to port 3000 where the server is running
    const host = window.location.hostname
    return `${protocol}//${host}:3000`
  }

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    try {
      console.log('Attempting to connect WebSocket to', getWebSocketURL())
      ws = new WebSocket(getWebSocketURL())

      ws.onopen = () => {
        connected.value = true
        error.value = null
        console.log('✓ WebSocket connected to', getWebSocketURL())
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleMessage(message)
          if (onMessage) {
            onMessage(message)
          }
        } catch (err) {
          console.error('Invalid message:', err)
        }
      }

      ws.onclose = () => {
        connected.value = false
        console.log('WebSocket disconnected')
      }

      ws.onerror = (evt) => {
        error.value = 'WebSocket error'
        console.error('WebSocket error:', evt)
      }
    } catch (err) {
      error.value = err.message
      console.error('Connection error:', err)
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
    connected.value = false
  }

  const send = (type, payload = {}) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready, reconnecting...')
      connect()
      // Queue the message to send after connection
      setTimeout(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type, payload }))
        } else {
          console.error('WebSocket still not connected after retry')
        }
      }, 100)
    } else {
      ws.send(JSON.stringify({ type, payload }))
    }
  }

  const handleMessage = (message) => {
    const { type, payload } = message

    console.log(`📨 Received message type: ${type}`, payload)

    switch (type) {
      case 'session_info':
        console.log('Setting session info:', payload)
        sessionStore.setSession(payload.sessionId)
        sessionStore.setPlayerInfo(payload.players.find(p => p.role === payload.role).name, payload.role)
        sessionStore.updatePlayers(payload.players)
        break

      case 'both_ready':
        console.log('Both players ready!')
        sessionStore.setBothReady(true)
        break

      case 'match_started':
        gameStore.startMatch()
        gameStore.addEvent({
          type: 'MATCH_START',
          description: payload.message || 'Match started!'
        })
        break

      case 'engine_event':
        handleEngineEvent(payload.event)
        break

      case 'error':
        console.error('Server error:', payload.message)
        error.value = payload.message
        break
    }
  }

  const handleEngineEvent = (event) => {
    gameStore.addEvent(event)

    // Update game state based on event type
    if (event.type === 'GOAL') {
      gameStore.updateScore(event.teamId, event.teamId === 'A' ? gameStore.score.A + 1 : gameStore.score.B + 1)
    }

    if (event.type === 'PASS' || event.type === 'INTERCEPT' || event.type === 'POSSESSION_CHANGE') {
      gameStore.updatePossession(event.teamId || event.currentTeamId, event.zone)
    }

    if (event.type === 'MATCH_END') {
      gameStore.finishMatch(event.winner)
    }
  }

  return {
    connected,
    error,
    connect,
    disconnect,
    send
  }
}
