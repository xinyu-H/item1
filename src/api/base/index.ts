import { httpGet } from '@/utils/request'
import {
  OpenIdResponseModel,
  serInfoByCodeResponseModel, SysDateResponseModel,
  UserFaceInfoResponseModel,
  UserInfoByOpenIdResponseModel,
  WXConfigResponseModel
} from '@/api/base/model'

// 基础接口
export default {
  /**
   * 根据openid获取用户信息
   * @param openId
   */
  getUserInfoByOpenId (openId: string) {
    return httpGet<UserInfoByOpenIdResponseModel>('/user/getUserInfoByOpenId', { openId })
  },
  /**
   * 根据code获取openid
   * @param code
   */
  getOpenId (code: string) {
    return httpGet<OpenIdResponseModel>('/user/getOpenId', { code })
  },
  /**
   * 根据code获取用户信息
   * @param code
   */
  getUserInfoByCode (code: string) {
    return httpGet<serInfoByCodeResponseModel>('/user/getOpenId', { code })
  },
  /**
   * 获取用户照片信息
   * @param userSerial
   */
  getUserFaceInfo (userSerial: string) {
    return httpGet<UserFaceInfoResponseModel>('/userBase/selectUserFacePhoto', { userSerial })
  },
  /**
   * 获取用户信息
   */
  getUserInfoByToken () {
    return httpGet<UserInfoByOpenIdResponseModel>('/user/getUserInfoByToken')
  },
  /**
   * 获取微信配置项
   * @param url 本地地址
   */
  getWXConfig (url: string) {
    return httpGet<WXConfigResponseModel>('/system/getConfig', {
      url
    })
  },
  /**
   * 获取系统时间
   */
  getSystemDate () {
    return httpGet<SysDateResponseModel>('/system/getSystemDate')
  }
}
