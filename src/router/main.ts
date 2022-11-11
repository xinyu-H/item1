import { RouteRecordRaw } from 'vue-router'
// 首页
export const mainRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MainPage',
    component: () => import('@/views/home/MainPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    },
    redirect: '/home',
    // 首页子页面都是缓存页面的 所以不需要配置noCache
    children: [
      {
        path: 'home',
        // 框架为了使用KeepAlive 路由的名称改为文件名去掉.vue 例如：【Login.vue】name 就是 Login
        name: 'Home',
        component: () => import('@/views/home/Home.vue'),
        meta: {}
      },
      {
        path: 'my',
        // 框架为了使用KeepAlive 路由的名称改为文件名去掉.vue 例如：【Login.vue】name 就是 Login
        name: 'MyPage',
        component: () => import('@/views/home/MyPage.vue'),
        meta: {}
      }
    ]
  }
]
