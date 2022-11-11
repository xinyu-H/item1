import { MessageBoxOption, MessageBoxType } from '@/components/WeMessageBox/model'
import messageEventBus from '@/components/WeMessageBox/eventBus'

export enum MessageBoxStatus {
  cancel,
  confirm
}

// 默认两秒关闭
export function setCloseMessageTime (option?: MessageBoxOption) {
  if (!option) {
    option = {}
  }
  if (!option.closeMillisecond) {
    option.closeMillisecond = 2 * 1000
  }
  return option
}

// 设置默认显示的图标 如果想不显示图标 icon设置为空字符串
export function setIcon (type: MessageBoxType, option?: MessageBoxOption) {
  if (!option) {
    option = {}
  }
  if (option.icon == null) {
    switch (type) {
      case MessageBoxType.success:
        option.icon = 'icon-success'
        break
      case MessageBoxType.warning:
        option.icon = 'icon-prompt'
        break
      case MessageBoxType.error:
        option.icon = 'icon-close-circle'
        break
      case MessageBoxType.normal:
        option.icon = 'icon-prompt'
        break
    }
  }
  return option
}

function showMessage (message: string, type: MessageBoxType, option?: MessageBoxOption) {
  return new Promise((resolve, reject) => {
    messageEventBus.emit('messageBox-open', {
      message: message,
      type: type,
      option: option
    })

    messageEventBus.on('messageBox-cancel', () => {
      reject(MessageBoxStatus.cancel)
    })
    messageEventBus.on('messageBox-confirm', () => {
      resolve(MessageBoxStatus.confirm)
    })
  })
}

// 显示成功消息
export function showSuccessMessageBox (message: string, option?: MessageBoxOption) {
  option = setIcon(MessageBoxType.success, option)
  return showMessage(message, MessageBoxType.success, option)
}

// 显示警告消息
export function showWarningMessageBox (message: string, option?: MessageBoxOption) {
  option = setIcon(MessageBoxType.warning, option)
  return showMessage(message, MessageBoxType.warning, option)
}

// 显示异常消息
export function showErrorMessageBox (message: string, option?: MessageBoxOption) {
  option = setIcon(MessageBoxType.error, option)
  return showMessage(message, MessageBoxType.error, option)
}

// 显示普通消息
export function showNormalMessageBox (message: string, option?: MessageBoxOption) {
  option = setIcon(MessageBoxType.normal, option)
  return showMessage(message, MessageBoxType.normal, option)
}

// 显示成功消息(一段时间自动关闭)
export function showSuccessMessage (message: string, option?: MessageBoxOption) {
  option = setCloseMessageTime(option)
  option = setIcon(MessageBoxType.success, option)
  return showMessage(message, MessageBoxType.success, option)
}

// 显示警告消息(一段时间自动关闭)
export function showWarningMessage (message: string, option?: MessageBoxOption) {
  option = setCloseMessageTime(option)
  option = setIcon(MessageBoxType.normal, option)
  return showMessage(message, MessageBoxType.warning, option)
}

// 显示异常消息(一段时间自动关闭)
export function showErrorMessage (message: string, option?: MessageBoxOption) {
  option = setCloseMessageTime(option)
  option = setIcon(MessageBoxType.normal, option)
  return showMessage(message, MessageBoxType.error, option)
}

// 显示普通消息(一段时间自动关闭)
export function showNormalMessage (message: string, option?: MessageBoxOption) {
  option = setCloseMessageTime(option)
  option = setIcon(MessageBoxType.normal, option)
  return showMessage(message, MessageBoxType.normal, option)
}
