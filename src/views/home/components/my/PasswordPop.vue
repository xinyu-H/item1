<template>
  <nut-popup pop-class="unbind-password-pop" v-model:visible="isShowPop"
             :z-index="10"
             :close-on-click-overlay="false">
    <div class="unbind-password__title">{{ t('my.pleaseEnterPassword') }}</div>
    <nut-input class="unbind-password__input" input-align="center" type="password" placeholder=" " v-model="password"></nut-input>
    <div class="unbind-password-action-box">
      <nut-button class="unbind-password__button" @click="close">{{
          t('cancel')
        }}
      </nut-button>
      <nut-button class="unbind-password__button" type="primary" @click="confirm">{{
          t('confirm')
        }}
      </nut-button>
    </div>
  </nut-popup>
</template>

<script setup lang="ts">
import { defineExpose, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showErrorMessage } from '@/utils/messageBox'

const { t } = useI18n()

// 是否显示弹窗
const isShowPop = ref(false)
// 密码
const password = ref('')
const promiseFun: {
  resolve: ((value: string) => void) | undefined,
  reject: (() => void) | undefined
} = {
  resolve: undefined,
  reject: undefined
}

function openPop () {
  isShowPop.value = true
  password.value = ''

  return new Promise<string>((resolve, reject) => {
    promiseFun.resolve = resolve
    promiseFun.reject = reject
  })
}

function confirm () {
  if (!password.value) {
    showErrorMessage(t('my.pleaseEnterPassword'))
    return
  }
  if (promiseFun.resolve) {
    promiseFun.resolve(password.value)
    isShowPop.value = false
  }
}

function close () {
  if (promiseFun.reject) {
    promiseFun.reject()
    isShowPop.value = false
  }
}

interface ExposeType {
  openPop: () => Promise<string>
}

defineExpose<ExposeType>({
  openPop
})
</script>

<style lang="scss">
.unbind-password-pop {
  width: 584px;
  background: white;
  box-sizing: border-box;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 62px 80px 20px;

  .unbind-password__title {
    color: $color-black-800;
    font-size: 36px;
    text-align: center;
    line-height: 1;
  }

  .unbind-password__input {
    border: 1px solid $color-black-300;
    margin: 43px 0 50px;
  }

  .unbind-password-action-box {
    display: flex;
    justify-content: space-between;

    .unbind-password__button {
      width: 192px;
    }
  }
}
</style>
