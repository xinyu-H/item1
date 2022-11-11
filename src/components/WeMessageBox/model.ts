// 消息提示类型
export enum MessageBoxType {
  // 成功
  success,
  // 警告
  warning,
  // 失败
  error,
  // 正常
  normal
}

// 弹窗配置
export interface MessageBoxOption {
  // 标题
  title?: string,
  // 图标
  icon?: string,
  // 确认按钮
  confirmBtn?: string,
  // 取消按钮
  cancelBtn?: string,
  // 自动关闭的时间 不传就是一直不关
  closeMillisecond?: number
}

export interface MessageBoxExposeType {
  showMessage: (message: string, type: MessageBoxType, option?: MessageBoxOption) => void,
}
