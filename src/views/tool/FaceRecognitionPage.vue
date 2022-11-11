<template>
  <div class="face-recognition-page">
    <div class="face-recognition-content">
      <img class="face-recognition-guide-img" :src="faceGuideImg" alt="">
      <div class="face-recognition-title">{{ t('faceRecognition.confirmSafe') }}</div>
      <div class="face-recognition-desc">{{ t('faceRecognition.tipMessage') }}</div>
      <div class="face-recognition-guide-box">
        <div class="face-recognition-guide-item">
          <div class="face-recognition-guide__icon">
            <span class="iconfont icon-shoujitianchong"></span>
          </div>
          <div class="face-recognition-guide__label">{{ t('faceRecognition.facingPhone') }}</div>
        </div>
        <div class="face-recognition-guide-item">
          <div class="face-recognition-guide__icon">
            <span class="iconfont icon-guangzhao"></span>
          </div>
          <div class="face-recognition-guide__label">{{ t('faceRecognition.enoughLight') }}</div>
        </div>
        <div class="face-recognition-guide-item">
          <div class="face-recognition-guide__icon">
            <span class="iconfont icon-kaixintianchong"></span>
          </div>
          <div class="face-recognition-guide__label">{{ t('faceRecognition.unobstructed') }}</div>
        </div>
      </div>
      <div class="face-recognition-action-box">
        <WeSelectFile @change="handelFileChange" :is-camera="true">
          <nut-button size="large" type="primary">{{ t('faceRecognition.identityVerification') }}</nut-button>
        </WeSelectFile>
      </div>
      <WeImageClip ref="weImageClipRef" @change="handelImageClip"></WeImageClip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import WeSelectFile from '@/components/WeSelectFile/index.vue'
import WeImageClip from '@/components/WeImageClip/index.vue'
import faceGuideImg from '@/assets/images/face/face-recogn-guide.png'
import { fileToBase64 } from '@/utils/tool'
import { Toast } from '@nutui/nutui'
import cache, { FaceRecognitionKey } from '@/utils/cache'
import router from '@/router'

const { t } = useI18n()
const weImageClipRef = ref()

// 处理图片选择
function handelFileChange (files: Array<File> | null) {
  if (files && files.length === 1) {
    const loading = Toast.loading(t('loading'), {
      duration: 0,
      cover: true
    })
    fileToBase64(files[0]).then((res) => {
      weImageClipRef.value.open(res)
    }).catch(() => {
      // TODO: 异常处理
    }).finally(() => {
      Toast.hide(loading.uid)
    })
  }
}

// 处理图片裁剪
function handelImageClip (file: string) {
  if (file) {
    // 将数据缓存到session中 需要直接从里面取即可 用完直接删除
    cache.session.set(FaceRecognitionKey, file)
    router.go(-1)
  }
}

onMounted(() => {
  document.title = t('title.faceRecognition')
})
</script>

<style lang="scss">
.face-recognition-page {
  height: 100%;
  position: relative;
  overflow: hidden;

  .face-recognition-content {
    height: calc(100% - 24px);
    width: calc(100% - 24px);
    border-radius: 20px;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    margin: 12px;

    .face-recognition-guide-img {
      width: 284px;
      object-fit: cover;
      margin-top: 124px;
    }

    .face-recognition-title {
      color: $color-black-800;
      font-size: 36px;
      font-weight: 500;
      margin-top: 78px;
    }

    .face-recognition-desc {
      color: $color-black-600;
      font-size: 32px;
      margin-top: 36px;
    }

    .face-recognition-guide-box {
      //width: calc(100% - 120px);
      width: 100%;
      display: flex;
      justify-content: space-around;
      margin-top: 78px;

      .face-recognition-guide-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .face-recognition-guide__icon {
          width: 132px;
          height: 132px;
          background: $color-blue-100;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;

          .iconfont {
            font-size: 64px;
            color: $color-blue-400;
          }
        }

        .face-recognition-guide__label {
          font-size: 32px;
          color: $color-black-800;
        }
      }
    }

    .face-recognition-action-box {
      width: 680px;
      position: fixed;
      bottom: 36px;

      .nut-button {
        width: 100%;
      }
    }
  }
}
</style>
