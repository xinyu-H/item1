/**
 * 登录用的类型
 */
import { HttpResponseModel } from '@/model/httpType'
import { UserInfoModel } from '@/api/base/model'

// 开启状态 0不开启 1开启
type OpenValidStatus = 0 | 1

// 获取是否开启验证码
export interface OpenValidResponseModel extends HttpResponseModel {
  // 0默认不开启 1开启
  data: OpenValidStatus
}

// 获取验证码
export interface ValidResponseModel extends HttpResponseModel {
  data: {
    // 验证码图片，base64
    images: string,
    // 验证码key
    key: string
  }
}

// 登录
export interface LoginResponseModel extends HttpResponseModel {
  data: UserInfoModel
}
