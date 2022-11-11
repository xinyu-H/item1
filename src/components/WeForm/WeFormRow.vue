<template>
  <div class="we-form-row" :class="{'vertical':isVertical}">
    <div class="we-form-row-label">
      <div class="we-form-row-require-box" v-if="isRequire">*</div>
      <div class="we-form-row-label__content" v-html="label"></div>
    </div>
    <div class="we-form-row-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRefs, withDefaults } from 'vue'

interface PropType {
  label?: string,
  // 是否必填
  isRequire?: boolean,
  // 是否竖直排列
  isVertical?: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  isRequire: false,
  isVertical: false
})

const {
  label,
  isRequire,
  isVertical
} = toRefs(props)

</script>

<style lang="scss">
.we-form-row {
  min-height: 80px;
  display: flex;
  align-items: center;
  padding: 16px 0;

  &.vertical {
    flex-direction: column;

    .we-form-row-label{
      width: 100%;
    }

    .we-form-row-content{
      width: 100%;
      justify-content:flex-start;
      margin-top: 26px;
    }
  }

  .we-form-row-label {
    width: 50%;
    font-size: 32px;
    color: $color-black-500;
    display: flex;

    .we-form-row-require-box {
      color: $color-red-500;
    }

    .we-form-row-label__content {
      flex: 1;
      overflow-wrap: anywhere;
    }
  }

  .we-form-row-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
