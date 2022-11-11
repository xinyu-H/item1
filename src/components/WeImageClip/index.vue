<template>
  <div class="we-image-clip" :class="{'open':isOpen}">
    <div class="we-image-clip-close-btn" @click="close">
      <span class="iconfont icon-close"></span>
    </div>
    <div class="we-image-clip-content">
      <VueCropper
        ref="cropper"
        :img="selectedImg"
        :outputSize=".8"
        :info="false"
        outputType="jpeg"
        :auto-crop="true"
        :fixedBox="true"
        :canMoveBox="false"
        :fixed="true"
        :enlarge="enlarge"
        :fixedNumber="[780,1080]"
      ></VueCropper>
      <div class="we-image-clip-mask">
        <img :src="faceMask">
      </div>
    </div>
    <div class="we-image-clip-action-box">
      <div class="we-image-clip-tips"><span class="iconfont icon-tishi"></span> {{ t('faceRecognition.clipTips') }}
      </div>
      <div class="we-image-clip-rotate"><span class="iconfont icon-xuanzhuan" @click="rotate"></span> {{ t('faceRecognition.rotate') }}
      </div>
      <nut-button type="primary" @click="getData">{{ t('complete') }}</nut-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, defineExpose, nextTick, onMounted, ref } from 'vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import faceMask from '@/assets/images/face/face-mask.png'
import { ImageClipExposeType } from '@/components/WeImageClip/model'
import { useI18n } from 'vue-i18n'

// refs
const cropper = ref()
const { t } = useI18n()

interface EmitType {
  // 图片选择好了之后返回 base64
  (e: 'change', value: string): void,
}

// emits
const emits = defineEmits<EmitType>()

// 选择的图片
const selectedImg = ref('')
// 放大比例
const enlarge = ref(1)
// 是否打开
const isOpen = ref(false)

// 获取裁剪后的数据
function getData () {
  if (cropper.value) {
    cropper.value.getCropData((data: any) => {
      isOpen.value = false
      emits('change', data)
    })
  }
}

// 关闭
function close () {
  isOpen.value = false
}

// 旋转
function rotate () {
  cropper.value.rotateLeft()
}

// 打开
function open (imgData: string) {
  isOpen.value = true
  selectedImg.value = imgData
}

defineExpose<ImageClipExposeType>({
  open
})

onMounted(() => {
  nextTick(() => {
    enlarge.value = 780 / (window.screen.width * 0.8)
  })
})

</script>

<style lang="scss">
.we-image-clip {
  height: calc(100% - 32px);
  width: 100%;
  position: absolute;
  top: 200%;
  left: 0;
  opacity: 0;
  transition: .24s;

  &.open {
    top: 32px;
    opacity: 1;
    z-index: 10;
  }

  .we-image-clip-close-btn {
    width: 62px;
    height: 62px;
    background: rgba(225, 225, 225, .3);
    position: absolute;
    right: 0;
    top: 0;
    z-index: 11;
    border-radius: 0 0 0 100%;

    .iconfont {
      position: absolute;
      top: 15%;
      right: 10%;
      color: white;
      font-size: 32px;
    }
  }

  $actionBoxHeight: 130px;

  .we-image-clip-content {
    height: calc(100% - $actionBoxHeight);
    position: relative;

    .we-image-clip-mask {
      width: 460px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -60%);
      pointer-events: none;

      img {
        width: 100%;
        object-fit: cover;
      }
    }
  }

  .we-image-clip-action-box {
    height: $actionBoxHeight;
    background: white;
    display: flex;
    align-items: center;
    padding: 0 28px;

    .we-image-clip-tips {
      flex: 1;
      font-size: 28px;
      color: $color-black-600;
      display: flex;
      align-items: center;

      .iconfont {
        font-size: 28px;
        margin-right: 6px;
      }
    }

    .we-image-clip-rotate {
      color: $color-black-800;
      font-size: 32px;
      padding: 16px;
      margin-right: 16px;

      .iconfont {
        font-size: 32px;
        margin-right: 6px;
      }
    }
  }
}
</style>
