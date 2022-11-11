<template>
  <div class="select-location-page">
    <div class="select-location-map" id="locationPage"></div>
    <div class="map-center-icon iconfont icon-map1">
      <div class="map-center-info" v-if="address">
        {{ address }}
      </div>
    </div>
    <div class="select-location-action-box">
      <nut-button class="select-location-action__btn" size="large" @click="router.go(-1)">
        {{ t('tool.cancel') }}
      </nut-button>
      <nut-button class="select-location-action__btn" size="large" type="primary" @click="confirmLocation()" :disabled="isIn">
        {{ t('tool.confirm') }}
      </nut-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { AMapHelper } from '@/utils/aMap'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import { useRoute } from 'vue-router'
import cache, { ManualLocationKey } from '@/utils/cache'

const { t } = useI18n()

// 地址
const address = ref('')
const distance = ref(0)
const isIn = ref<boolean>(false)
let oldCenter = [121.396987, 37.420003]
let maxDistance = 50
let coord:Array<number> = []
function confirmLocation () {
  if (!isIn.value) {
    cache.session.set(ManualLocationKey, JSON.stringify(coord))
    router.go(-1)
  }
}
onMounted(() => {
  // 获取query 参数 因为外勤考勤定位值不确定 需要变化
  const route = useRoute()
  if (route.query.queryData) {
    const { range, addressLocation } = JSON.parse(route.query.queryData.toString())
    if (range) maxDistance = range
    if (addressLocation) oldCenter = addressLocation
  }
  AMapHelper.load().then(AMap => {
    const map = new AMap.Map('locationPage')
    map.setCenter(oldCenter, true)
    map.setZoom(19, true)
    const circle = new AMap.Circle({
      center: new AMap.LngLat(oldCenter[0], oldCenter[1]),
      radius: maxDistance, // 圆半径
      fillColor: '#e6f3ff', // 圆形填充颜色
      strokeColor: '#b3dbff', // 描边颜色
      strokeWeight: 2 // 描边宽度
    })

    map.add(circle)
    map.on('moveend', () => {
      const center = map.getCenter()
      coord = [center.lng, center.lat]
      distance.value = Math.floor(AMap.GeometryUtil.distance(center, oldCenter))
      if (distance.value > maxDistance) {
        address.value = t('clockIn.overDistanceMessage', {
          distance: distance.value,
          maxDistance: maxDistance
        })
        isIn.value = true
      } else {
        AMapHelper.reGeocoder(AMap, center).then((addressInfo) => {
          address.value = addressInfo.formattedAddress
        })
        isIn.value = false
      }
    })
  })
})
</script>

<style lang="scss">
.select-location-page {
  height: 100%;

  .select-location-map {
    height: 100%;
  }

  .map-center-icon {
    font-size: 80px;
    color: $color-blue-500;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -100%);

    .map-center-info {
      width: 56vw;
      font-size: 30px;
      background: white;
      border: 1px solid $color-blue-500;
      border-radius: 8px;
      position: absolute;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      padding: 20px;
    }
  }

  .select-location-action-box {
    width: 100%;
    height: 140px;
    background: white;
    box-shadow: 0 8px 4px 8px $color-black-300;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    z-index: 999;
    bottom: 0;
    left: 0;

    .select-location-action__btn {
      width: 40vw;

      & + .select-location-action__btn {
        margin-left: 20px;
      }
    }
  }
}
</style>
