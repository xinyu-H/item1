<template>
  <div class="message-detail-page">
    <div class="message-detail-content" v-if="messageDetail">
      <div class="message-detail__title">{{ messageDetail.newsTitle }}</div>
      <div class="message-detail__date">{{ messageDetail.newsDate }}</div>
      <div class="message-detail__value">{{ messageDetail.newsValues }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import HomeApi from '@/api/home'
import store from '@/store'
import { emitError } from '@/utils/error'
import { Toast } from '@nutui/nutui'
import { useI18n } from 'vue-i18n'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import router from '@/router'
import { MessageModel } from '@/api/home/model'

const route = useRoute()
const { t } = useI18n()
const messageDetail = ref<MessageModel>()

const {
  userSerial
} = store.state.user ?? {}

function getMessageDetail () {
  if (route.params.xh && userSerial) {
    const loading = Toast.loading(t('loading'), {
      duration: 0,
      cover: true
    })
    HomeApi.getMessageDetail(route.params.xh.toString(), userSerial.toString()).then(res => {
      if (res?.code === ResponseCode.success) {
        messageDetail.value = res.data
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
        setTimeout(() => {
          router.go(-1)
        }, 2000)
      }
    }).catch(e => {
      emitError(route.path + '-' + e.toString())
    }).finally(() => {
      Toast.hide(loading.uid)
    })
  }
}

onMounted(() => {
  document.title = t('title.messageDetail')
  getMessageDetail()
})
</script>

<style lang="scss">
.message-detail-page {
  height: 100%;
  overflow: hidden;

  .message-detail-content {
    height: calc(100% - 18px);
    color: $color-black-800;
    background: white;
    overflow: scroll;
    margin-top: 18px;
    padding: 38px 66px;

    .message-detail__title {
      font-size: 32px;
      text-align: center;
      font-weight: bold;
      margin-bottom: 18px;
    }

    .message-detail__date {
      font-size: 30px;
      color: $color-black-400;
      text-align: center;
      margin-bottom: 40px;
    }

    .message-detail__value {
      font-size: 30px;
      line-height: 1.5;
    }
  }
}
</style>
