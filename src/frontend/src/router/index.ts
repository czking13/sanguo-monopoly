import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '三国大富翁' }
  },
  {
    path: '/lobby',
    name: 'Lobby',
    component: () => import('@/views/Lobby.vue'),
    meta: { title: '游戏大厅' }
  },
  {
    path: '/room/:roomId',
    name: 'Room',
    component: () => import('@/views/Room.vue'),
    meta: { title: '房间' }
  },
  {
    path: '/game/:roomId',
    name: 'Game',
    component: () => import('@/views/Game.vue'),
    meta: { title: '游戏中' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '三国大富翁'
  next()
})

export default router
