/**
 * 配置信息文件
 */

/**
 * 开启状态枚举
 */
export enum OpenStatus {
  // 关闭
  close,
  // 开启
  open
}

/**
 * 语言类型
 */
export const LanguageType = {
  // 中文简体
  cn: 'zh-cn',
  // 中文繁体
  tw: 'zh-tw'
}

// 配置信息
export const config = {
  // 是否多企业
  multiCompanies: OpenStatus.close,
  // 基础地址
  baseUrl: {
    // 单企业地址
    single: './app',
    // 多企业地址
    multi: './web'
  },
  // 语言
  language: LanguageType.cn,
  // 高德地图key
  aMapKey: 'dae9f17b30c2fcce6c38fafc61c77f52'
}
