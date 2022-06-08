import { createRouter, createWebHashHistory } from 'vue-router'
import Player from '../views/Player.vue'

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
