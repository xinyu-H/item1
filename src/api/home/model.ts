// 求情获取菜单的参数 0：顶部应用；1：中间应用；
import { HttpResponseModel } from '@/model/httpType'
import { PagingResponseModel } from '@/api/model'

// 菜单类型
export interface MenuModel {
  // 公司ID
  companyId: string,
  // 菜单ID
  menuId: string,
  // 菜单名称
  menuName: string,
  // 图标编号
  iconId: string,
  // URL编号
  iconUrlId: string,
  // 功能顺序
  menuIdx: number,
  // 默认功能：0不在首页显示；1在首页显示；
  userFlag: 0 | 1 | undefined,
  // 是否启用：0不启用；1启用；无实际意义
  useFlag: 0 | 1 | undefined
}

// 菜单返回类型
export interface MenuResponseModel extends HttpResponseModel {
  data: Array<MenuModel>
}

// 消息实体
export interface MessageModel {
  // 通知唯一序号
  xh: number,
  // 类型：0 新闻；1通知
  lx: number
  // 通知标题
  newsTitle: string,
  // 通知内容
  newsValues: string,
  // 通知发布时间
  newsDate: string,
  // 发布人
  glyNo: string,
  // 消息是否已读 0 未读；1 已读
  isRead: number
}

// 消息分页实体
export interface MessagePaPagingModel extends PagingResponseModel {
  records: Array<MessageModel>
}

// 消息查询实体
export interface MessagePaPagingResponseModel extends HttpResponseModel {
  data: MessagePaPagingModel
}

// 获取二维码
export interface QrCodeResponseModel extends HttpResponseModel {
  data: {
    codeStr:string
  }
}

// 通知公告详情
export interface MessageResponseModel extends HttpResponseModel {
  data: MessageModel
}
