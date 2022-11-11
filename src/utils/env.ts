/**
 * 环境相关
 */

import { EnvType } from '@/model/envType'

/**
 * 获取运行环境
 */
export function getEnv (): EnvType {
  let env: EnvType = EnvType.h5
  const userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.indexOf('miniprogram') > -1) {
    env = EnvType.wxApp
  } else if (userAgent.indexOf('micromessenger') > -1) {
    env = EnvType.wx
  }
  return env
}
