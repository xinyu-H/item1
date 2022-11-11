<template>
  <div class="clock-in-page">
    <div class="clock-in-header">
      <!--  定位相关信息    -->
      <div class="clock-in-location-box">
        <div class="clock-in-location-info" @click="getAddress">
          <span class="iconfont icon-map1"></span>
          <span>{{ locating || locating === null ? t('clockIn.locating') : address }}</span>
        </div>
        <div class="clock-in-date">
          {{ timeStr }} <span>{{ weekDay }}</span>
        </div>
        <div class="clock-in-status" :class="{'red-text':checkStatus!==CheckStatusType.canCheck}">
          {{ locating ? '' : checkStatusStr }}
        </div>
        <div class="mask iconfont icon-jianzhudiwen"></div>
      </div>
      <!--   打卡记录   -->
      <div class="clock-in-record" @click="clockRecord()">
        <span>{{ t('clockIn.record') }}</span>
        <span class="iconfont icon-arrow-right"></span>
      </div>
    </div>
    <!--  打卡操作区域  -->
    <div class="clock-in-action-box">
      <div class="clock-in-action-header">
        <div class="clock-in-action-header-box">
          <img :src="startImg">
          <span>{{ t('clockIn.startWork') }}</span>
        </div>
        <div class="clock-in-action-header-box">
          <img :src="endImg">
          <span>{{ t('clockIn.endWork') }}</span>
        </div>
      </div>
      <div class="clock-in-action-clock-status">
        <div class="clock-in-action-scroll-box">
          <div class="clock-in-action__status" v-if="startWorkRecord.length===0">{{ t('clockIn.noClock') }}</div>
          <template v-else>
            <div class="clock-in-action__status" v-for="item in startWorkRecord" :key="item">{{
                `${t('clockIn.clocked')} ${item}`
              }}
            </div>
          </template>
        </div>
        <div class="clock-in-action-scroll-box">
          <div class="clock-in-action__status" v-if="endWorkRecord.length===0">{{ t('clockIn.noClock') }}</div>
          <template v-else>
            <div class="clock-in-action__status" v-for="item in endWorkRecord" :key="item">{{
                `${t('clockIn.clocked')} ${item}`
              }}
            </div>
          </template>
        </div>
      </div>
      <!--   打卡按钮   -->
      <div class="clock-in-action-footer">
        <div class="clock-in-action__button" :class="{'active':checkStatus===CheckStatusType.canCheck}"
             @click="submit(true)">
          <div class="clock-in-action__button-content">{{ t('clockIn.startWork') + t('clockIn.clock') }}</div>
        </div>
        <div class="clock-in-action__button" :class="{'active':checkStatus===CheckStatusType.canCheck}"
             @click="submit(false)">
          <div class="clock-in-action__button-content">{{ t('clockIn.endWork') + t('clockIn.clock') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import startImg from '@/assets/images/clockIn/startWork.png'
import endImg from '@/assets/images/clockIn/endWork.png'
import { getLocation } from '@/utils/native'
import { AMapHelper } from '@/utils/aMap'
import { formatDate, getWeekDay } from '@/utils/date'
import { Toast } from '@nutui/nutui'
import BaseApi from '@/api/base'
import CheckWorkApi from '@/api/checkWork'
import { ResponseCode } from '@/model/httpType'
import { apiError } from '@/utils/tool'
import moment from 'moment'
import store from '@/store'
import { CheckInModel, CheckRangeModel } from '@/api/checkWork/model'
import cache, { ClockInInfoKey, FaceRecognitionKey, OpenIdKey } from '@/utils/cache'
import { showErrorMessage, showSuccessMessage, showWarningMessageBox } from '@/utils/messageBox'
import { aesDecrypt, aesEncrypt } from '@/utils/aesEncrypt'
import router from '@/router'

const { t } = useI18n()

// 打开状态
enum CheckStatusType {
  // 无状态（正在定位）
  none,
  // 可以打卡
  canCheck,
  // 没有定位
  noLocation,
  // 没有范围
  noRange,
  // 不在范围
  notInRange
}

const {
  userSerial,
  userNo,
  userLname
} = store.state.user ?? {}

// 经纬度
const addressLocation = ref<Array<number> | null | undefined>()
// 地址
const address = ref('')
// 正在定位
const locating = ref<boolean | null>(null)
// 刷新时间的定时器
let timer: any = null
// 获取定位的定时器
let locationTimer: any = null
// 系统时间
const sysDate = ref<Date | null>(null)
// 时间字符串
const timeStr = ref('')
// 周几
const weekDay = ref('')
// 是否检测人脸
const isFaceCheck = ref(false)
// 上班打卡记录
const startWorkRecord = ref<Array<string>>([])
// 下班打卡记录
const endWorkRecord = ref<Array<string>>([])
// 考勤范围
const checkRangeList = ref<Array<CheckRangeModel>>([])
// 打卡装填
const checkStatus = ref<CheckStatusType>(CheckStatusType.none)
// 提交信息
const submitInfo = ref<{
  locationId: number | null | undefined,
  lx: '0',
  openId: string,
  userNo: string,
  userSerial: string,
  lname: string
}>({
  locationId: null,
  lx: '0',
  openId: cache.session.get(OpenIdKey) || '',
  userNo: userNo || '',
  userSerial: userSerial?.toString() || '',
  lname: userLname || ''
})

const checkStatusStr = computed(() => {
  let result = ''
  switch (checkStatus.value) {
    case CheckStatusType.noRange:
    case CheckStatusType.noLocation:
    case CheckStatusType.none:
      result = ''
      break
    case CheckStatusType.canCheck:
      result = t('clockIn.canCheckIn')
      break
    case CheckStatusType.notInRange:
      result = t('clockIn.notInRange')
      break
  }
  return result
})

watch(sysDate, value => {
  if (value) {
    weekDay.value = getWeekDay(value, t)
    timeStr.value = formatDate(value, 'YYYY-MM-DD HH:mm:ss')
  }
})
function clockRecord () {
  router.push({ name: 'LateRecordedPage' })
}
// 获取地址
function getAddress () {
  if (locating.value) {
    return
  }
  locating.value = true
  AMapHelper.load().then((AMap) => {
    getLocation(AMap).then(async res => {
      if (res) {
        addressLocation.value = res
        if (checkRangeList.value) {
          checkStatus.value = CheckStatusType.notInRange
          // 判断当前点是否在范围内
          for (let i = 0; i < checkRangeList.value.length; i++) {
            const isInRange = await checkInRange(checkRangeList.value[i], AMap)
            if (isInRange) {
              submitInfo.value.locationId = checkRangeList.value[i].locationId
              checkStatus.value = CheckStatusType.canCheck
              break
            }
          }
        }
        await AMapHelper.reGeocoder(AMap, res).then((addressInfo) => {
          address.value = addressInfo.formattedAddress
        })
      } else {
        return Promise.reject()
      }
    }).catch(() => {
      address.value = t('clockIn.seekFailed')
      checkStatus.value = CheckStatusType.noLocation
    }).finally(() => {
      locating.value = false
    })
  })
}

// 检查点是否在范围里面
async function checkInRange (rangeInfo: CheckRangeModel, AMap: any) {
  const longitude = Number.parseFloat(rangeInfo.longitude)
  const latitude = Number.parseFloat(rangeInfo.latitude)
  const range = Number.parseFloat(rangeInfo.range)
  const res = await AMapHelper.convertGps(AMap, [longitude, latitude], 'baidu')
  if (res) {
    if (AMap.GeometryUtil.distance(res, addressLocation.value) <= range) {
      return true
    }
  }

  return false
}

// 循环获取时间
function getTimeStr () {
  timer = setInterval(() => {
    sysDate.value = moment(sysDate.value).add(1, 'second').toDate()
  }, 1000)
}

// 获取系统时间
async function getSystemDate (): Promise<boolean> {
  const res = await BaseApi.getSystemDate()
  if (res?.code === ResponseCode.success) {
    sysDate.value = moment(res.data.sysDate).toDate()
    getTimeStr()
  } else {
    apiError(res?.msg, t)
    return false
  }
  return true
}

// 获取考勤配置（判断是否需要人脸识别）
async function getSetting () {
  const res = await CheckWorkApi.getCheckWorkSetting()
  if (res?.code === ResponseCode.success) {
    // 判断是否开启人脸检测
    isFaceCheck.value = res.data.dwCheck === 2
  } else {
    apiError(res?.msg, t)
    return false
  }
  return true
}

/**
 * 获取考勤记录
 */
async function getCheckWorkRecord () {
  if (!userSerial) {
    return false
  }
  const res = await CheckWorkApi.getCheckWorkRecord(userSerial.toString(), timeStr.value)
  if (res?.code === ResponseCode.success) {
    startWorkRecord.value = []
    endWorkRecord.value = []
    res.data?.forEach(item => {
      if (item.fx === '1') {
        // 上班
        startWorkRecord.value.push(item.sj.slice(11, item.sj.length))
      } else {
        // 下班
        endWorkRecord.value.push(item.sj.slice(11, item.sj.length))
      }
    })
  } else {
    apiError(res?.msg, t)
    return false
  }
  return true
}

// 获取考勤范围
async function getCheckWorkRange () {
  if (!userSerial) {
    return false
  }
  const res = await CheckWorkApi.getCheckWorkRange(userSerial.toString())
  if (res?.code === ResponseCode.success) {
    if (res.data && res.data.length > 0) {
      checkRangeList.value = res.data
    } else {
      checkStatus.value = CheckStatusType.noRange
    }
  } else {
    apiError(res?.msg, t)
    return false
  }
  return true
}

// 提交
async function submit (isStartWork: boolean) {
  if (checkStatus.value === CheckStatusType.canCheck && addressLocation.value && submitInfo.value.locationId) {
    const res = await showWarningMessageBox(t('clockIn.pleaseCheckClockIn',
      { work: isStartWork ? t('clockIn.startWork') : t('clockIn.endWork') }), {
      title: t('confirmMessage'),
      confirmBtn: t('confirm'),
      cancelBtn: t('cancel')
    })

    if (!res) {
      return
    }

    const checkInTime = timeStr.value
    // 提交信息
    const clockInInfo = {
      ...submitInfo.value,
      lx: '0',
      fx: isStartWork ? 1 : 2,
      sj: checkInTime,
      jing: addressLocation.value[0],
      wei: addressLocation.value[1],
      address: address.value,
      locationId: submitInfo.value.locationId
    }

    if (isFaceCheck.value) {
      // 检测人脸
      // 缓存定位信息 用于后续返回的时候判断如果有信息&&有图片之后直接提交
      cache.session.set(ClockInInfoKey, aesEncrypt(JSON.stringify(clockInInfo)))
      // 跳转到人脸识别页面
      router.push('/faceRecognition')
    } else {
      // 提交信息
      submitData(clockInInfo)
    }
  }
}

// 提交数据
async function submitData (checkInInfo: CheckInModel) {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  try {
    const res = await CheckWorkApi.checkIn(checkInInfo)
    if (res?.code === ResponseCode.success) {
      showSuccessMessage(t('clockIn.checkTime', { date: checkInInfo.sj }), {
        title: t('clockIn.checkInSuccess')
      })
      await getCheckWorkRecord()
    } else {
      showErrorMessage(res?.msg || t('httpError.systemError'), { closeMillisecond: 5000 })
    }
  } catch (e) {

  }
  Toast.hide(loading.uid)
}

// 初始化
async function init () {
  const loadingToast = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  try {
    const sysDateRes = await getSystemDate()
    if (!sysDateRes) {
      return
    }
    const recordRes = await getCheckWorkRecord()
    if (!recordRes) {
      return
    }
    const settingRes = await getSetting()
    if (!settingRes) {
      return
    }
    const rangeRes = await getCheckWorkRange()
    if (!rangeRes) {
      return
    }
    getAddress()
  } catch (e) {

  } finally {
    Toast.hide(loadingToast.uid)
  }
}

// 根据缓存信息进行提交
function submitByCache (clockInInfoStr: string, faceRecognition: string) {
  const clockInInfo = JSON.parse(aesDecrypt(clockInInfoStr)) as CheckInModel
  clockInInfo.userImage = faceRecognition
  submitData(clockInInfo)
}

onMounted(() => {
  document.title = t('title.clockIn')
  nextTick(() => {
    clearInterval(timer)
    clearInterval(locationTimer)
    init()
    locationTimer = setInterval(init, 5 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        clearInterval(timer)
        clearInterval(locationTimer)
        init()
        locationTimer = setInterval(init, 5 * 60 * 1000)
      }
    })

    // 如果本地有提交记录的缓存&&有图片缓存 则直接走提交
    const clockInInfo = cache.session.get(ClockInInfoKey)
    const faceRecognition = cache.session.get(FaceRecognitionKey)
    if (clockInInfo && faceRecognition) {
      submitByCache(clockInInfo, faceRecognition)
      cache.session.remove(ClockInInfoKey)
      cache.session.remove(FaceRecognitionKey)
    }
  })
})

onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(locationTimer)
})
</script>

<style lang="scss">
.clock-in-page {
  height: 100%;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  position: relative;

  .clock-in-header, .clock-in-action-box {
    background: white;
    border-radius: 16px;
    margin: 12px;
  }

  .clock-in-header {
    padding: 20px 22px 0;

    .clock-in-location-box {
      background: linear-gradient(101deg, #2BB5FF, #007DFF, #0067FF);
      border-radius: 16px;
      position: relative;
      padding: 38px 0;

      .mask {
        right: 8px;
        bottom: 0;
        color: #BDD6EF;
        opacity: .2;
        font-size: 190px;
        position: absolute;
      }

      .clock-in-location-info {
        color: white;
        font-size: 28px;
        display: flex;
        position: relative;
        z-index: 2;
        padding-right: 40px;
        margin-bottom: 28px;

        .iconfont {
          width: 46px;
          text-align: center;
          flex-shrink: 0;
          font-size: 28px;
          margin-top: 2px;
          margin-left: 20px;
        }
      }

      .clock-in-date {
        color: white;
        font-size: 28px;
        margin-left: 68px;
        margin-bottom: 28px;

        span {
          margin-left: 3vw;
        }
      }

      .clock-in-status {
        height: 28px;
        color: white;
        line-height: 1;
        font-size: 28px;
        margin-left: 68px;

        &.red-text {
          color: $color-yellow-500;
        }
      }
    }

    .clock-in-record {
      height: 104px;
      color: $color-black-800;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .iconfont {
        color: $color-black-600;
        font-size: 32px;
      }
    }
  }

  .clock-in-action-box {
    flex: 1;
    height: 0;
    margin-top: 0;
    padding: 32px 20px 26px;

    .clock-in-action-header {
      height: 322px;
      display: flex;

      .clock-in-action-header-box {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        &:first-child {
          border-bottom: 4px solid $color-green-500;
        }

        &:last-child {
          border-bottom: 4px solid $color-blue-500;
        }

        img {
          height: 164px;
          object-fit: cover;
          margin-bottom: 28px;
        }

        span {
          color: $color-black-800;
          font-size: 32px;
        }
      }
    }

    .clock-in-action-clock-status {
      height: calc(100% - 322px - 200px);
      display: flex;
      margin-bottom: 30px;

      .clock-in-action-scroll-box {
        height: 100%;
        width: 50%;
        overflow: scroll;
      }

      .clock-in-action__status {
        flex: 1;
        height: 80px;
        color: $color-black-800;
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .clock-in-action-footer {
      display: flex;
      justify-content: space-between;

      .clock-in-action__button {
        width: 45%;
        height: 108px;
        border-radius: 15px;
        position: relative;

        &.active {
          .clock-in-action__button-content {
            color: white;
          }
        }

        .clock-in-action__button-content {
          color: $color-black-400;
          font-size: 32px;
          transform: translate(-50%, -50%);
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 9;
        }

        &:first-child {
          background: $color-black-200;

          &.active {
            background: $color-green-500;

            &:after {
              background: $color-green-500;
            }

            &:active {
              background: $color-green-600;

              &:after {
                background: $color-green-600;
              }
            }
          }

          .clock-in-action__button-content {
            margin-right: -20px;
          }

          &:after {
            content: '';
            height: 100%;
            width: 50%;
            border-radius: 15px;
            transform: skewX(-15deg);
            background: $color-black-200;
            position: absolute;
            top: 0;
            right: -20px;
          }
        }

        &:last-child {
          background: $color-black-200;

          &.active {
            background: $color-blue-500;

            &:after {
              background: $color-blue-500;
            }

            &:active {
              background: $color-blue-600;

              &:after {
                background: $color-blue-600;
              }
            }
          }

          .clock-in-action__button-content {
            margin-right: -20px;
          }

          &:after {
            content: '';
            height: 100%;
            width: 50%;
            border-radius: 15px;
            transform: skewX(-15deg);
            background: $color-black-200;
            position: absolute;
            top: 0;
            left: -20px;
          }
        }
      }
    }
  }
}
</style>
