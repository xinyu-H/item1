<template>
  <div class="home-header">
    <div class="header-content">
      <nut-image :src="userImg" class="header__photo" fit="cover">
      </nut-image>
      <div class="header-info">
        <div>
          <span class="header-info__title">{{ userLname }}</span>
          <span class="header-info__title" v-if="userDepname">{{ userDepname }}</span>
        </div>
        <div>
          <span class="header-info__sub-title">{{ userDepname ? userNo : userDepname }}</span>
        </div>
      </div>
    </div>
    <div class="header-menu-content">
      <div class="header-menu-item" v-for="(menu,index) in menuList" :key="index" @click="handleMenuClick(menu.url)">
        <WeSvgIcon :icon-name="menu.icon" svg-class="header-menu__icon" color="white"></WeSvgIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import userImg from '@/assets/images/home/user_photo.png'
import store from '@/store'
import { defineEmits, onMounted, ref } from 'vue'
import { MenuModel } from '@/views/home/model'
import HomeApi from '@/api/home'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage, showErrorMessageBox } from '@/utils/messageBox'
import { useI18n } from 'vue-i18n'
import WeSvgIcon from '@/components/WeSvgIcon/index.vue'
import { emitError } from '@/utils/error'
import { scanQrCode } from '@/utils/native'
import router from '@/router'
import { Toast } from '@nutui/nutui'
import cache, { TopMenuListKey } from '@/utils/cache'

const { t } = useI18n()

interface EmitType {
  // 加载完成
  (e: 'loaded'): void,
}

const emits = defineEmits<EmitType>()

const {
  userSerial,
  userLname,
  userDepname,
  userNo
} = store.state.user ?? {}

const menuList = ref<Array<MenuModel>>()

function getMenuList () {
  if (userSerial) {
    HomeApi.getHomeMenu(userSerial.toString(), 0, 0).then(res => {
      if (res?.code === ResponseCode.success) {
        menuList.value = res.data.map(menu => {
          const iconId = menu.iconId
          const isIconFont = iconId.indexOf('iconfont') > -1
          return {
            icon: iconId.replace('iconfont', ''),
            iconFamily: isIconFont ? 'iconfont' : undefined,
            url: menu.iconUrlId,
            menuTitle: menu.menuName,
            menuId: menu.menuId
          }
        })

        cache.session.setJSON(TopMenuListKey, menuList.value)
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    }).finally(() => {
      emits('loaded')
    })
  }
}

// 处理菜单点击
function handleMenuClick (url: string) {
  switch (url) {
    case '/RichScan':
      handleScanQrCode()
      break
    default:
      router.push(url)
  }
}

// 处理扫一扫
function handleScanQrCode () {
  if (userSerial) {
    scanQrCode().then(code => {
      HomeApi.getScanQRResult(code, userSerial.toString()).then(res => {
        if (res?.code === ResponseCode.success) {
          Toast.success(res.msg)
        } else if (res) {
          showErrorMessageBox(res.msg, {
            confirmBtn: t('home.reScanCode'),
            cancelBtn: t('home.cancelScanCode')
          }).then(() => {
            handleScanQrCode()
          })
        }
      })
    })
  }
}

onMounted(() => {
  menuList.value = cache.session.getJSON(TopMenuListKey)
  if (!menuList.value) {
    getMenuList()
  } else {
    emits('loaded')
  }
})
</script>

<style lang="scss">
.home-page {
  .home-header {
    height: 300px;
    background: url("@/assets/images/home/bg.png");
    background-size: cover;
    display: flex;
    flex-direction: column;

    .header-content {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 42px;

      .header__photo {
        height: 102px;
        width: 102px;
        margin-right: 28px;
      }

      .header-info {
        height: 80px;
        color: white;
        line-height: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .header-info__title {
          font-size: 36px;
          margin-right: 20px;
        }

        .header-info__sub-title {
          font-size: 30px;
        }
      }
    }

    .header-menu-content {
      height: 108px;
      background: rgba(64, 158, 255, 0.34);
      flex-shrink: 0;
      display: flex;
      align-items: center;

      .header-menu-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        & + .header-menu-item {
          &:before {
            content: '';
            display: block;
            width: 1px;
            height: 50px;
            background: #8EC9FF;
            position: absolute;
            left: 1px;
            top: 50%;
            transform: translateY(-50%);
          }
        }

        .header-menu__icon {
          width: 60px;
          height: 60px;
        }
      }
    }
  }
}
</style>
