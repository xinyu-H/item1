import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { toolRoutes } from '@/router/tool'
import { messageRoutes } from '@/router/message'
import { mainRoutes } from '@/router/main'
import { checkAttendanceRoutes } from '@/router/checkAttendance'
import { entranceGuardOpen } from './entranceGuardOpen'
import { item1 } from './itemA'

const routes: Array<RouteRecordRaw> = [
  // 登录
  {
    path: '/login',
    // 框架为了使用KeepAlive 路由的名称改为文件名去掉.vue 例如：【Login.vue】name 就是 Login
    name: 'LoginPage',
    component: () => import('@/views/LoginPage.vue'),
    meta: {
      // 不需要token
      notNeedToken: true,
      // 不保持状态
      noCache: true
    }
  },
  // 测试地址
  {
    path: '/test',
    // 框架为了使用KeepAlive 路由的名称改为文件名去掉.vue 例如：【Login.vue】name 就是 Login
    name: 'MessageTest',
    component: () => import('@/views/example/MessageTest.vue'),
    meta: {
      // 不需要token
      notNeedToken: true,
      // 不保持状态
      noCache: true
    }
  },
  // 修改密码
  {
    path: '/changePassword',
    name: 'ChangePasswordPage',
    component: () => import('@/views/ChangePasswordPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  },
  // 首页
  ...mainRoutes,
  // 工具 类似H5端的扫码页面
  ...toolRoutes,
  // 消息页面
  ...messageRoutes,
  // 考勤相关
  ...checkAttendanceRoutes,
  // 门禁相关
  ...entranceGuardOpen,
  // 拿过来框架 新增demo
  ...item1
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
