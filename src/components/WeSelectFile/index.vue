<template>
  <span class="we-uploader" @click="handleSelect">
    <slot></slot>
    <input ref="inputRef" type="file"
           :accept="accept"
           v-bind="attr"
           @change="handleChange"/>
  </span>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, toRefs, withDefaults } from 'vue'

// refs
const inputRef = ref()

// prop
interface PropType {
  // 是否是相机，如果不是相机，可以进行选择是相机还是文件
  isCamera?: boolean,
  // 是否多选，默认单选
  isMultiple?: boolean,
  // 文件类型,默认图片
  accept?: string
}

// prop
const props = withDefaults(defineProps<PropType>(), {
  isCamera: false,
  isMultiple: false,
  accept: 'image/*'
})

// emit
interface EmitType {
  (e: 'change', files: Array<File> | null): void
}

const emits = defineEmits<EmitType>()

const {
  isCamera,
  isMultiple,
  accept
} = toRefs(props)

const attr = computed(() => {
  const res: any = {}
  if (isCamera.value) {
    res.capture = 'camera'
  }
  if (isMultiple.value) {
    res.multiple = ''
  }
  return res
})

function handleSelect () {
  inputRef.value.click()
}

function handleChange () {
  emits('change', inputRef.value.files)
  inputRef.value.value = ''
}
</script>

<style lang="scss">
.we-uploader {
  input {
    display: none;
  }
}
</style>
