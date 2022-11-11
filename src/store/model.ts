/**
 * 用户信息
 */
export interface UserStateModel {
  // 人员序号
  userSerial?: number,
  // 工号
  userNo?: string,
  // 姓名
  userLname?: string,
  // openid
  openId?: string,
  // 企业ID，用于获取组织架构等
  orgId?: string,
  // 企业名称
  orgName?: string,
  // 密钥，用于登录之后的其他接口
  token?: string | null,
  // 部门序号
  userDep?: number,
  // 部门名称
  userDepname?: string,
  // 是否有档案照片：0无；1有；
  userPhoto?: number,
  // 档案照片
  userPhotoImg?: string
}

export interface SystemStateModel {
  cachedViews: Array<string>
}

export interface StateModel {
  user?: UserStateModel,
  system?: SystemStateModel
}
