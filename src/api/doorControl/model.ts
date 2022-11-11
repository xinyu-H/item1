/**
 *  门禁
 */
import { HttpResponseModel } from '@/model/httpType'
// 查询门禁列表
export interface DoorControlListModel extends HttpResponseModel{
    data : Array<{
      // 门编号
      gateBh:string,
      // 门顺序号
      gateOrder:number,
      // 门名称
      doorName:string,
      // 门状态
      onlineState:number
     }>
  }
  // 点击开门
export interface ClickOpenModel {
  // 门编号
  gateBh:string,
  // 人员序号
  userSerial: number,
}
// 更改门顺序
export interface ChangeLocationModel {
  doorList: Array<{
    // 门编号
    gateBh:string,
    // 门顺序号
    gateOrder:number,
  }>,
  // 人员序号
  userSerial: number,
}
