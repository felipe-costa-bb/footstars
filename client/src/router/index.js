import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateGameView from '../views/CreateGameView.vue'
import JoinGameView from '../views/JoinGameView.vue'
import LobbyView from '../views/LobbyView.vue'
import GameView from '../views/GameView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/create',
    name: 'CreateGame',
    component: CreateGameView
  },
  {
    path: '/join',
    name: 'JoinGame',
    component: JoinGameView
  },
  {
    path: '/lobby/:sessionId',
    name: 'Lobby',
    component: LobbyView
  },
  {
    path: '/game/:sessionId',
    name: 'Game',
    component: GameView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
