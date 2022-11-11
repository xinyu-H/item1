// 卡类型
import { HttpResponseModel } from '@/model/httpType'

export interface CardModel {
  // 卡状态：0 无卡；1 正常；2 挂失
  userLx: 0 | 1 | 2,
  // 卡号
  userCard?: string
}

// 卡返回类型
export interface CardResponseModel extends HttpResponseModel {
  data: CardModel
}

// 获取消息推送状态
export interface PushResponseModel extends HttpResponseModel {
  data: {
    // 消息推送状态：0开启；1关闭；
    sendStatus: 0 | 1
  }
}
