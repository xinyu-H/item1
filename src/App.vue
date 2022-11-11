<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cacheViewList">
      <component
        :is="Component"
        :key="route.path"
      />
    </keep-alive>
  </router-view>
  <MessageBox ref="messageBoxRef"></MessageBox>
</template>
<script lang="ts" setup>
import messageEventBus from '@/components/WeMessageBox/eventBus'
import MessageBox from '@/components/WeMessageBox/index.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

// refs
const messageBoxRef = ref()

const router = useRouter()
const store = useStore()

const cacheViewList = computed(() => {
  return store.state.system.cachedViews
})

// 打开消息弹窗监听
messageEventBus.on('messageBox-open', (option) => {
  messageBoxRef.value.showMessage(option.message, option.type, option.option)
})

// 记录保存状态的页面
store.commit('system/setCacheView', router.getRoutes())
</script>
<style lang="scss">
#app {
  background: $color-black-200;
  overflow: hidden;
}
</style>
