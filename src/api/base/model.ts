/**
 * 用户类型
 */
import { HttpResponseModel } from '@/model/httpType'

// 用户信息
export interface UserInfoModel {
  // 人员序号
  userSerial: number,
  // 工号
  userNo: string,
  // 姓名
  userLname: string,
  // openid
  openId: string,
  // 企业ID，用于获取组织架构等
  orgId: string,
  // 企业名称
  orgName: string,
  // 密钥，用于登录之后的其他接口
  token: string,
  // 部门序号
  userDep: number,
  // 部门名称
  userDepname: string
}

// 用户照片信息
export interface UserFaceInfoModel extends UserInfoModel {
  // 是否有档案照片：0无；1有；
  userPhoto: 0 | 1 | undefined,
  // 档案照片base64
  userPhotoImg: string
}

// 根据openid获取用户信息
export interface UserInfoByOpenIdResponseModel extends HttpResponseModel {
  data: UserInfoModel
}

// openid
export interface OpenIdModel {
  // 多企业的企业编号
  companyId: string,
  openId: string
}

// 获取openid
export interface OpenIdResponseModel extends HttpResponseModel {
  data: OpenIdModel
}

// 根据code获取用户信息
export interface serInfoByCodeResponseModel extends HttpResponseModel {
  data: {
    // 用户信息
    user: UserInfoModel,
    // 企业编号 多企业用
    companyId: string,
    openId: string
  }
}

// 根据openid获取用户信息
export interface UserFaceInfoResponseModel extends HttpResponseModel {
  data: UserFaceInfoModel
}

// 微信配置信息
export interface WXConfig {
  // 签名
  signature: string,
  // 公众号唯一标识
  appId: string,
  // 生成的签名随机串
  nonceStr: string,
  // 生成签名的时间戳
  timestamp: string
}

// 微信返回值类型
export interface WXConfigResponseModel extends HttpResponseModel {
  data: WXConfig
}

// 系统时间返回值类型
export interface SysDateResponseModel extends HttpResponseModel {
  data: {
    sysDate: string
  }
}
