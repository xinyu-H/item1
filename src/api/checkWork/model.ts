/**
 * 考勤
 */
import { HttpResponseModel } from '@/model/httpType'

// 考勤配置项
export interface CheckWorkSettingResponseModel extends HttpResponseModel {
  data: {
    // 定位考勤是否开启人脸验证：0不开启；2 启用人脸身份核验
    dwCheck: number,
    // 外勤是否开启人脸验证：0不开启；2 启用人脸身份核验
    wqCheck: number,
    // 外勤是否开启照片上传：0不开启；1 开启
    wqImage: number,
    // 人脸采集是否开启照片质量检测：0 不开启；1 开启；2 启用人脸身份核验;
    faceCheck: number,
    // 允许上传人脸照片 0不允许；1允许
    userFace: number,
    // 允许上传档案照片  0不允许；1允许
    userPhoto: number,
    // 是否允许修改照片 0:不允许,1:允许
    reSet: number,
    // web端是否开启上传照片检测，0 不开启 1开启 2:开启人脸1:1检测
    webFaceCheck: number,
    // 外勤可拖动的范围，单位：米
    dragRange: number
  }
}

export interface CheckRecordModel {
  // 时间
  sj: string,
  // 方向：1 上班打卡；2 下班打卡
  fx: string
}

// 考勤记录
export interface CheckRecordResponseModel extends HttpResponseModel {
  data: Array<CheckRecordModel>
}

// 考勤点信息
export interface CheckRangeModel {
  // 经度
  longitude: string,
  // 纬度
  latitude: string,
  // 可考勤范围，米
  range: string,
  // 定位点ID
  locationId: number | null | undefined,
  // 定位点名称
  mapName: string
}

// 考勤点信息
export interface CheckRangeResponseModel extends HttpResponseModel {
  data: Array<CheckRangeModel>
}

// 考勤信息
export interface CheckInModel {
  // 方向 ：1 上班；2下班
  fx: number,
  // 姓名
  lname: string,
  // 类型,固定为0
  lx: string,
  // 定位点ID
  openId?: string
  // 时间
  sj: string,
  // 人员工号
  userNo: string,
  // 人员序号
  userSerial: string,
  // 定位点的经度
  jing: number,
  // 定位点的纬度
  wei: number,
  // 地址名称
  address: string,
  // 定位点ID
  locationId: number,
  // 拍照照片,传base64
  userImage?: string
}
// 考勤汇总首末次打卡时间
export interface ClockInRecordTimeResponseModel extends HttpResponseModel{
  data : Array<{sj:string}>
}
// 考勤汇总请假、迟到、早退旷工时间
export interface LeaveTimeResponseModel extends HttpResponseModel{
  data : Array<{late:string, leave:string, absenteeism:string, goout: string }>
}
// 获取考勤记录
export interface AttenendanceResponseModel extends HttpResponseModel{
  data : Array<{
    // 打卡日期
    date:string,
    // 周几
    week:string,
    // 1打卡 2 请假 3旷工 ？？？
    type:string,
    // 开始打卡时间
    startTime: string,
    // 结束打卡时间
    endTime: string,
   }>
}
