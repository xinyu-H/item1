<template>
  <div class="image-clip-test">
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
    <WeSelectFile @change="handelFileChange" :is-camera="true">
      <nut-button type="primary">照相</nut-button>
    </WeSelectFile>
    <nut-button @click="getData">get</nut-button>
    <img :src="imgData" alt="">
  </div>
</template>

<script lang="ts" setup>
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { nextTick, onMounted, ref } from 'vue'
import WeSelectFile from '@/components/WeSelectFile/index.vue'
import { fileToBase64 } from '@/utils/tool'

// refs
const cropper = ref()

const selectedImg = ref('')
const imgData = ref('')
const enlarge = ref(1)

function handelFileChange (files: Array<File> | null) {
  if (files) {
    // selectedImg.value = files[0].
    fileToBase64(files[0]).then((res) => {
      selectedImg.value = res?.toString() || ''
    })
  }
}

function getData () {
  if (cropper.value) {
    cropper.value.getCropData((data: any) => {
      // do something
      imgData.value = data
    })
  }
}

onMounted(() => {
  nextTick(() => {
    enlarge.value = 780 / (window.screen.width * 0.8)
  })
})
</script>

<style lang="scss">
.image-clip-test {
  height: 100%;
}
</style>
