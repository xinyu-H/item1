<template>
  <div class="message-list-page" id="messageListPage">
    <nut-infiniteloading
      containerId='messageListPage'
      :use-window='false'
      :has-more="hasMore"
      @load-more="getMessageList"
    >
      <div class="message-item" v-for="(item, index) in dataList" :key="index" @click="handleMessageClick(item)">
        <div class="message-item-left-box" :class="{'no-read':item.isRead===ReadType.noRead}">
          <div class="message-item__title text-overflow-ellipsis"  >{{item.newsTitle}}</div>
          <div class="message-item__date">{{item.newsDate}}</div>
          <span class="iconfont icon-comments-fill"></span>
        </div>
        <div class="message-item-action-box">
          {{t('detail')}} <span class="iconfont icon-arrow-right"></span>
        </div>
      </div>
      <template #loading>
        <div class="loading-box">{{ hasMore ? t('loading') : t('noMoreMessage') }}</div>
      </template>
    </nut-infiniteloading>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MessageModel } from '@/api/home/model'
import store from '@/store'
import HomeBase from '@/api/home'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import { emitError } from '@/utils/error'
import { useI18n } from 'vue-i18n'
import router from '@/router'

const { t } = useI18n()

const ReadType = {
  read: 1,
  noRead: 0
}

const {
  userSerial
} = store.state.user ?? {}
const pageSize = 10
const pageIndex = ref(1)
const hasMore = ref(true)

const dataList = ref<Array<MessageModel>>([])

function getMessageList () {
  if (userSerial) {
    HomeBase.getMessageList(pageIndex.value, pageSize, userSerial.toString()).then(res => {
      if (res?.code === ResponseCode.success) {
        if (res.data && res.data.records) {
          dataList.value = [...dataList.value, ...res.data.records]
          if (res.data.totalPage <= pageIndex.value) {
            hasMore.value = false
          } else {
            pageIndex.value++
          }
        }
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    })
  }
}

// 处理详细点击
function handleMessageClick (message: MessageModel) {
  router.push('/messageDetail/' + message.xh)
}

onMounted(() => {
  dataList.value = []
  getMessageList()
})

</script>

<style lang="scss">
.message-list-page {
  height: 100%;
  overflow: scroll;

  .message-item {
    height: 164px;
    background: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    margin: 8px 12px 4px 12px;
    padding: 0 16px;

    .message-item-left-box{
      overflow: hidden;
      flex: 1;
      position: relative;
      padding-right: 40px;
      padding-left: 60px;

      &.no-read {
        &:before {
          content: '';
          background: $color-red-500;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
          top: 8px;
          left: 48px;
        }
      }

      .iconfont{
        color: $color-blue-500;
        font-size: 38px;
        position: absolute;
        top: 3px;
        left: 10px;
      }

      .message-item__title{
        width: 100%;
        color: $color-black-800;
        font-size: 32px;
        margin-bottom: 12px;
      }

      .message-item__date{
        color: $color-black-400;
      }
    }

    .message-item-action-box{
      color: $color-blue-500;
      font-size: 30px;
      .iconfont{
        font-size: 30px;
      }
    }
  }

  .loading-box{
    height: 80px;
    font-size: 30px;
  }
}
</style>
