<template>
  <div class="my-qr-code">
    <img class="qr-code-bottom-bg" :src="bgImg">
    <div class="my-qr-code-header">
      <div class="y-center">
        <span class="iconfont icon-jiantouzuo"></span>
        <span class="iconfont icon-jiantouzuo"></span>
        <span class="iconfont icon-jiantouzuo"></span>
      </div>
      <div class="header-content">
        {{ t('qrCode.title') }}
      </div>
      <div class="y-center">
        <span class="iconfont icon-jiantouyou"></span>
        <span class="iconfont icon-jiantouyou"></span>
        <span class="iconfont icon-jiantouyou"></span>
      </div>
    </div>

    <div class="my-qr-code-content">
      <div class="qr-code__title">{{ t('qrCode.purpose') }}</div>
      <div class="qr-code-box">
        <div class="qr-code__img" ref="imgRef" @click="getQrCode">
          <QrcodeVue :value="qrCode" :size="qrSize"></QrcodeVue>
        </div>
        <div class="qr-code__desc">
          {{ t('qrCode.desc') }}
        </div>
      </div>
      <img class="work-man-img" :src="manImg" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
import store from '@/store'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QrcodeVue from 'qrcode.vue'
import manImg from '@/assets/images/qrCode/man.png'
import HomeAPi from '@/api/home/index'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import { Toast } from '@nutui/nutui'
import router from '@/router'
import bgImg from '@/assets/images/qrCode/bg.png'

const { t } = useI18n()

// refs
const imgRef = ref()

const {
  userSerial
} = store.state.user ?? {}
const qrSize = ref(100)
const qrCode = ref('')
let timer: number | null = null

function getQrCode () {
  if (userSerial) {
    const loading = Toast.loading(t('loading'), {
      duration: 0,
      cover: true
    })
    HomeAPi.getQrCode(userSerial.toString()).then(res => {
      if (res?.code === ResponseCode.success) {
        qrCode.value = res.data.codeStr
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
        setTimeout(() => {
          router.go(-1)
        }, 2000)
      }
    }).finally(() => {
      Toast.hide(loading.uid)
    })
  }
}

onMounted(() => {
  document.title = t('title.qrCode')
  nextTick(() => {
    if (imgRef.value) {
      qrSize.value = imgRef.value.clientHeight
    }
    getQrCode()
    timer = setInterval(getQrCode, 30 * 1000)
  })
})
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss">
.my-qr-code {
  height: 100%;
  background: linear-gradient(180deg, #2BB5FF, #007DFF, #0067FF);
  background-size: cover;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  .qr-code-bottom-bg{
    position: absolute;
    width: 100%;
    object-fit: cover;
    left: 0;
    bottom: 0;
  }

  .my-qr-code-header {
    display: flex;
    align-items: center;
    line-height: 1;
    margin-top: 80px;

    .header-content {
      width: 384px;
      height: 60px;
      color: white;
      font-size: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid rgba(255, 255, 255, .36);
      border-bottom: 1px solid rgba(255, 255, 255, .36);
      margin: 0 10px;
    }

    .iconfont {
      font-size: 28px;
      color: rgba(156, 220, 255, .68);
      line-height: 1;
      margin: 0 5px;
    }
  }

  .my-qr-code-content {
    width: 612px;
    height: 750px;
    border-radius: 12px;
    margin-top: 80px;
    position: relative;
    z-index: 10;

    .qr-code__title {
      height: 82px;
      font-size: 32px;
      color: white;
      border-radius: 12px 12px 0 0;
      background: $color-blue-500;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-code-box {
      width: 100%;
      height: calc(100% - 82px);
      background: white;
      border-radius: 0 0 12px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .qr-code__img {
        width: 472px;
        height: 472px;
        margin-top: 48px;
        margin-bottom: 50px;
      }

      .qr-code__desc {
        color: $color-black-800;
        font-size: 32px;
      }

    }

    .work-man-img {
      width: 215px;
      object-fit: cover;
      position: absolute;
      bottom: -120px;
      left: -52px;
    }

  }
}
</style>
