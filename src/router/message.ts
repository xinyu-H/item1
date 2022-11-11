import { RouteRecordRaw } from 'vue-router'
// 消息通知
export const messageRoutes: Array<RouteRecordRaw> = [
  // 消息详情
  {
    path: '/messageDetail/:xh',
    name: 'MessageDetailPage',
    component: () => import('@/views/message/MessageDetailPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  },
  // 消息列表
  {
    path: '/messageList',
    name: 'MessageListPage',
    component: () => import('@/views/message/MessageListPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  }
]
