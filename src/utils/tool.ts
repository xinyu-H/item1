import { showErrorMessage } from '@/utils/messageBox'
import router from '@/router'

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams (params: any): string {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && typeof (value) !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof (value[key]) !== 'undefined') {
            const params = propName + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

/**
 * 获取url参数
 * @param name 参数名称
 */
export function getQueryString (name: string) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  const r = window.location.search.substring(1).match(reg)
  if (r != null) return decodeURI(r[2])
  return null
}

/**
 * 判空
 * @param value
 */
export function isNotEmpty (value: any) {
  return value !== null && value !== undefined
}

/**
 * 请求异常处理
 * @param msg 错误消息
 * @param t 国际化
 */
export function apiError (msg: string | null | undefined, t: any) {
  showErrorMessage(msg || t('httpError.systemError'), { closeMillisecond: 5000 }).then(() => {
    router.go(-1)
  })
}

/**
 * file转bse64
 * @param file
 */
export function fileToBase64 (file: File): Promise<string | ArrayBuffer | null> {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()
    let imgResult: string | ArrayBuffer | null = ''
    reader.readAsDataURL(file)
    reader.onload = function () {
      imgResult = reader.result
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.onloadend = function () {
      resolve(imgResult)
    }
  })
}
