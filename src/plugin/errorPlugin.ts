import cache from '@/utils/cache'
import { emitError, ErrorKey } from '@/utils/error'

export default {
  install () {
    // 全局监听没有处理的异常
    window.addEventListener('error', error => {
      emitError(error.error.message || '未知异常')
    })

    // 5秒钟上传一次异常
    setInterval(() => {
      const errorList = cache.local.getJSON(ErrorKey)
      if (errorList) {
        if (errorList.length > 100) {
          // 大于100条没上传 说明程序出现了很大的异常 为了避免缓存被占满 所以直接清空
          cache.local.remove(ErrorKey)
        } else {
          // TODO:上传记录
          // 上传结束清除记录
          cache.local.remove(ErrorKey)
        }
      }
    }, 5 * 1000)
  }
}
