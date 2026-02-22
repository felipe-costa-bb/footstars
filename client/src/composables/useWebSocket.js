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
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      console.debug('WebSocket already connected or connecting')
      return
    }

    try {
      console.log('Attempting to connect WebSocket to', getWebSocketURL())
      ws = new WebSocket(getWebSocketURL())

      ws.onopen = () => {
        connected.value = true
        error.value = null
        console.log('✓ WebSocket connected to', getWebSocketURL())

        // Attempt to rejoin session if we have one
        if (sessionStore.sessionId && sessionStore.sessionId.length > 0) {
          console.log('Attempting to rejoin session:', sessionStore.sessionId)
          // Use 'send' wrapper if available, or raw send
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'rejoin_session',
              payload: {
                sessionId: sessionStore.sessionId,
                token: localStorage.getItem('token') || ''
              }
            }));
          }
        }
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'error') {
            console.error('Server Error:', message.payload)
          } else {
            handleMessage(message)
          }

          if (onMessage) {
            onMessage(message)
          }
        } catch (err) {
          console.error('Invalid message:', err)
        }
      }

      ws.onclose = (event) => {
        connected.value = false
        console.log('WebSocket disconnected', event.code, event.reason)
        // Auto-reconnect after delay?
        // setTimeout(connect, 3000)
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
    console.log(`[WS] Attempting to send: ${type}`, payload);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[WS] WebSocket not ready (state:', ws?.readyState, '), reconnecting...')
      connect()
      // Queue the message to send after connection
      setTimeout(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          console.log(`[WS] Sending after reconnect: ${type}`)
          ws.send(JSON.stringify({ type, payload }))
        } else {
          console.error('[WS] WebSocket still not connected after retry')
        }
      }, 100)
    } else {
      console.log(`[WS] Sending now: ${type}`)
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
        sessionStore.setMatchStarted(true, payload)
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
