// 分页返回值实体
export interface PagingResponseModel {
  // 总条数
  totalRecord: number,
  // 总页数
  totalPage: number,
  // 当前页数
  pageIndex: number,
  // 当前条数
  currenRecords: number,
  // 每页条数
  pageSize: number
}
