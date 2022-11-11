<template>
  <div class="all-app-page">
    <div class="my-app-box">
      <div class="app-box__title x-between y-center">
        <span>{{ t('home.myApplication') }}</span>
        <span class="app-box__action-box" @click="edit">{{ isEdit ? t('complete') : t('edit') }}</span>
      </div>
      <div class="app-menu-list-box">
        <TransitionGroup name="all-app-list">
          <div class="app-menu-item" v-for="(menu,index) in myMenuList" :key="menu.menuId"
               @click="handleMenuClick(menu)">
            <div class="app-menu-item-content" :class="{'shake':isEdit}">
              <WeSvgIcon :icon-name="menu.icon" svg-class="app-menu__icon" color="white"></WeSvgIcon>
              <div class="app-menu__title"> {{ menu.menuTitle }}</div>
              <div class="app-menu-btn" v-if="isEdit" @click.stop.prevent="delMenu(index)">
                <span class="iconfont icon-yichu"></span>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
    <div class="add-app-box">
      <div class="app-box__title">{{ t('home.addApplication') }}</div>
      <div class="app-menu-list-box">
        <div class="app-menu-item" v-for="menu in notMyMenuList" :key="menu.menuId" @click="handleMenuClick(menu)">
          <div class="app-menu-item-content">
            <WeSvgIcon :icon-name="menu.icon" svg-class="app-menu__icon" color="white"></WeSvgIcon>
            <div class="app-menu__title"> {{ menu.menuTitle }}</div>
            <div class="app-menu-btn" v-if="isEdit" @click="addMenu(menu)">
              <span class="iconfont icon-tianjia"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import HomeApi from '@/api/home/index'
import { computed, ref } from 'vue'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import { emitError } from '@/utils/error'
import store from '@/store'
import { MenuModel } from '@/views/home/model'
import { useI18n } from 'vue-i18n'
import { Toast } from '@nutui/nutui'
import { useRoute } from 'vue-router'
import WeSvgIcon from '@/components/WeSvgIcon/index.vue'
import Sortable from 'sortablejs'
import cache, { MyMenuListKey } from '@/utils/cache'

const { t } = useI18n()
const route = useRoute()
// 拖动组件
let sortable: Sortable | null = null

const {
  userSerial
} = store.state.user ?? {}

const loading = Toast.loading(t('loading'), {
  duration: 0,
  cover: true
})
//  我的应用
const myMenuList = ref<Array<MenuModel>>([])
// 所有应用
const allMenuList = ref<Array<MenuModel>>([])
// 没有添加的应用
const notMyMenuList = computed(() => {
  return allMenuList.value.filter(menu => {
    return myMenuList.value.findIndex(m => m.menuId === menu.menuId) < 0
  })
})
// 是否编辑状态
const isEdit = ref(false)

// 获取我得菜单
async function getMenuList () {
  if (userSerial) {
    await HomeApi.getHomeMenu(userSerial.toString(), 1, 0).then(res => {
      if (res?.code === ResponseCode.success) {
        myMenuList.value = res.data.map(menu => {
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
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    })
  }
}

// 获取全部菜单
async function getAllMenuList () {
  if (userSerial) {
    await HomeApi.getAllMenu(userSerial.toString(), 1, 0).then(res => {
      if (res?.code === ResponseCode.success) {
        allMenuList.value = res.data.map(menu => {
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
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).catch(e => {
      emitError(e)
    })
  }
}

// 编辑
function edit () {
  isEdit.value = !isEdit.value
  if (isEdit.value) {
    createSortable()
  } else {
    sortable?.destroy()
    saveMenu()
  }
}

// 保存结果
function saveMenu () {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  if (userSerial) {
    HomeApi.saveMenu(myMenuList.value.map(menu => menu.menuId).toString(), userSerial.toString()).then(res => {
      if (res?.code === ResponseCode.success) {
        Toast.success(res?.msg)
        cache.session.setJSON(MyMenuListKey, myMenuList.value)
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).finally(() => {
      Toast.hide(loading.uid)
    })
  }
}

// 添加菜单
function addMenu (menu: MenuModel) {
  if (myMenuList.value.length >= 11) {
    showErrorMessage(t('home.maxAppMsg'), {
      title: t('tips')
    })
  } else {
    myMenuList.value.push(menu)
  }
}

// 删除菜单
function delMenu (index: number) {
  if (myMenuList.value.length === 1) {
    showErrorMessage(t('home.minAppMsg'), {
      title: t('tips')
    })
  } else {
    myMenuList.value.splice(index, 1)
  }
}

// 菜单点击
function handleMenuClick (menu: MenuModel) {
  if (!isEdit.value) {
    // 导航
    console.log(menu)
  }
}

// 创建拖动组件
function createSortable () {
  const parentDom: HTMLElement | null = document.querySelector('.all-app-page .my-app-box .app-menu-list-box')
  if (parentDom) {
    sortable = Sortable.create(parentDom, {
      // 动画时间
      animation: 200,
      delay: 100,
      // 拖动结束
      onEnd: (event) => {
        // 移动之后改变数据
        if (event.oldIndex !== undefined && event.newIndex !== undefined) {
          const element = myMenuList.value.splice(event.oldIndex, 1)
          myMenuList.value.splice(event.newIndex, 0, element[0])
        }
      }
    })
  }
}

// 初始化
async function init () {
  document.title = t('title.allApplication')
  try {
    await getMenuList()
    await getAllMenuList()
  } catch (e) {
    emitError(route.path + '-' + e)
  } finally {
    loading.hide()
  }
}

init()
</script>

<style lang="scss">
.all-app-page {
  height: 100%;
  overflow: scroll;
  display: flex;
  flex-direction: column;

  .my-app-box, .add-app-box {
    background: white;
    border-radius: 16px;
    padding: 38px 30px;

    .app-box__title {
      color: $color-black-800;
      font-size: 32px;
      font-weight: Bold;
      margin-bottom: 38px;
    }

    .app-box__action-box {
      font-size: 28px;
      font-weight: normal;
      color: $color-blue-500;
    }

    .app-menu-list-box {
      display: flex;
      flex-wrap: wrap;

      .app-menu-item {
        width: 22.2vw;
        height: 22.2vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        svg {
          pointer-events: none;
        }

        .app-menu__icon {
          width: 80px;
          height: 80px;
          margin-bottom: 22px;
        }

        .app-menu__title {
          color: $color-black-800;
          font-size: 28px;
          line-height: 1;
        }
      }

      .app-menu-item-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;

        @keyframes appShake {
          0% {
            transform: rotateZ(-2deg);
          }
          100% {
            transform: rotateZ(2deg);
          }
        }

        // 颤动动画
        &.shake {
          animation-name: appShake;
          animation-duration: 0.2s;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-timing-function: linear;
        }

        .app-menu-btn {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          right: -6px;

          .iconfont {
            font-size: 40px;
          }
        }
      }
    }
  }

  .my-app-box {
    margin: 12px;

    .app-menu-btn {
      color: $color-red-500;
    }
  }

  .add-app-box {
    flex: 1;
    margin: 0 12px 12px 12px;

    .app-menu-btn {
      color: $color-blue-500;
    }
  }

  // 列表动画
  .all-app-list-move,
  .all-app-list-enter-active,
  .all-app-list-leave-active {
    transition: all 0.36s ease;
  }

  .all-app-list-enter-from,
  .all-app-list-leave-to {
    opacity: 0;
  }
}
</style>
