import { httpGet, httpPost } from '@/utils/request'
import {
  AttenendanceResponseModel,
  CheckInModel,
  CheckRangeResponseModel,
  CheckRecordResponseModel,
  CheckWorkSettingResponseModel,
  ClockInRecordTimeResponseModel,
  LeaveTimeResponseModel
} from '@/api/checkWork/model'
import { HttpResponseModel } from '@/model/httpType'
import { aesEncrypt } from '@/utils/aesEncrypt'

export default {
  /**
   * 获取考勤
   */
  getCheckWorkSetting () {
    return httpGet<CheckWorkSettingResponseModel>('/kqSetting/getValues')
  },
  /**
   * 获取考勤记录
   * @param userSerial 用户标识
   * @param dates 当前日期
   */
  getCheckWorkRecord (userSerial: string, dates: string) {
    return httpPost<CheckRecordResponseModel>('/attence/getKq', {
      userSerial,
      dates
    })
  },
  /**
   * 获取考勤点信息-定位考勤用
   * @param userSerial
   */
  getCheckWorkRange (userSerial: string) {
    return httpPost<CheckRangeResponseModel>('/attence/getRange', {
      userSerial
    })
  },
  /**
   * 签到打卡
   * @param checkInInfo
   */
  checkIn (checkInInfo: CheckInModel) {
    return httpPost<HttpResponseModel>('/attence/addKq', {
      data: aesEncrypt(JSON.stringify(checkInInfo))
    })
  },
  /**
   * 获取首次末次打卡时间
   */
  getClockInTime (userSerial: string, dates: string) {
    return httpPost<ClockInRecordTimeResponseModel>('/attence/getKqjl', {
      userSerial,
      dates,
      flag: '1'
    })
  },
  /**
  * 获取打卡时间列表
  */
  getAttendanceInTime (userSerial: string, dates: string) {
    return httpPost<AttenendanceResponseModel>('/attence/newKqJl', {
      userSerial,
      dates,
      flag: '32'
    })
  },
  /**
   * 获取请假、迟到、早退、旷工的时间
   */
  getLeaveTime (userSerial: string, dates: string) {
    return httpPost<LeaveTimeResponseModel>('/attence/kqHzNew', {
      userSerial,
      dates
    })
  }
}
