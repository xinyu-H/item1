<template>
  <div class="login-page" :style="'height:'+height">
    <!--  背景  -->
    <img class="login-bg" :src="bgImg">
    <!--  主要区域  -->
    <div class="login-content">
      <!--   头部   -->
      <div class="login-header">
        <div class="login-header__title">
          {{ t('hello') }}!
        </div>
        <div class="login-header__desc">
          {{ t('welcome') }}
        </div>
      </div>
      <!--  输入的内容区域    -->
      <div class="login-input-content">
        <!--    输入行    -->
        <div class="login-input-row">
          <div class="iconfont icon-account"></div>
          <nut-input class="login__input" v-model="account" @focus="handleInputFocus($el)" @blur="scrollToTop()"
                     :placeholder="t('pleaseEnter')+t('login.userNoAndPhone')"
                     clearable clear-icon="circle-close"></nut-input>
        </div>
        <div class="login-input-row">
          <div class="iconfont icon-password"></div>
          <nut-input class="login__input" type="password" @focus="handleInputFocus($el)" @blur="scrollToTop()"
                     v-model="password"
                     :placeholder="t('pleaseEnter')+t('login.password')"
                     clearable clear-icon="circle-close"></nut-input>
        </div>
        <div class="login-input-row" v-if="isOpenVerificationCode">
          <div class="iconfont icon-yanzhengma"></div>
          <nut-input class="login__input" v-model="verificationCode" @focus="handleInputFocus($el)"
                     @blur="scrollToTop()"
                     :placeholder="t('pleaseEnter')+t('login.verificationCode')"
                     clearable clear-icon="circle-close"></nut-input>
          <img @click="getCodeImg" class="login-verification-code" :src="codeImgData">
        </div>
        <!--    记住密码    -->
        <div class="remember-me-box x-end" v-if="getEnv() === EnvType.h5">
          <nut-checkbox v-model="rememberMe">{{ t('login.rememberPassword') }}</nut-checkbox>
        </div>
      </div>
      <!--   登录按钮   -->
      <nut-button class="login__btn" size="large" type="primary" @click="login" :disabled="!isCanSubmit">
        {{ getEnv() === EnvType.wx ? t('login.loginAndBind') : t('login.login') }}
      </nut-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LoginApi from '@/api/login/index'
import { ResponseCode } from '@/model/httpType'
import { Toast } from '@nutui/nutui'
import { showErrorMessage } from '@/utils/messageBox'
import { emitError } from '@/utils/error'
import { EnvType } from '@/model/envType'
import { getEnv } from '@/utils/env'
import router from '@/router'
import BaseApi from '@/api/base'
import { getQueryString } from '@/utils/tool'
import { useStore } from 'vuex'
import cache, { AccountInfoKey, OpenIdKey, RememberMeKey } from '@/utils/cache'
import { encrypt } from '@/utils/jsencrypt'
import bgImg from '@/assets/images/login/bg-2.png'

const { t } = useI18n()
const store = useStore()

// 是否开启验证码
const isOpenVerificationCode = ref(false)
// 验证码图片
const codeImgData = ref<string | undefined>()
// 验证码登录key
const codeKey = ref<string | undefined>()
// 账号
const account = ref<string>('')
// 密码
const password = ref<string>('')
// 验证码
const verificationCode = ref<string>('')
// 记住密码
const rememberMe = ref(false)
// 页面高度
const height = ref('100%')
// 滚动条的计时器
let scrollTimer: number | undefined

// 是否能够提交
const isCanSubmit = computed(() => {
  if (isOpenVerificationCode.value) {
    return account.value && password.value && verificationCode.value
  } else {
    return account.value && password.value
  }
})

// 获取验证码
async function getVerificationCode () {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  try {
    const res = await LoginApi.getOpenValid()
    if (res && res.code === ResponseCode.success) {
      // 判断是否开启开启
      isOpenVerificationCode.value = res.data === 1
      await getCodeImg()
    } else {
      showErrorMessage(res?.msg || t('httpError.systemError'))
    }
  } catch (e) {
    emitError(e)
  }
  Toast.hide(loading.uid)
}

// 获取验证码图片
async function getCodeImg (showLoad?: any) {
  let codeImgLoading
  if (showLoad) {
    codeImgLoading = Toast.loading(t('loading'), {
      duration: 0,
      cover: true
    })
  }
  try {
    if (isOpenVerificationCode.value) {
      // 开启则继续获取二维码
      const codeRes = await LoginApi.getVerifications('112', '38')
      if (codeRes && codeRes.code === ResponseCode.success) {
        codeImgData.value = codeRes.data.images
        codeKey.value = codeRes.data.key
      } else {
        showErrorMessage(codeRes?.msg || t('httpError.systemError'))
      }
    }
  } catch (e) {
    emitError(e)
  }

  if (codeImgLoading) {
    Toast.hide(codeImgLoading.uid)
    codeImgLoading = null
  }
}

// 获取用户信息（微信端）
async function getWxUserInfo (): Promise<boolean> {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  try {
    // 微信端
    // 1.根据code获取用户信息
    const wxCode = getQueryString('code')
    if (wxCode) {
      const res = await BaseApi.getUserInfoByCode(wxCode)
      if (res && res.data && res.code === ResponseCode.success) {
        cache.local.set(OpenIdKey, res.data.openId)
        if (res.data.user) {
          // 2.如果能够获取用户信息则缓存数据并跳过登录直接进入首页
          store.commit('user/setUserInfo', res.data.user)
          router.replace({ name: 'Home' })
          return true
        }
      } else if (res && res.code === ResponseCode.error) {
        location.href = res.msg
      }
    }
  } catch (e) {
    emitError(e)
  } finally {
    Toast.hide(loading.uid)
  }

  return false
}

// 微信登录
function wxLogin () {
  const openId = cache.local.get(OpenIdKey)
  if (openId) {
    const pwd = encrypt(password.value)
    if (pwd) {
      const loginLoading = Toast.loading(t('loading'), {
        duration: 0,
        cover: true
      })
      LoginApi.userLoginWX(account.value, pwd, openId, codeKey.value, verificationCode.value).then(res => {
        if (res) {
          if (res.code === ResponseCode.success && res.data) {
            store.commit('user/setUserInfo', res.data)
            Toast.success(t('login.loginSuccess'))
            router.replace({ name: 'Home' })
          } else {
            showErrorMessage(res?.msg || t('httpError.systemError'))
            getCodeImg()
          }
        }
      }).catch((error: string) => {
        showErrorMessage(error)
      }).finally(() => {
        Toast.hide(loginLoading.uid)
      })
    }
  }
}

// h5登录
function h5Login () {
  const pwd = encrypt(password.value)
  if (pwd) {
    const loginLoading = Toast.loading(t('loading'), {
      duration: 0,
      cover: true
    })
    LoginApi.userLoginH5(account.value, pwd, codeKey.value, verificationCode.value).then(res => {
      if (res) {
        if (res.code === ResponseCode.success && res.data) {
          // 登录后缓存账号密码
          if (rememberMe.value) {
            // 保存记住密码的状态
            cache.local.set(RememberMeKey, 'true')
            // 保存账号、密码
            cacheAccountInfo()
          } else {
            cache.local.remove(RememberMeKey)
          }
          store.commit('user/setUserInfo', res.data)
          Toast.success(t('login.loginSuccess'))
          router.replace({ name: 'Home' })
        } else {
          showErrorMessage(res?.msg || t('httpError.systemError'))
          getCodeImg()
        }
      }
    }).catch(error => {
      showErrorMessage(error)
    }).finally(() => {
      Toast.hide(loginLoading.uid)
    })
  }
}

// 缓存账号密码
function cacheAccountInfo () {
  cache.local.setJSON(AccountInfoKey, {
    account: account.value,
    pwd: window.btoa(password.value)
  })
}

// 获取账号密码
function getCacheAccountInfo () {
  const accountInfo = cache.local.getJSON(AccountInfoKey)
  if (accountInfo) {
    account.value = accountInfo.account
    password.value = window.atob(accountInfo.pwd) || ''
  }
}

// 登录
function login () {
  if (getEnv() === EnvType.wx) {
    wxLogin()
  } else if (getEnv() === EnvType.h5) {
    h5Login()
  }
}

// 放回页面最上方
function scrollToTop () {
  scrollTimer = setTimeout(() => {
    document.documentElement.scrollIntoView({
      behavior: 'smooth'
    })
  }, 100)
}

// 清除滚动条计时器
function handleInputFocus (dom: HTMLElement) {
  dom.scrollIntoView({
    behavior: 'smooth'
  })
  clearTimeout(scrollTimer)
}

// 处理记住密码相关的代码
function handelRememberMe () {
  rememberMe.value = !!cache.local.get(RememberMeKey)
  if (rememberMe.value) {
    getCacheAccountInfo()
  }
}

onMounted(async () => {
  document.title = t('title.login')
  // 这么写是为了处理 Android端 键盘压缩整体屏幕高度的情况
  height.value = window.screen.height + 'px'
  if (getEnv() === EnvType.wx) {
    // 判断用户是否登录过
    const userHasLogin = await getWxUserInfo()
    if (userHasLogin) return
  } else if (getEnv() === EnvType.h5) {
    handelRememberMe()
  }
  // 获取验证码
  await getVerificationCode()
})
</script>

<style lang="scss">
.login-page {
  height: 100%;
  color: $color-black-800;
  line-height: 1;
  background: url("@/assets/images/login/bg.png");
  background-size: cover;
  position: relative;
  overflow: scroll;

  .login-bg {
    width: 321px;
    height: 408px;
    object-fit: cover;
    position: absolute;
    top: 38px;
    right: 48px;
  }

  .login-content {
    margin: 40% 82px 0;

    .login-header {
      .login-header__title {
        font-size: 60px;
        font-weight: 500;
      }

      .login-header__desc {
        color: $color-blue-500;
        font-size: 32px;
        margin-top: 28px;
      }
    }

    .login-input-content {
      margin-top: 100px;

      .login-input-row {
        height: 82px;
        display: flex;
        align-items: center;
        margin-top: 32px;
        position: relative;

        .iconfont {
          color: $color-blue-500;
          font-size: 50px;
          margin-right: 20px;
        }

        .login__input {
          background: transparent;
          padding: 24px 8px;
        }

        .login-verification-code {
          width: 133px;
          height: 55px;
          object-fit: fill;
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
        }

        input::-webkit-input-placeholder {
          color: $color-black-400;
        }
      }

      .remember-me-box {
        margin-top: 32px;

        .nut-checkbox__label {
          margin-left: 8px;
        }
      }
    }
  }

  .login__btn {
    width: 100%;
    box-shadow: 0 6px 15px 1px rgba(2, 135, 255, 0.4000);
    margin-top: 94px;
  }
}
</style>
