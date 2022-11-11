<template>
  <div class="scan-qr-code-page">
    <QrcodeStream class="scan-qr-code__camera" camera="rear" @decode="onDecode"
                  @init="onInit">
    </QrcodeStream>
    <!--  遮罩浮层  -->
    <div class="scan-qr-code__radar">
      <img :src="radarImg">
    </div>
    <div class="scan-qr-code__back-btn" @click="back">
      <div class="iconfont icon-arrow-left"></div>
    </div>
  </div>
</template>

<script setup name="ScanQRCodePage">
import { QrcodeStream } from 'qrcode-reader-vue3'
import { Toast } from '@nutui/nutui'
import router from '@/router'
import { scanQrCodeFun } from '@/utils/native'
import { useI18n } from 'vue-i18n'
import radarImg from '@/assets/images/home/radar.png'

const { t } = useI18n()
// 加载toast
const loadingToast = Toast.loading(t('loading'), {
  duration: 0,
  cover: true
})

/**
 * 扫描结果
 * @param res
 */
function onDecode (res) {
  if (scanQrCodeFun.resolve) {
    scanQrCodeFun.resolve(res)
  }
  // Toast.success(t('tool.readQrSuccess'))
  router.go(-1)
}

/**
 * 初始化结果
 * @param res
 */
function onInit (promise) {
  Toast.hide(loadingToast.uid)
  promise.catch(() => {
    Toast.fail(t('tool.noCameraPermission'))
    setTimeout(() => {
      router.go(-1)
      if (scanQrCodeFun.reject) {
        scanQrCodeFun.reject(t('tool.noCameraPermission'))
      }
    }, 2000)
  })
}

// 返回
function back () {
  if (scanQrCodeFun.reject) {
    scanQrCodeFun.reject()
  }
  router.go(-1)
}
</script>

<style lang="scss">
@keyframes radarScan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
    transform: translateY(-100%);
  }
}

.scan-qr-code-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: black;

  .scan-qr-code__camera {
    width: 100%;
    height: 100%;
  }

  .scan-qr-code__back-btn {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, .5);
    position: absolute;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 40px;
    left: 40px;
    z-index: 888;

    .iconfont {
      font-size: 40px;
    }
  }

  .scan-qr-code__radar {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
    animation-name: radarScan;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;

    img {
      height: 150px;
      width: 100%;
      object-fit: fill;
    }
  }

}
</style>
