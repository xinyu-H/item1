// 菜单类型
export interface MenuModel {
  // 图标名称
  icon: string,
  // 图标
  iconFamily: string | undefined,
  // 跳转路径
  url: string,
  // 标题
  menuTitle: string,
  // 菜单ID
  menuId:string
}
