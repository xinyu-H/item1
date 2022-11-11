import { RouteRecordRaw } from 'vue-router'
// 考勤相关
export const checkAttendanceRoutes: Array<RouteRecordRaw> = [
  // 定位考勤
  {
    path: '/clockIn',
    name: 'ClockInPage',
    component: () => import('@/views/checkAttendance/ClockInPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  },
  // 考勤汇总
  {
    path: '/attendanceSum',
    name: 'AttendanceSumPage',
    component: () => import('@/views/checkAttendance/AttendanceSumPage.vue')
  },
  {
    path: '/LateRecorded',
    // 框架为了使用KeepAlive 路由的名称改为文件名去掉.vue 例如：【Login.vue】name 就是 Login
    name: 'LateRecordedPage',
    component: () => import('@/views/checkAttendance/LateRecordedPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  },
  // 外勤考勤
  {
    path: '/OutSide',
    name: 'OutSidePage',
    component: () => import('@/views/checkAttendance/OutSidePage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  }
]
