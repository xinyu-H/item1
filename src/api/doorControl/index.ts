import { httpPost } from '@/utils/request'
import {
  ChangeLocationModel,
  DoorControlListModel
} from '@/api/doorControl/model'
import { HttpResponseModel } from '@/model/httpType'

export default {
  /**
   * 查询门列表
   */
  getDoorControlList (userSerial: number) {
    return httpPost<DoorControlListModel>('/mjMobile/selectDoorList', {
      userSerial
    })
  },
  /**
   * 点击开门
   */
  clickOpen (gateBh:string, userSerial:number) {
    return httpPost<HttpResponseModel>('/mjMobile/openDoor', {
      // 门编号
      gateBh,
      // 人员序号
      userSerial
    })
  },
  /**
   * 拖动更换门顺序
   */
  changeLocation (params: ChangeLocationModel) {
    return httpPost<HttpResponseModel>('/mjMobile/updateGateOrder', {
      params
    })
  }
}
