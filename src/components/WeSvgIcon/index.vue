<template>
  <svg
    :class="svgClass"
    aria-hidden="true"
  >
    <use
      :xlink:href="iconName"
      :fill="color"
    />
  </svg>
</template>

<script lang="ts" setup>
import { defineProps, toRefs, withDefaults } from 'vue'

interface PropType {
  iconName: string,
  svgClass?: string,
  color?: string
}

const props = withDefaults(defineProps<PropType>(), {
  color: '',
  svgClass: ''
})

const {
  iconName,
  svgClass,
  color
} = toRefs(props)

</script>

<style lang="scss">
</style>
