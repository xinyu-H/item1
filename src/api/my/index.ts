import { httpPost } from '@/utils/request'
import { CardResponseModel, PushResponseModel } from '@/api/my/model'
import { HttpResponseModel } from '@/model/httpType'

export default {
  /**
   * 获取员工卡户信息
   * @param userSerial 人员序号
   */
  getCardStatus (userSerial: string) {
    return httpPost<CardResponseModel>('/user/getUserCardInfo', {
      userSerial
    })
  },
  /**
   * 获取消息推送状态
   * @param userSerial 人员序号
   */
  getPushStatus (userSerial: string) {
    return httpPost<PushResponseModel>('/loginOpenid/selectSendState', {
      userSerial
    })
  },
  /**
   * 设置推送状态
   * @param userSerial 人员序号
   * @param sendStatus 发送状态： 0 允许推送； 1 不允许推送；
   */
  setPushStatus (userSerial: string, sendStatus: number) {
    return httpPost<HttpResponseModel>('/loginOpenid/updateSendState', {
      userSerial,
      sendStatus
    })
  },
  /**
   * 解除绑定
   * @param userSerial
   * @param openId
   * @param userPassword
   */
  unbindRelation (userSerial: string, openId: string, userPassword: string) {
    return httpPost<HttpResponseModel>('/user/unbindRelation', {
      userSerial,
      openId,
      userPassword
    })
  },
  /**
   * 修改密码
   * @param userSerial
   * @param newPassword
   * @param userPassword
   */
  updatePwd (userSerial: string, newPassword: string, userPassword: string) {
    return httpPost<HttpResponseModel>('/user/updatePwd', {
      userSerial,
      newPassword,
      userPassword
    })
  }
}
