<template>
  <div class="fly-page">
    <div class="fly-list">
      <div class="fly-list-item" v-for="item in dataList" :key="item">
        <nut-button type="primary" @click="handleFly">添加</nut-button>
      </div>
    </div>
    <div class="fly-box" :class="{'fly':fly}" :style="`top: ${point.y}px;left: ${point.x}px;`"></div>
    <div class="fly-page__footer">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const fly = ref(false)
const dataList = ref<Array<number>>([])
let timer: number | null = null
const point = ref({
  x: 0,
  y: 0
})

for (let i = 0; i < 10; i++) {
  dataList.value.push(i)
}

function handleFly (event: PointerEvent) {
  if (timer) return
  point.value.x = event.clientX
  point.value.y = event.clientY
  fly.value = true

  timer = setTimeout(() => {
    fly.value = false
    timer = null
  }, 980)
}
</script>

<style lang="scss">
@keyframes fly {
  100% {
    top: calc(100% - 50px);
    transform: scale(.5);
    opacity: .5;
  }
}

@keyframes flyX {
  100% {
    left: calc(100% - 40px);
  }
}

.fly-page {
  height: 100vh;
  position: relative;
  overflow: hidden;

  .fly-box {
    width: 80px;
    height: 80px;
    background: #0287FF;
    border-radius: 50%;
    position: absolute;
    display: none;

    // 颤动动画
    &.fly {
      display: block;
      animation: fly 1s ease-in, flyX 1s linear;
    }
  }

  .fly-list-item {
    height: 100px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid $color-black-200;
    padding: 0 20px;
  }

  .fly-list {
    height: calc(100% - 100px);
    overflow: scroll;
  }

  .fly-page__footer {
    height: 100px;
    width: 100%;
    position: fixed;
    bottom: 0;
    border-top: 1px solid $color-blue-500;
  }
}
</style>
