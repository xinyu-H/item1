import cache from '@/utils/cache'
import { formatDate } from '@/utils/date'
// 关键字
export const ErrorKey = 'error_list'

export function emitError (error: any) {
  let errorList = cache.local.getJSON(ErrorKey)
  const errorObj = {
    time: formatDate(new Date(), 'yyyy-MM-DD hh:mm:ss'),
    error: error?.toString() || '未知异常'
  }
  if (errorList) {
    errorList.push(errorObj)
  } else {
    errorList = [errorObj]
  }
  cache.local.setJSON(ErrorKey, errorList)
}
