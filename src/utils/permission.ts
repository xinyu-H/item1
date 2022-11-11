import router from '@/router'
import { getToken } from '@/utils/auth'
import { emitError } from '@/utils/error'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import { NavigationGuardNext } from 'vue-router'

NProgress.configure({
  showSpinner: false
})

// 重新获取用户信息
async function reGetUserInfo (next: NavigationGuardNext) {
  let res
  try {
    // 请求接口获取 重新获取用户信息
    res = await store.dispatch('user/reGetUserInfo')
  } catch (e) {
    // 收集异常
    emitError(e)
  }
  if (res) {
    next()
    NProgress.done()
  } else {
    // 如果没有获取到用户信息 直接跳转到登录页面
    // next({ name: 'LoginPage' })
    next({ name: 'demoAPage' })
    NProgress.done()
  }
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  // 去登录页和在mate中声明notNeedToken为true的直接进行跳转
  if (to.name === 'demoAPage' || to.meta.notNeedToken) {
    next()
    NProgress.done()
  } else {
    const token = getToken()
    // 判断是否有token
    if (token) {
      if (store.state.user?.userSerial) {
        next()
        NProgress.done()
      } else {
        await reGetUserInfo(next)
      }
    } else {
      await reGetUserInfo(next)
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
