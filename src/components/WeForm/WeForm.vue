<template>
  <div class="we-form">
    <div class="we-form-header">
      <div class="we-form-header__box"></div>
      <div class="we-form-header__title">
        {{title}}
      </div>
    </div>
    <slot>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRefs, withDefaults } from 'vue'

interface PropType {
  // 标题
  title?: string
}

const props = withDefaults(defineProps<PropType>(), {
})

const {
  title
} = toRefs(props)

</script>

<style lang="scss">
.we-form{
  width: 100%;
  box-sizing: border-box;
  background: white;
  border-radius: 16px;
  line-height: 1;
  padding: 0 24px;

  .we-form-header{
    height: 88px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid $color-black-200;

    .we-form-header__title{
      font-size: 32px;
      font-weight: bold;
      color: $color-black-600;
    }
    .we-form-header__box{
      width: 9px;
      height: 32px;
      background: $color-blue-500;
      border-radius: 4px;
      margin-right: 8px;
    }
  }
}
</style>
