<template>
  <div class="main-page">
    <div class="main-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            :key="route.path"
          />
        </keep-alive>
      </router-view>
    </div>
    <nut-tabbar class="main-footer" :safe-area-inset-bottom="true" v-model:visible="selectMenuIndex">
      <nut-tabbar-item v-for="(menu,index) in menuList" :key="index" :tab-title="menu.menuTitle"
                       :icon="menu.icon" :font-class-name="menu.iconFamily" :to="menu.url"
      ></nut-tabbar-item>
    </nut-tabbar>
  </div>
</template>

<script lang="ts" setup>
import HomeBase from '@/api/home/index'
import store from '@/store'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import { useRoute } from 'vue-router'
import cache, { TabBarListKey } from '@/utils/cache'
import { MenuModel } from '@/views/home/model'

const { t } = useI18n()
const route = useRoute()

const userSerial = store.state.user?.userSerial || ''

// 选中的菜单
const selectMenuIndex = ref(0)

// 菜单数据
const menuList = ref<Array<MenuModel>>([])

// 获取菜单
function getMenus () {
  if (userSerial) {
    HomeBase.getHomeMenu(userSerial.toString(), 0, 9).then(res => {
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

        cache.session.setJSON(TabBarListKey, menuList.value)
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    })
  }
}

onMounted(() => {
  menuList.value = cache.session.getJSON(TabBarListKey)
  if (!menuList.value) {
    getMenus()
  } else {
    selectMenuIndex.value = menuList.value.findIndex(menu => menu.url === route.fullPath)
  }
})

</script>

<style lang="scss">
.main-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .main-content {
    height: calc(100% - 96px);
  }

  .main-footer {
    position: fixed;
    bottom: 0;
  }
}
</style>
