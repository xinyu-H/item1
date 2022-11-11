<template>
  <div class="we-message-mask" v-if="_open">
    <div class="we-message">
      <div class="we-message-content" :class="contentClass">
        <div v-if="_icon" class="we-message__icon iconfont" :class="_icon"></div>
        <div v-if="_title" class="we-message__title" :class="{'icon':_icon}">
          {{ _title }}
        </div>
        <div v-if="_message" class="we-message__message" :class="classByBtn">
          {{ _message }}
        </div>
        <div v-if="_cancelBtn||_confirmBtn" class="we-message-action-box">
          <nut-button v-if="_cancelBtn" class="we-message__button" @click="close">{{
              _cancelBtn
            }}
          </nut-button>
          <nut-button v-if="_confirmBtn" type="primary" class="we-message__button" @click="confirm">{{
              _confirmBtn
            }}
          </nut-button>
        </div>
        <div v-else class="occupy-box"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineExpose, nextTick, ref } from 'vue'
import { MessageBoxExposeType, MessageBoxOption, MessageBoxType } from '@/components/WeMessageBox/model'
import messageEventBus from '@/components/WeMessageBox/eventBus'

// 信息
const _message = ref<string>()
// 是否打开
const _open = ref<boolean>()
// 图标
const _icon = ref<string | null>()
// 标题
const _title = ref<string | null>()
// 类型
const _type = ref<MessageBoxType>(MessageBoxType.normal)
// 确认按钮
const _confirmBtn = ref<string | null>()
// 取消按钮
const _cancelBtn = ref<string | null>()

// 根据按钮调整样类名
const classByBtn = computed(() => {
  const classList: Array<string> = []
  // 两个按钮都存在
  if (_confirmBtn.value && _cancelBtn.value) {
    classList.push('two-btn')
  } else if (_confirmBtn.value || _cancelBtn.value) {
    classList.push('one-btn')
  } else {
    classList.push('no-btn')
  }
  return classList
})

// 内容样式
const contentClass = computed(() => {
  const classList: Array<string> = []

  switch (_type.value) {
    case MessageBoxType.error:
      classList.push('error-message')
      break
    case MessageBoxType.warning:
      classList.push('warning-message')
      break
    case MessageBoxType.success:
      classList.push('success-message')
      break
  }

  return [...classList, ...classByBtn.value]
})

// 打开消息提示
function showMessage (message: string, type: MessageBoxType = MessageBoxType.normal, option?: MessageBoxOption) {
  nextTick(() => {
    _message.value = message
    _type.value = type
    _open.value = true
    if (option) {
      _title.value = option.title
      _icon.value = option.icon
      _confirmBtn.value = option.confirmBtn
      _cancelBtn.value = option.cancelBtn
    }

    if (option && option.closeMillisecond) {
      setTimeout(() => {
        confirm()
      }, option.closeMillisecond)
    }
  })
}

function confirm () {
  _open.value = false
  messageEventBus.emit('messageBox-confirm')
}

function close () {
  _open.value = false
  messageEventBus.emit('messageBox-cancel')
}

defineExpose<MessageBoxExposeType>({
  showMessage
})
</script>

<style lang="scss">
.we-message-mask {
  width: 100%;
  height: 100%;
  position: absolute;
  background: rgba(0,0,0,.5);
  z-index: 100;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .we-message {
    width: 550px;
    background: white;
    border-radius: 16px;
    padding: 62px 36px 30px;

    .we-message-content {
      display: flex;
      flex-direction: column;
      align-items: center;

      &.error-message {
        .we-message__icon, .we-message__title {
          color: $color-red-500;
        }
      }

      &.warning-message {
        .we-message__icon, .we-message__title {
          color: $color-yellow-500;
        }
      }

      &.success-message {
        .we-message__icon, .we-message__title {
          color: $color-green-500;
        }
      }

      &.one-btn {
        .we-message__button {
          width: 100%;
        }
      }

      &.two-btn {
        .we-message__button {
          width: 40%;
        }
      }

      .we-message__icon {
        font-size: 140px;
        margin-bottom: 10px;
      }

      .we-message__title {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 36px;

        &.icon {
          margin-bottom: 14px;
        }
      }

      .we-message__message {
        font-size: 32px;
        text-align: center;
        margin-bottom: 60px;

        &.no-btn {
          margin-bottom: 0;
        }
      }

      .we-message-action-box {
        width: 100%;
        display: flex;
        justify-content: center;

        .we-message__button {
          & + .we-message__button {
            margin-left: 42px;
          }
        }
      }

      .occupy-box {
        height: 32px;
      }
    }
  }
}

</style>
