import { RouteRecordRaw } from 'vue-router'

// 工具类
export const toolRoutes: Array<RouteRecordRaw> = [
  // 全部应用
  {
    path: '/allApplication',
    name: 'AllApplicationPage',
    component: () => import('@/views/home/AllApplicationPage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  },
  // 二维码
  {
    path: '/myQrCode',
    name: 'MyQRCodePage',
    component: () => import('@/views/MyQRCodePage.vue'),
    meta: {
      // 不保持状态
      noCache: true
    }
  },
  // 扫描二维码页面
  {
    path: '/scanQRCode',
    name: 'ScanQRCodePage',
    component: () => import('@/views/tool/ScanQRCodePage.vue'),
    meta: {
      notNeedToken: true,
      // 不保持状态
      noCache: true
    }
  },
  // 选择位置
  {
    path: '/selectLocation',
    name: 'SelectLocationPage',
    component: () => import('@/views/tool/SelectLocationPage.vue'),
    meta: {
      notNeedToken: true,
      // 不保持状态
      noCache: true
    }
  },
  // 人脸识别
  {
    path: '/faceRecognition',
    name: 'FaceRecognitionPage',
    component: () => import('@/views/tool/FaceRecognitionPage.vue')
  }
]
