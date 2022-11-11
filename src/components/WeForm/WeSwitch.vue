<template>
  <div class="we-switch" :class="{'open':value}" @click="handleClick">
    <div class="we-switch__btn"></div>
    <div class="we-switch-active-text" v-if="value&&activeText">{{ activeText }}</div>
    <div class="we-switch-inactive-text" v-if="!value&&inactiveText">{{ inactiveText }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, toRefs, withDefaults } from 'vue'

interface PropType {
  // 绑定的值
  value?: boolean,
  // 打开时候的描述
  activeText?: string
  // 关闭时候的描述
  inactiveText?: string
}

const props = withDefaults(defineProps<PropType>(), {
  value: false
})

const {
  value,
  activeText,
  inactiveText
} = toRefs(props)

interface EmitType {
  // value绑定提交
  (e: 'update:value', value: boolean): void,
}

const emits = defineEmits<EmitType>()

function handleClick () {
  emits('update:value', !value.value)
}

</script>

<style lang="scss">
.we-switch {
  height: 54px;
  min-width: 100px;
  background: $color-black-100;
  border: 1px solid $color-black-300;
  border-radius: 30px;
  position: relative;
  display: inline-flex;
  align-items: center;
  transition: all .24s;

  &.open {
    background: $color-blue-500;

    .we-switch__btn {
      left: calc(100% - 52px);
    }
  }

  .we-switch__btn {
    height: 46px;
    width: 46px;
    background: white;
    border: 1px solid $color-black-300;
    box-shadow: 1px 0px 1px 0px rgba(165, 165, 165, 0.3300);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    transition: left .32s;
  }

  .we-switch-inactive-text {
    color: $color-blue-500;
    font-size: 28px;
    margin-left: 60px;
    margin-right: 16px;
  }

  .we-switch-active-text {
    color: white;
    font-size: 28px;
    margin-right: 60px;
    margin-left: 16px;
  }

}
</style>
