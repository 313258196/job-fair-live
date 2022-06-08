import { createRouter, createWebHashHistory } from 'vue-router'
import Player from '../views/player/Player.vue'

const routes = [
  {
    path: '/',
    name: 'player',
    component: Player
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
