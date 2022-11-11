<template>
  <div class="we_preview_image" @click="closePreImg()">
    <nut-overlay v-model:visible="isShow" :z-index="2000">
      <div class="indication_point">{{ currentIndex }} / {{ previewImageList.length }}</div>
      <div class="preImage_content">
        <nut-swiper class="" :init-page="initPage" height="100%" @change="changeSwiper" :loop="false">
          <nut-swiper-item v-for="(item, index) in previewImageList" :key="index">
            <img :src="item" alt="" />
          </nut-swiper-item>
        </nut-swiper>
      </div>
    </nut-overlay>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, withDefaults, toRefs, defineEmits, watch } from 'vue'

interface PropType {
  // 预览图片列表
  previewImageList: string[],
  // 初始化显示第几张
  initPage?: number
  // 是否显示
  isShow: boolean
}

// prop
const props = withDefaults(defineProps<PropType>(), {
  previewImageList: () => [],
  initPage: 0,
  isShow: false
})

const {
  previewImageList,
  initPage,
  isShow
} = toRefs(props)

// emit
interface EmitType {
  (e: 'onClose', isShow: boolean): void
}

const emits = defineEmits<EmitType>()
// 滑动选中图片
const currentIndex = ref<number>(initPage.value + 1)

watch(initPage, (newVal) => {
  currentIndex.value = newVal + 1
})
// swiper 滑动事件
function changeSwiper (index: number) {
  currentIndex.value = index + 1
}
// 关闭预览
function closePreImg () {
  emits('onClose', true)
}
</script>

<style lang="scss">
  .we_preview_image {
    // 指示点
    .indication_point {
      position: absolute;
      width: 100%;
      height: 50px;
      text-align: center;
      line-height: 50px;
      color: #fff;
      top: 100px;
    }
    .preImage_content {
      position: relative;
      position: absolute;
      width: 100%;
      height: 1000px;
      top: 50%;left: 50%;
      transform: translate(-50%, -50%);
      .nut-swiper {
        height: 100%;
      }
      .nut-swiper-item {
        position: relative;
        img {
          position: absolute;
          width: 100vw;
          top: 50%;left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
</style>
