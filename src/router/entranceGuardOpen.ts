import { RouteRecordRaw } from 'vue-router'
// 门禁相关
export const entranceGuardOpen: Array<RouteRecordRaw> = [
  // 门禁开门
  {
    path: '/entranceGuard',
    name: 'DoorControlPage',
    component: () => import('@/views/DoorControl/DoorControlPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  }
]
