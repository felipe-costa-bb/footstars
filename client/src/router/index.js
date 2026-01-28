import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/create',
    name: 'CreateGame',
    component: () => import('../views/CreateGameView.vue')
  },
  {
    path: '/join',
    name: 'JoinGame',
    component: () => import('../views/JoinGameView.vue')
  },
  {
    path: '/lobby/:sessionId',
    name: 'Lobby',
    component: () => import('../views/LobbyView.vue')
  },
  {
    path: '/collection',
    name: 'Collection',
    component: () => import('../views/CollectionView.vue')
  },
  {
    path: '/my-teams',
    name: 'MyTeams',
    component: () => import('../views/MyTeamsView.vue')
  },
  {
    path: '/team-builder',
    name: 'TeamBuilder',
    component: () => import('../views/CreateTeamView.vue')
  },
  {
    path: '/history',
    name: 'MatchHistory',
    component: () => import('../views/MatchHistoryView.vue')
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/LeaderboardView.vue')
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('../views/ShopView.vue')
  },
  {
    path: '/match-setup',
    name: 'MatchSetup',
    component: () => import('../views/MatchSetupView.vue')
  },
  {
    path: '/game/:sessionId',
    name: 'Game',
    component: () => import('../views/GameView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
