import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { config, OpenStatus } from '@/config'
import { getToken } from '@/utils/auth'
import { tansParams } from '@/utils/tool'
import { ComposerTranslation } from 'vue-i18n'
import { Toast } from '@nutui/nutui'
import cache from '@/utils/cache'
import router from '@/router'
import { HttpResponseModel, ResponseStatus } from '@/model/httpType'
import { getEnv } from '@/utils/env'
import { EnvType } from '@/model/envType'
import { emitError } from '@/utils/error'

// 根据但企业多企业进行基础路径的判断
const baseURL = config.multiCompanies === OpenStatus.open ? config.baseUrl.multi : config.baseUrl.single
// 创建axios实例
const service = axios.create({
  baseURL,
  // 超时时间 默认20秒
  timeout: 20000
})

// request拦截器
service.interceptors.request.use(config => {
  if (!config.headers) {
    config.headers = {}
  }
  // 是否需要设置 token
  const isToken = config.headers.isToken === false
  // token
  const token = getToken()
  // 需要token
  if (token && !isToken) {
    config.headers.Authorization = token
  }

  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }

  return config
}, error => Promise.reject(error))

// 响应拦截器
service.interceptors.response.use(response => {
  return response.status === ResponseStatus.success ? Promise.resolve(response.data) : Promise.reject(response)
}, error => {
  emitError(error)
  return Promise.reject(error)
})

export default service

// 处理返回异常的方法 因为国际化只能在setup中使用所以只能单拎方法 在各个页面使用
export function handleRequestError (res: AxiosError, t: ComposerTranslation) {
  const {
    message,
    response
  } = res
  let msg = ''
  if (response) {
    // 请求通了 但是后端返回异常
    switch (response.status) {
      case ResponseStatus.authFailed:
        msg = t('httpError.authFailed')
        break
      case ResponseStatus.noPermission:
        msg = t('httpError.noPermission')
        break
      case ResponseStatus.noExist:
        msg = t('httpError.noExist')
        break
      case ResponseStatus.apiError:
        msg = (response.data as any)?.msg || t('httpError.apiError', { api: '' })
        break
    }
  } else if (message) {
    // 请求没通
    if (message === 'Network Error') {
      msg = t('httpError.linkError')
    } else if (message.includes('timeout')) {
      msg = t('httpError.timeout')
    } else if (message.includes('Request failed with status code')) {
      msg = t('httpError.apiError', { api: msg.substring(msg.length - 3) })
    }
  }

  if (msg) {
    // 提示
    Toast.fail(msg)
  }
}

/**
 * 检查请求状态 状态异常直接 进行跳转
 * @param res
 */
function checkStatusToRouter (res: AxiosError) {
  const {
    response
  } = res
  if (response && response.status === ResponseStatus.authFailed) {
    // 微信端需要保存openid
    if (getEnv() === EnvType.wx) {
      const openId = cache.session.get('openId')
      cache.session.clear()
      if (openId) {
        cache.session.set('openId', openId)
      }
    } else {
      cache.session.clear()
    }
    // 这里的跳转 是为了激活路由守卫里面的鉴权机制
    router.replace('/')
  }
}

/**
 * post请求
 * @param {string} url 地址
 * @param {any} data 数据
 * @param {ComposerTranslation} t 国际化
 * @param {AxiosRequestConfig} config 配置项
 */
export function httpPost<T extends HttpResponseModel> (url: string, data?: any, t?: ComposerTranslation, config?: AxiosRequestConfig<any> | undefined): Promise<T | null> {
  return service.post(url, data, config).then(res => {
    return Promise.resolve((res as unknown) as T)
  }).catch(error => {
    if (t) {
      handleRequestError(error, t)
    }
    checkStatusToRouter(error)
    return Promise.reject(error)
  })
}

/**
 * get请求
 * @param {string} url 地址
 * @param {any} data 数据
 * @param {ComposerTranslation} t 国际化
 * @param {AxiosRequestConfig} config 配置项
 */
export function httpGet<T extends HttpResponseModel> (url: string, params?: any, t?: ComposerTranslation, config?: AxiosRequestConfig<any> | undefined): Promise<T | null> {
  return service.request({
    url,
    params,
    ...config
  }).then(res => {
    return Promise.resolve((res as unknown) as T)
  }).catch(error => {
    if (t) {
      handleRequestError(error, t)
    }
    checkStatusToRouter(error)
    return Promise.reject(error)
  })
}
