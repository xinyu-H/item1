<template>
  <div class="change-password-page">
    <div class="password-box">
      <div class="password-input-box">
        <div class="password__label">{{ t('password.oldPassword') }}:</div>
        <nut-input class="password__input" v-model="password" :placeholder="t('password.pleaseEnterOldPassword')"
                   :border="false" clearable clear-icon="circle-close"
                   type="password"></nut-input>
      </div>
    </div>
    <div class="password-box">
      <div class="password-input-box">
        <div class="password__label">{{ t('password.newPassword') }}:</div>
        <nut-input class="password__input" v-model="newPassword" :placeholder="t('password.pleaseEnterNewPassword')"
                   :border="false" :max-length="11" clearable clear-icon="circle-close"
                   type="password"></nut-input>
      </div>
      <div class="password-input-box">
        <div class="password__label">{{ t('password.newPassword') }}:</div>
        <nut-input class="password__input" v-model="reNewPassword" :placeholder="t('password.pleaseReEnterNewPassword')"
                   :border="false" :max-length="11" clearable clear-icon="circle-close"
                   type="password"></nut-input>
      </div>
    </div>
    <div class="change-password__desc">{{ t('password.beCareful') + t('password.formatTip') }}</div>
    <nut-button class="change-password__button" @click="submit" type="primary">{{ t('confirm') }}</nut-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showErrorMessage } from '@/utils/messageBox'
import MyApi from '@/api/my/index'
import store from '@/store'
import { encrypt } from '@/utils/jsencrypt'
import { ResponseCode } from '@/model/httpType'
import { Toast } from '@nutui/nutui'
import router from '@/router'

const { t } = useI18n()

const {
  userSerial
} = store.state.user ?? {}

// 原密码
const password = ref('')
// 新密码
const newPassword = ref('')
// 重复输入新密码
const reNewPassword = ref('')

function submit () {
  password.value = password.value.trim()
  newPassword.value = newPassword.value.trim()
  reNewPassword.value = reNewPassword.value.trim()
  if (!password.value) {
    showErrorMessage(t('password.pleaseEnterOldPassword'))
    return
  }
  if (!newPassword.value) {
    showErrorMessage(t('password.pleaseEnterNewPassword'))
    return
  }

  const reg = /^[0-9a-zA-Z]{6,10}$/
  if (!reg.test(newPassword.value)) {
    showErrorMessage(t('password.formatTip'))
    return
  }
  if (newPassword.value !== reNewPassword.value) {
    showErrorMessage(t('password.noEqual'))
    return
  }
  if (userSerial) {
    MyApi.updatePwd(userSerial.toString(), encrypt(newPassword.value) || '', encrypt(password.value) || '').then(res => {
      if (res?.code === ResponseCode.success) {
        Toast.success(res.msg)
        setTimeout(() => {
          router.go(-1)
        }, 2000)
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    })
  }
}

onMounted(() => {
  document.title = t('title.editPassword')
})
</script>

<style lang="scss">
.change-password-page {
  height: 100%;
  overflow: hidden;
  padding: 0 12px;

  .password-box {
    font-size: 32px;
    background: white;
    border-radius: 16px;
    padding: 0 44px;
    margin: 12px 0 0;

    .password-input-box {
      height: 110px;
      display: flex;
      align-items: center;

      .password__label {
        color: $color-black-800;
        flex-shrink: 0;
      }

      & + .password-input-box {
        border-top: 1px solid $color-black-300;
      }
    }
  }

  .change-password__desc {
    color: $color-black-700;
    font-size: 28px;
    margin: 22px 0 48px 48px
  }

  .change-password__button {
    width: 100%;
  }
}
</style>
