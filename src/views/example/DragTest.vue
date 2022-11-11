<template>
  <div class="drag-test-page">
    <!--  vue3  TransitionGroup 组件  https://cn.vuejs.org/guide/built-ins/transition-group.html-->
    <TransitionGroup name="drag-tes-list">
      <!--   盒子容器   -->
      <div class="box" v-for="(item,index) in dataList" :key="item">
        <!--    盒子 为啥在这写含有动画样式的类 因为在外边那一层写动画样式会影响Sortable的效果    -->
        <div class="box-content" :class="{'drag':isDrag}">
          {{ item }}
          <!--     删除按钮     -->
          <div class="box-btn" v-if="isDrag" @click="removeBox(index)">
            <span class="iconfont icon-close"></span>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
  <nut-button @click="edit" style="margin: 10px">{{ isDrag ? '保存' : '编辑' }}</nut-button>
</template>

<script lang="ts" setup>
import Sortable from 'sortablejs'
import { onMounted, ref } from 'vue'

// 列表数据
const dataList = ref<Array<number>>([])
// 是否数据拖动状态
const isDrag = ref(false)
// 拖动组件
let sortable: Sortable | null = null

// 编辑
function edit () {
  isDrag.value = !isDrag.value
  if (isDrag.value) {
    createSortable()
  } else {
    sortable?.destroy()
  }
}

// 删除元素
function removeBox (index: number) {
  dataList.value.splice(index, 1)
}

// 创建拖动组件
function createSortable () {
  const parentDom: HTMLElement | null = document.querySelector('.drag-test-page')
  if (parentDom) {
    sortable = Sortable.create(parentDom, {
      // 动画时间
      animation: 200,
      // 拖动结束
      onEnd: (event) => {
        // 移动之后改变数据
        if (event.oldIndex !== undefined && event.newIndex !== undefined) {
          const element = dataList.value.splice(event.oldIndex, 1)
          dataList.value.splice(event.newIndex, 0, element[0])
        }
      }
    })
  }
}

onMounted(() => {
  // 初始化数据
  for (let i = 0; i < 10; i++) {
    dataList.value.push(i)
  }
})
</script>

<style lang="scss">
// 颤动动画
@keyframes shake {
  0% {
    transform: rotateZ(-2deg);
  }
  100% {
    transform: rotateZ(2deg);
  }
}

.drag-test-page {
  display: flex;
  flex-wrap: wrap;

  .box {
    width: 100px;
    height: 100px;
    margin: 20px;

    .box-content {
      width: 100%;
      height: 100%;
      background: #0287FF;
      border-radius: 8px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      // 颤动动画
      &.drag {
        animation-name: shake;
        animation-duration: 0.12s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        animation-timing-function: linear;
      }

      .box-btn {
        width: 30px;
        height: 30px;
        line-height: 1;
        background: #fc5346;
        border-radius: 50%;
        position: absolute;
        left: 0;
        top: 0;
        transform: translate(-30%, -30%);
        display: flex;
        align-items: center;
        justify-content: center;

        .iconfont {
          font-size: 25px;
        }

      }
    }
  }

  // 列表动画
  .drag-tes-list-move,
  .drag-tes-list-enter-active,
  .drag-tes-list-leave-active {
    transition: all 0.36s ease;
  }

  .drag-tes-list-enter-from,
  .drag-tes-list-leave-to {
    opacity: 0;
  }
}
</style>
