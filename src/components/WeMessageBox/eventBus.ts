import mitt from 'mitt'
import { MessageBoxOption, MessageBoxType } from '@/components/WeMessageBox/model'
// messagebox 的消息通道

// 消息参数
export type MessageMittOption = {
  'messageBox-open': {
    message: string,
    type: MessageBoxType,
    option?: MessageBoxOption
  },
  'messageBox-cancel': undefined,
  'messageBox-confirm': undefined
}
// 消息通道
export default mitt<MessageMittOption>()
