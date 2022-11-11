<template>
  <div class="my-application">
    <div class="application__title">{{ t('home.myApplication') }}</div>
    <div class="application-menu-content" :class="{'less-menu':isLessMenu}">
      <div class="application-menu-item" v-for="(menu,index) in menuList" :key="index"
           @click="handleMenuClick(menu.url)">
        <WeSvgIcon :icon-name="menu.icon" svg-class="application-menu__icon" color="white"></WeSvgIcon>
        <div class="application-menu__title"> {{ menu.menuTitle }}</div>
      </div>
      <div class="application-menu-item" @click="handleMenuClick('/allApplication')">
        <WeSvgIcon icon-name="#icon-gengduoxin" svg-class="application-menu__icon" color="white"></WeSvgIcon>
        <div class="application-menu__title"> {{ t('more') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import HomeApi from '@/api/home'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import { emitError } from '@/utils/error'
import { computed, defineEmits, onMounted, ref } from 'vue'
import store from '@/store'
import { MenuModel } from '@/views/home/model'
import WeSvgIcon from '@/components/WeSvgIcon/index.vue'
import router from '@/router'
import cache, { MyMenuListKey } from '@/utils/cache'

const { t } = useI18n()

interface EmitType {
  // 加载完成
  (e: 'loaded'): void,
}

const emits = defineEmits<EmitType>()

const {
  userSerial
} = store.state.user ?? {}

// 菜单
const menuList = ref<Array<MenuModel>>()

// 是否小于6个菜单
const isLessMenu = computed(() => {
  return (menuList.value?.length ?? 0) < 6
})

function getMenuList () {
  if (userSerial) {
    HomeApi.getHomeMenu(userSerial.toString(), 1, 0).then(res => {
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

        cache.session.setJSON(MyMenuListKey, menuList.value)
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
  router.push(url)
}

onMounted(() => {
  menuList.value = cache.session.getJSON(MyMenuListKey)
  if (!menuList.value) {
    getMenuList()
  } else {
    emits('loaded')
  }
})
</script>

<style lang="scss">
.home-page {
  .my-application {
    width: calc(100% - 24px);
    background: white;
    box-sizing: border-box;
    border-radius: 16px;
    margin: 14px 12px 0;
    padding: 38px 30px;

    .application__title {
      color: $color-black-800;
      font-size: 32px;
      font-weight: Bold;
      margin-bottom: 38px;
    }

    .application-menu-content {
      display: flex;
      flex-wrap: wrap;

      &.less-menu {
        .application-menu-item {
          width: 29.6vw;
          height: 29.6vw;
        }
      }

      .application-menu-item {
        width: 22.2vw;
        height: 22.2vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .application-menu__icon {
          width: 80px;
          height: 80px;
          margin-bottom: 22px;
        }

        .application-menu__title {
          color: $color-black-800;
          font-size: 28px;
          line-height: 1;
        }
      }
    }
  }
}
</style>
