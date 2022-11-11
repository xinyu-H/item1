import { httpPost } from '@/utils/request'
import {
  MenuResponseModel,
  MessagePaPagingResponseModel,
  MessageResponseModel,
  QrCodeResponseModel
} from '@/api/home/model'
import { HttpResponseModel } from '@/model/httpType'

export default {
  /**
   * 获取菜单
   * @param userId 人员序号
   * @param spareCol1 0：顶部应用；1：中间应用；
   * @param spareCol2 9：底部导航栏(spareCol1=0或不传)；2：导航我的应用（spareCol1=0或不传）；0：其他功能
   * @param companyId 公司编号，单企业默认0，多企业暂无。
   */
  getHomeMenu (userId: string, spareCol1: 0 | 1, spareCol2: 0 | 2 | 9, companyId = 0) {
    return httpPost<MenuResponseModel>('/userMenus/selectListByEntity', {
      userId,
      spareCol1,
      spareCol2,
      companyId
    })
  },
  /**
   * 获取菜单
   * @param userId 人员序号
   * @param spareCol1 0：顶部应用；1：中间应用；
   * @param spareCol2 9：底部导航栏(spareCol1=0或不传)；2：导航我的应用（spareCol1=0或不传）；0：其他功能
   * @param companyId 公司编号，单企业默认0，多企业暂无。
   */
  getAllMenu (userId: string, spareCol1: 0 | 1, spareCol2: 0 | 2 | 9, companyId = 0) {
    return httpPost<MenuResponseModel>('/systemMenus/selectListByEntity', {
      userId,
      userSerial: userId,
      useFlag: 1,
      spareCol1,
      spareCol2,
      companyId
    })
  },
  /**
   * 首页通知列表
   * @param pageIndex 页码
   * @param pageSize 每页条数
   * @param userSerial 人员序号
   */
  getMessageList (pageIndex: number, pageSize: number, userSerial: string) {
    return httpPost<MessagePaPagingResponseModel>('/nEWS/selectListPageByEntity', {
      pageIndex,
      pageSize,
      search: {
        userSerial
      }
    })
  },
  /**
   * 扫码结果
   * @param codeStr 扫码结果
   * @param userSerial 人员序号
   */
  getScanQRResult (codeStr: string, userSerial: string) {
    return httpPost<HttpResponseModel>('/ktJl/scanResult', {
      codeStr,
      userSerial
    })
  },
  /**
   * 保存用户菜单
   * @param menuIds 我的应用菜单编号，以逗号分割，按照顺序编写
   * @param userId 人员序号
   * @param companyId 公司ID，单企业传0，多企业暂无
   */
  saveMenu (menuIds: string, userId: string, companyId = 0) {
    return httpPost<HttpResponseModel>('/userMenus/insert', {
      menuIds,
      userId,
      companyId
    })
  },
  /**
   * 获取二维码
   * @param userSerial 人员序号
   */
  getQrCode (userSerial: string) {
    return httpPost<QrCodeResponseModel>('/user/getCode', {
      userSerial
    })
  },
  /**
   * 获取详细详情（未读变为已读）
   * @param xh 通知公告序号
   * @param userSerial 人员序号
   */
  getMessageDetail (xh: string, userSerial: string) {
    return httpPost<MessageResponseModel>('/nEWS/selectByPrimaryKey', {
      xh,
      userSerial
    })
  }
}
