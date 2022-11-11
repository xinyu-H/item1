/**
 * token处理文件
 */

import cache from '@/utils/cache'

// token关键字
const TokenKey = 'Admin-Token'

// 获取token
export function getToken (): string | null {
  return cache.session.get(TokenKey)
}

/**
 * 设置token
 * @param {string} token token
 */
export function setToken (token: string): void {
  cache.session.set(TokenKey, token)
}

// 删除token
export function removeToken (): void {
  cache.session.remove(TokenKey)
}
