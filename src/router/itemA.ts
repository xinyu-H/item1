import { RouteRecordRaw } from 'vue-router'

export const item1: Array<RouteRecordRaw> = [
  {
    path: '/demoA',
    name: 'demoAPage',
    component: () => import('@/views/itemA/demoA.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  }
]
