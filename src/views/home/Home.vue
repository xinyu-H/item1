<template>
  <div class="home-page">
    <HomeHeader @loaded="headerLoaded=true"></HomeHeader>
    <div class="home-content">
      <MyApplication @loaded="applicationLoaded=true"></MyApplication>
      <MessageList ref="messageListRef" @loaded="messageListLoaded=true"></MessageList>
    </div>
  </div>
</template>

<script setup lang="ts">
import HomeHeader from './components/home/HomeHeader.vue'
import MyApplication from './components/home/MyApplication.vue'
import MessageList from './components/home/MessageList.vue'
import { ref, watchEffect } from 'vue'
import { Toast } from '@nutui/nutui'
import { useI18n } from 'vue-i18n'
import { getEnv } from '@/utils/env'
import { EnvType } from '@/model/envType'
import BaseApi from '@/api/base'
import { wxConfig } from '@/utils/wxApi'
import { ResponseCode } from '@/model/httpType'
import { emitError } from '@/utils/error'

const { t } = useI18n()
// refs
const messageListRef = ref()

// 头部加载完成
const headerLoaded = ref(false)
// 应用加载完成
const applicationLoaded = ref(false)
// 消息加载完成
const messageListLoaded = ref(false)
const loading = Toast.loading(t('loading'), {
  duration: 0,
  cover: true
})

watchEffect(() => {
  if (headerLoaded.value && applicationLoaded.value && messageListLoaded.value) {
    Toast.hide(loading.uid)
  }
})

watchEffect(() => {
  if (headerLoaded.value && applicationLoaded.value) {
    if (messageListRef.value) {
      messageListRef.value.init()
    }
  }
})
if (getEnv() === EnvType.wx) {
  // 初始化微信相关接口
  BaseApi.getWXConfig(window.location.href.split('#')[0]).then(res => {
    if (res?.code === ResponseCode.success) {
      wxConfig(res.data)
    } else {
      emitError('getWXConfig' + res?.msg)
    }
  })
}
document.title = t('title.home')
</script>

<style lang="scss">
.home-page {
  height: 100%;

  .home-content {
    height: calc(100% - 300px);
    overflow: scroll;
    display: flex;
    flex-direction: column;
  }
}
</style>
