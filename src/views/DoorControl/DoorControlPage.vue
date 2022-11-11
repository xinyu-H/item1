<template>
    <div class="entrace-guardOpen-page">
        <div class="door-img-box">
        <TransitionGroup name="all-door-list">
        <div class="doorImg" v-for="index in doorList" :key="index" @click="clickOpen(index)">
          <div class="door-List" :class="{'shake':setButtonShow}">
        <img src="@\assets\images\door\close.png" v-if="index.isOpen===IsOpenStatus.close" alt="">
        <img src="@\assets\images\door\open.png" v-if="index.isOpen===IsOpenStatus.open" alt="">
        <img src="@\assets\images\door\offline.png" v-if="index.isOpen===IsOpenStatus.offline" alt="">
        <div>{{index.doorName}}</div>
        </div>
        </div>
        </TransitionGroup>
        </div>
        <div class="setButton" @click="clickSetting()" v-show="!setButtonShow">{{t('doorControl.setting')}}</div>
        <div class="confirmButton-box" v-show="setButtonShow">
            <div class="cancelButton" @click="clickCancel()">{{t('doorControl.cancle')}}</div>
            <div class="title">{{t('doorControl.changeLocation')}}</div>
            <div class="cancelButton" @click="clickConfirm()">{{t('doorControl.confirm')}}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import store from '@/store'
import doorControl from '@/api/doorControl'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Sortable from 'sortablejs'
import { Toast } from '@nutui/nutui'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage, showSuccessMessage } from '@/utils/messageBox'
import router from '@/router'
const { t } = useI18n()
// 判断门状态
enum IsOpenStatus{
  close, // 关门状态
  open, // 开门状态
  offline // 离线状态
}
// 接口返回的开门提示
enum DoorStatus{
  success = 600, // 开门成功
  offLine = 614, // 门离线
  notExecuted = 615 // 开门状态未执行（门离线）
}
// 门列表
interface DoorListType {
    doorName: string, // 门名称
    gateBh: string, // 门编号
    gateOrder: number, // 门顺序
    isOpen: IsOpenStatus // 门状态
}
// 拖动组件
let sortable: Sortable | null = null
// 设置按钮显示
const setButtonShow = ref<boolean>(false)
// 门列表
const doorList = ref<Array<DoorListType>>([])
// 失败信息
const fieldMsg = ref<string>()
const {
  userSerial
} = store.state.user ?? {}
// 点击设置可拖动组件
function clickSetting () {
  setButtonShow.value = true
  if (setButtonShow.value) {
    createSortable()
  }
}
// 点击取消按钮
function clickCancel () {
  doorList.value = []
  setButtonShow.value = false
  sortable?.destroy()
  getDoorControlList()
}
// 点击确认按钮
function clickConfirm () {
  setButtonShow.value = false
  sortable?.destroy()
  saveMenu()
}
// 创建拖动组件
function createSortable () {
  const parentDom: HTMLElement | null = document.querySelector('.entraceGuardOpen-page .doorImg-box')
  if (parentDom) {
    sortable = Sortable.create(parentDom, {
      // 动画时间
      animation: 200,
      delay: 100,
      // 拖动结束
      onEnd: (event) => {
        // 移动之后改变数据
        if (event.oldIndex !== undefined && event.newIndex !== undefined) {
          const element = doorList.value.splice(event.oldIndex, 1)
          doorList.value.splice(event.newIndex, 0, element[0])
        }
      }
    })
  }
}
// 保存结果
function saveMenu () {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  if (userSerial) {
    doorControl.changeLocation({
      doorList: doorList.value.map((menu, index) => { return { gateOrder: index, gateBh: menu.gateBh } }),
      userSerial
    }).then(res => {
      if (res?.code === ResponseCode.success) {
        showSuccessMessage('', {
          title: res.msg
        })
      } else {
        showErrorMessage(res?.msg || t('httpError.systemError'))
      }
    }).finally(() => {
      Toast.hide(loading.uid)
    })
  }
}
// 获取门列表接口函数
async function getDoorControlList () {
  if (userSerial) {
    const res = await doorControl.getDoorControlList(userSerial)
    if (res) {
      if (res.data.length === 0) {
        showErrorMessage(t('doorControl.noMessage'))
        // Toast.text(t('doorControl.noMessage'))
        setTimeout(() => {
          router.replace({ name: 'Home' })
        }, 3000)
      }
      doorList.value = []
      for (let i = 0; i < res.data.length; i++) {
        doorList.value.push({
          doorName: res.data[i].doorName,
          gateBh: res.data[i].gateBh,
          gateOrder: res.data[i].gateOrder,
          isOpen: res.data[i].onlineState === 1 ? IsOpenStatus.close : IsOpenStatus.offline
        })
      }
    }
  }
}
// 点击开门
async function clickOpen (door: DoorListType) {
  // if (door.isOpen === isOpenStatus.offline) {
  //   showWarningMessage('', {
  //     title: '离线设备无法操作',
  //     icon: 'icon-prompt'
  //   })
  //   return
  // }
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  if (userSerial) {
    const res = await doorControl.clickOpen(
      door.gateBh,
      userSerial
    )

    if (res?.data.status === DoorStatus.success) {
      showSuccessMessage('', {
        title: t('doorControl.openSuccess')
      })
      door.isOpen = IsOpenStatus.open
    } else {
      fieldMsg.value = res?.msg
      if (res?.data.status === Number(DoorStatus.offLine) || res?.data.status === Number(DoorStatus.notExecuted)) {
        door.isOpen = IsOpenStatus.offline
      } else {
        door.isOpen = IsOpenStatus.close
      }
      showErrorMessage(res?.msg as string, {
        title: t('doorControl.openField'),
        icon: 'icon-close-circle'
      })
    }
    Toast.hide(loading.uid)
  }
}
onMounted(() => {
  getDoorControlList()
})
</script>
<style lang='scss' scoped>
.entrace-guardOpen-page{
    width: calc(100% - 24px);
    height: calc(100% - 154px);
    margin: 14px 12px 16px;
    border-radius: 16px;
    background-color: $white;
    position: relative;
    overflow: auto;
    .door-img-box{
    display: flex;
    flex-wrap: wrap;
    justify-content:space-between;
    padding: 64px 60px 64px 60px;
    text-align: center;
        .doorImg{
        height: auto;
        margin-bottom: 80px;
        // padding: 64px 16px 38px 60px ;
        img{
            width: 164px;
            height: 164px;
            margin-bottom: 20px;
        }
        .door-List{
           @keyframes appShake {
          0% {
            transform: rotateZ(-2deg);
          }
          100% {
            transform: rotateZ(2deg);
          }
        }
        &.shake {
          animation-name: appShake;
          animation-duration: 0.2s;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-timing-function: linear;
        }
        }

    }
    }
    .setButton{
        width: 680px;
        height: 88px;
        background-color: $color-blue-500;
        text-align: center;
        line-height: 88px;
        margin-left: 24px;
        border-radius: 12px;
        font-size: 32px;
        position: fixed;
        bottom: 33px;
        color: $white;
    }
    .confirmButton-box{
        width: 97%;
        height: 88px;
        position: fixed;
        font-size: 32px;
        bottom: 33px;
        display: flex;
        padding: 0 24px;
        .cancelButton{
            width: 114px;
            height: 76px;
            background-color: $color-blue-500;
            border-radius: 12px;
            text-align: center;
            line-height: 76px;
            color: $white;
        }
        .title{
            width: calc(100% - 276px);
            line-height: 76px;
            text-align: center;
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
