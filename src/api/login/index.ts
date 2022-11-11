import { httpPost } from '@/utils/request'
import { LoginResponseModel, OpenValidResponseModel, ValidResponseModel } from '@/api/login/model'

// 登录相关接口
export default {
  getOpenValid () {
    return httpPost<OpenValidResponseModel>('/user/getOpenValid')
  },
  /**
   * 获取验证码图片
   * @param width 宽度
   * @param height 高度
   */
  getVerifications (width: string, height: string) {
    return httpPost<ValidResponseModel>('/user/verification', {
      width,
      height
    })
  },
  /**
   * 微信登录
   * @param userNo 工号
   * @param userPassword 密码
   * @param openId openid
   * @param key key（验证码的key）
   * @param verification 验证码
   */
  userLoginWX (userNo: string, userPassword: string, openId: string, key?: string, verification?: string) {
    return httpPost<LoginResponseModel>('/user/userLoginCheck', {
      userNo,
      userPassword,
      openId,
      key,
      verification,
      loginType: 0
    })
  },
  /**
   * H5登录
   * @param userNo 工号
   * @param userPassword 密码
   * @param key key（验证码的key）
   * @param verification 验证码
   */
  userLoginH5 (userNo: string, userPassword: string, key?: string, verification?: string) {
    return httpPost<LoginResponseModel>('/user/loginH5', {
      userNo,
      userPassword,
      key,
      verification,
      loginType: 0
    })
  }
}
