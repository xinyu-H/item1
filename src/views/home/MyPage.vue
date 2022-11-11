<template>
  <div class="my-page">
    <div class="my-header">
      <span class="mask iconfont icon-zhanghuxinxi"></span>
      <div class="my-header__desc">{{ t('my.userInfo') }}</div>
      <div class="my-header-user-info">
        <div class="user-info-row">
          <span class="my-header__title">{{ userLname }}</span>
          <span class="my-header__sub-title text-overflow-ellipsis" v-if="userDepname">{{
              userDepname
            }}</span>
        </div>
        <div class="my-header__sub-title">{{ userDepname ? userNo : userDepname }}</div>
      </div>
    </div>
    <div class="my-menu-list">
      <template v-for="menu in menuList" :key="menu.menuId">
        <div class="my-menu-item"
             v-if="getMenuVisible(menu)"
             @click="handleMenuClick(menu)">
          <span :class="menu.icon"></span>
          <div class="my-menu-action-box">
            <span class="my-menu__title">{{ menu.menuTitle }}</span>
            <span class="iconfont icon-arrow-right"
                  v-if="getMenuType(menu)===MenuLinkType.link"></span>
            <span class="my-card-status" :class="{'no-card':cardStatus!==CardStatus.hasCard}"
                  v-else-if="getMenuType(menu)===MenuLinkType.card">{{ cardStatusName }}</span>
            <nut-switch v-else v-model="pushStatus" :active-value="PushStatus.open"
                        @click="handlePushStatusChange"
                        :inactive-value="PushStatus.close"></nut-switch>
          </div>
        </div>
      </template>

      <nut-button class="my-unbind__btn" plain type="danger" @click="handleUnBind">
        {{ EnvType.h5 === getEnv() ? t('my.layout') : t('my.unbind') }}
      </nut-button>
    </div>
    <PasswordPop ref="passwordPopRef"></PasswordPop>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import store from '@/store'
import HomeApi from '@/api/home'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage, showWarningMessageBox } from '@/utils/messageBox'
import { emitError } from '@/utils/error'
import { computed, onMounted, ref } from 'vue'
import { MenuModel } from '@/views/home/model'
import { Toast } from '@nutui/nutui'
import MyApi from '@/api/my/index'
import PasswordPop from '@/views/home/components/my/PasswordPop.vue'
import cache, { MePageMenuListKey } from '@/utils/cache'
import router from '@/router'
import { encrypt } from '@/utils/jsencrypt'
import { getEnv } from '@/utils/env'
import { EnvType } from '@/model/envType'

const { t } = useI18n()

// refs
const passwordPopRef = ref()

// 菜单类型
const enum MenuLinkType {
  link,
  card,
  switch
}

// 卡状态
const enum CardStatus {
  // 未发卡
  noCard,
  // 已发卡
  hasCard,
  // 已挂失
  lossCard
}

// 推送状态
const enum PushStatus {
  open,
  close
}

const {
  userSerial,
  userLname,
  userDepname,
  userNo
} = store.state.user ?? {}

// 菜单列表
const menuList = ref<Array<MenuModel>>()
// 卡状态
const cardStatus = ref<number | undefined>()
// 推送状态
const pushStatus = ref(PushStatus.open)

// 卡状态名称
const cardStatusName = computed(() => {
  let name = ''
  switch (cardStatus.value) {
    case CardStatus.noCard:
      name = t('my.noCard')
      break
    case CardStatus.hasCard:
      name = t('my.hasCard')
      break
    case CardStatus.lossCard:
      name = t('my.lossCard')
      break
  }
  return name
})

// 获取菜单
async function getMenuList () {
  if (userSerial) {
    await HomeApi.getHomeMenu(userSerial.toString(), 0, 2).then(res => {
      if (res?.code === ResponseCode.success) {
        menuList.value = res.data.map(menu => {
          return {
            icon: menu.iconId,
            iconFamily: '',
            url: menu.iconUrlId,
            menuTitle: menu.menuName,
            menuId: menu.menuId
          }
        })
        cache.session.setJSON(MePageMenuListKey, menuList.value)
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    })
  }
}

// 员工卡户信息
async function getCardStatus () {
  if (userSerial) {
    await MyApi.getCardStatus(userSerial.toString()).then(res => {
      if (res?.code === ResponseCode.success) {
        cardStatus.value = res.data.userLx
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    })
  }
}

// 菜单点击
function handleMenuClick (menu: MenuModel) {
  if (menu.menuId === '990404000000') {
    // 如果是推送按钮点击
    return
  }
  router.push(menu.url)
}

// 获取菜单类型
function getMenuType (menu: MenuModel): MenuLinkType {
  let menutype = MenuLinkType.link
  switch (menu.menuId) {
    case '990403000000':
      menutype = MenuLinkType.card
      break
    case '990404000000':
      menutype = MenuLinkType.switch
      break
  }
  return menutype
}

// 获取推送状态
async function getPushStatus () {
  if (userSerial) {
    await MyApi.getPushStatus(userSerial.toString()).then(res => {
      if (res?.code === ResponseCode.success) {
        pushStatus.value = res.data?.sendStatus ?? false
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    })
  }
}

// 推送状态改变
function handlePushStatusChange () {
  if (userSerial) {
    const loading = Toast.loading(t('loading'), {
      duration: 0,
      cover: true
    })
    MyApi.setPushStatus(userSerial.toString(), pushStatus.value).then(res => {
      if (res?.code === ResponseCode.success) {
        Toast.success(res.msg)
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    }).finally(() => {
      Toast.hide(loading.uid)
    })
  }
}

// 退出登录
function layout () {
  cache.session.clear()
  cache.local.clear()
  router.push({ name: 'LoginPage' })
}

/**
 * 解除绑定
 * @param pwd 密码
 */
function unbind (pwd: string) {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })

  if (userSerial) {
    MyApi.unbindRelation(userSerial.toString(), cache.session.get('openId') || '', encrypt(pwd) || '').then(res => {
      if (res?.code === ResponseCode.success) {
        Toast.success(res.msg)
        layout()
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    }).finally(() => {
      Toast.hide(loading.uid)
    })
  }
}

// 结束绑定或者退出登录
function handleUnBind () {
  if (EnvType.h5 === getEnv()) {
    showWarningMessageBox(t('my.confirmLayout'), {
      title: t('my.confirmMessage'),
      cancelBtn: t('cancel'),
      confirmBtn: t('confirm')
    }).then(() => {
      layout()
    })
  } else {
    passwordPopRef.value.openPop().then((res: string) => {
      showWarningMessageBox(t('my.confirmUnbind'), {
        title: t('my.confirmMessage'),
        cancelBtn: t('cancel'),
        confirmBtn: t('confirm')
      }).then(() => {
        unbind(res)
      })
    })
  }
}

// 获取菜单是否可见
function getMenuVisible (menu: MenuModel) {
  // H5端没有消息推送
  if (getEnv() === EnvType.h5 && menu.menuId === '990404000000') {
    return false
  }
  return true
}

// 初始化
async function init () {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  try {
    menuList.value = cache.session.getJSON(MePageMenuListKey)
    if (!menuList.value) {
      await getMenuList()
    }
    await getCardStatus()
    if (getEnv() === EnvType.wx) {
      await getPushStatus()
    }
  } catch (e) {
    emitError(e)
  } finally {
    Toast.hide(loading.uid)
  }
}

onMounted(() => {
  document.title = t('title.me')
  init()
})
</script>

<style lang="scss">
.my-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .my-header {
    height: 245px;
    background: linear-gradient(270deg, #226BDE, #2AA7F7);
    border-radius: 16px;
    position: relative;
    margin: 12px 12px 0 12px;

    .mask {
      color: #2180E2;
      font-size: 120px;
      opacity: .8;
      position: absolute;
      right: 48px;
      top: 50%;
      transform: translateY(-50%);
    }

    .my-header__desc {
      color: #A7CFF7;
      font-size: 28px;
      margin: 30px;
    }

    .my-header-user-info {
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      padding-left: 52px;
      position: absolute;
      z-index: 9;

      .user-info-row {
        width: 85%;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
      }

      .my-header__title {
        color: white;
        font-size: 40px;
        line-height: 1;
        flex-shrink: 0;
        margin-right: 20px;
      }

      div.my-header__sub-title {
        margin-top: 24px;
        position: relative;
      }

      .my-header__sub-title {
        line-height: 1;
        color: white;
        font-size: 32px;
      }
    }
  }

  .my-menu-list {
    flex: 1;
    background: white;
    border-radius: 16px;
    margin: 12px;

    .my-menu-item {
      height: 96px;
      display: flex;
      align-items: center;

      .iconfont {
        font-size: 44px;
        color: $color-blue-500;
        margin-left: 25px;
      }

      .my-menu-action-box {
        flex: 1;
        height: 100%;
        color: $color-black-800;
        border-bottom: 1px solid #DDDDDD;
        display: flex;
        align-items: center;
        margin-left: 24px;
        padding-right: 24px;

        .my-menu__title {
          flex: 1;
          font-size: 30px;
        }

        .my-card-status {
          font-size: 30px;
          color: $color-green-500;

          &.no-card {
            color: $color-yellow-500;
          }
        }

        .iconfont {
          color: $color-black-600;
        }
      }
    }

    .my-unbind__btn {
      width: calc(100% - 44px);
      margin: 88px 22px 22px;
    }
  }
}
</style>
