// 外勤考勤提交信息
export interface SubmitOutSideModel {
  // 客户名称
  customerName: string,
  // 描述详情
  outsideInfo: string | undefined,
  // 人员序号
  userSerial: string,
  // 打卡时间，格式 yyyy-MM-dd HH:mm:ss
  sj: string,
  // 类型
  lx: string
  // 方向： 1 上班；2 下班；0 其他原因
  fx: string
  // openId
  openId?: string,
  // 工号
  userNo: string,
  // 姓名
  lname: string,
  // 经度
  jing: string,
  // 纬度
  wei: string,
  // 地址名称
  address: string,
  // 人脸对比照片
  userImage: string
  // 外勤附件
  wqImages: string
}
