<template>
  <div class="message-list">
    <div class="message-list-header x-between y-center">
      <span class="message-header__title">{{ t('home.noticeMessage') }}</span>
      <span class="message-header__btn" @click="handleMoreBtnClick">{{ t('more') }} <span
        class="iconfont icon-arrow-right"></span></span>
    </div>
    <div class="message-list-content" ref="messageContentRef">
      <template v-if="messageList.length">
        <div v-for="(item,index) in messageList" :key="index" class="message-list-item x-between y-center"
             @click="handleMessageClick(item)">
          <div class="message-item__title text-overflow-ellipsis"
               :class="{'no-read':item.isRead===ReadType.noRead}"
          >{{ item.newsTitle }}
          </div>
          <div class="message-item__date">{{ item.newsDate }}</div>
        </div>
      </template>
      <template v-else>
        <div class="no-message x-center y-center">
          <img :src="noMessageImg">
          <div>{{ t('home.noMessage') }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, defineExpose, nextTick, ref } from 'vue'
import store from '@/store'
import { useI18n } from 'vue-i18n'
import { MessageModel } from '@/api/home/model'
import noMessageImg from '@/assets/images/home/no-message.png'
import HomeBase from '@/api/home/index'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import { emitError } from '@/utils/error'
import router from '@/router'

const { t } = useI18n()

// refs
const messageContentRef = ref()

const ReadType = {
  read: 1,
  noRead: 0
}

interface EmitType {
  // 加载完成
  (e: 'loaded'): void,
}

const emits = defineEmits<EmitType>()

const {
  userSerial
} = store.state.user ?? {}

// 消息列表
const messageList = ref<Array<MessageModel>>([])
// 最多显示多少条数据
const maxMessageCount = ref(3)

// 获取消息逆袭
function getMessageList () {
  if (userSerial) {
    HomeBase.getMessageList(0, maxMessageCount.value, userSerial.toString()).then(res => {
      if (res?.code === ResponseCode.success) {
        if (res.data && res.data.records) {
          messageList.value = res.data.records
          messageList.value.forEach(item => {
            item.newsDate = item.newsDate.substring(0, 16)
          })
        }
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    }).finally(() => {
      emits('loaded')
    })
  }
}

// 获取最多放几条信息
function getItemMaxCount () {
  const windowWidth = window.screen.width
  maxMessageCount.value = messageContentRef?.value.offsetHeight / (70 * windowWidth / 750)
}

// 处理详细点击
function handleMessageClick (message: MessageModel) {
  router.push('/messageDetail/' + message.xh)
}

// 更多点击时间
function handleMoreBtnClick () {
  router.push('/messageList')
}

function init () {
  nextTick(() => {
    getItemMaxCount()
    getMessageList()
  })
}

export interface ExposeType {
  init: () => void,
}

defineExpose<ExposeType>({
  init
})
</script>

<style lang="scss">
.home-page {
  .message-list {
    flex: 1;
    width: calc(100% - 24px);
    background: white;
    box-sizing: border-box;
    border-radius: 16px;
    margin: 14px 12px 0;
    padding: 38px 30px;

    .message-list-header {
      margin-bottom: 38px;

      .message-header__title {
        color: $color-black-800;
        font-size: 32px;
        font-weight: Bold;
      }

      .message-header__btn {
        color: $color-black-700;
        font-size: 28px;

        .iconfont {
          color: $color-black-400;
          font-size: 28px;
        }
      }
    }

    .message-list-content {
      height: calc(100% - 70px);
      min-height: 210px;

      .message-list-item {
        height: 70px;

        .message-item__title {
          width: 60%;
          color: $color-black-800;
          font-size: 30px;
          padding-left: 18px;
          position: relative;

          &.no-read {
            &:before {
              content: '';
              background: $color-red-500;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              position: absolute;
              top: 8px;
              left: 0;
            }
          }
        }

        .message-item__date {
          color: $color-black-600;
          font-size: 28px;
        }
      }

      .no-message {
        height: 100%;
        display: flex;
        flex-direction: column;

        img {
          height: 166px;
          margin-bottom: 22px;
        }

        div {
          color: $color-black-600;
          font-size: 28px;
        }
      }
    }
  }
}
</style>
