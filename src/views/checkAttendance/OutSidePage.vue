<template>
  <div class="out-side-page">
    <div class="out-side-header">
      <!--  定位相关信息    -->
      <div class="out-side-location-box">
        <div class="out-side-location-info" @click="getAddress">
          <span class="iconfont icon-map1"></span>
          <span>{{ locating || locating === null ? t('clockIn.locating') : address }}</span>
        </div>
        <div class="out-side-date">
          {{ timeStr }} <span>{{ weekDay }}</span>
        </div>
        <div class="out-side-status" :class="{'red-text':checkStatus!==CheckStatusType.canCheck}">
          {{ locating ? '' : checkStatusStr }}
          <span @click="manualLocation()">
            <span class="selfLocation iconfont icon-shoudongdingwei"></span>
            {{ t('outSide.manualLocation') }}
          </span>
        </div>
        <div class="mask iconfont icon-jianzhudiwen"></div>
      </div>
    </div>
    <!--  打卡操作区域  -->
    <div class="outside_content">
      <!-- 选择时段 -->
      <div class="content_timeframe">
        <div class="timeframe_title">{{ t('outSide.selectTimeFrame') }}</div>
        <div class="timeframe_box">
          <div class="timeframe_item" v-for="(item, index) in timeframeList" :key="index">
            <div class="">
              <img :src="item.img" alt="">
            </div>
            <div class="" :class="item.checked ? 'checkedColor' : 'noColor'" @click="selectTimeFrame(item)">{{ item.text }}</div>
          </div>
        </div>
      </div>
      <!-- 客户名称 -->
      <div class="content_clientName">
        <div class="clientName_title">{{ t('outSide.clientName') }}
          <nut-input class="clientNameInput" v-model="clientName" :placeholder="t('pleaseEnter')+t('outSide.clientName')" clearable clear-icon="failure" input-align="right" :border="false" />
        </div>
        <div class="clientName_box">
          <nut-textarea class="clientNameArea" v-model="clientInfo" :placeholder="t('outSide.clientInfo')" limit-show max-length="1000" />
        </div>
      </div>
      <!-- 上传外勤照片 -->
      <div class="content_outSideImg">
        <div class="outSideImg_title">{{ t('outSide.uploadOutSidePhoto') }}</div>
        <div class="outSideImg_box">
          <div class="outSideImg_item" v-for="(item, index) in imgFileList" :key="index">
            <img :src="item" alt="" @click="preViewOutSideImg(index)">
            <span class="delete iconfont icon-cuowumianxing" @click="imgFileList?.splice(index, 1)"></span>
          </div>
          <div class="outSideImg_upload" v-if="imgFileList.length < imgFileLimit">
            <WeSelectFile @change="handelFileChange" :is-multiple="true">
              <span class="upload iconfont icon-add-select"></span>
            </WeSelectFile>
          </div>
        </div>
      </div>
      <footer>
        <nut-button type="info" class="footerBtn" @click="submit()" :disabled="checkStatus!==CheckStatusType.canCheck" v-if="isFaceCheck">{{ t('outSide.checkPhoto') }}</nut-button>
        <nut-button type="info" class="footerBtn" @click="submit()" :disabled="checkStatus!==CheckStatusType.canCheck" v-else>{{ t('outSide.clockIn') }}</nut-button>
      </footer>
    </div>
    <!-- 图片预览 -->
    <WePreviewImage :previewImageList="imgFileList" :is-show="showPreview" @onClose="onClose" :initPage="initPage"></WePreviewImage>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import startImg from '@/assets/images/clockIn/startWork.png'
import endImg from '@/assets/images/clockIn/endWork.png'
import otherImg from '@/assets/images/outSide/other.png'
import { getLocation } from '@/utils/native'
import { AMapHelper } from '@/utils/aMap'
import { formatDate, getWeekDay } from '@/utils/date'
import { Toast } from '@nutui/nutui'
import BaseApi from '@/api/base'
import CheckWorkApi from '@/api/checkWork'
import { ResponseCode } from '@/model/httpType'
import { apiError, fileToBase64 } from '@/utils/tool'
import moment from 'moment'
import store from '@/store'
import { CheckRangeModel } from '@/api/checkWork/model'
import cache, { OutSideInfoKey, FaceRecognitionKey, OpenIdKey, ManualLocationKey } from '@/utils/cache'
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '@/utils/messageBox'
import { aesDecrypt, aesEncrypt } from '@/utils/aesEncrypt'
import router from '@/router'
import WeSelectFile from '@/components/WeSelectFile/index.vue'
import WePreviewImage from '@/components/WePreviewImage/index.vue'

import { SubmitOutSideModel } from '@/api/outSide/model'
import OutSideApi from '@/api/outSide'

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

// 选择考勤时段
interface TimeframeModel {
  img: string,
  text: string,
  checked: boolean,
  fx: string
}
// 手动定位传递参数
interface ManualLocationModel {
  range: number,
  addressLocation: Array<number> | null | undefined
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
// 考勤范围
const checkRangeList = ref<Array<CheckRangeModel>>([])
// 打卡装填
const checkStatus = ref<CheckStatusType>(CheckStatusType.none)
// 提交信息
const submitInfo = ref<{
  lx: '0',
  openId: string,
  userNo: string,
  userSerial: string,
  lname: string
}>({
  lx: '0',
  openId: cache.session.get(OpenIdKey) || '',
  userNo: userNo || '',
  userSerial: userSerial?.toString() || '',
  lname: userLname || ''
})
// 选择时段数据
const timeframeList = ref<Array<TimeframeModel>>([{
  img: startImg,
  text: t('clockIn.startWork') + t('clockIn.clock'),
  checked: false,
  fx: '1'
}, {
  img: endImg,
  text: t('clockIn.endWork') + t('clockIn.clock'),
  checked: false,
  fx: '2'
}, {
  img: otherImg,
  text: t('outSide.other'),
  checked: false,
  fx: '0'
}])
// 客户名称
const clientName = ref<string>()
// 客户详情描述
const clientInfo = ref<string>()
// 始终保留一个当前位置
const currentPosition = ref<Array<number> | null | undefined>()
// 外勤照片列表
const imgFileList = ref<Array<string>>([])
// 外勤照片上次限制
const imgFileLimit = 4
// 照片预览控制
const showPreview = ref<boolean>(false)
// 预览照片初始值
const initPage = ref<number>()
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

// 关闭图片预览
function onClose (val: boolean) {
  if (val) showPreview.value = false
}
// 点击选择时间模块
function selectTimeFrame (val: TimeframeModel) {
  timeframeList.value.forEach(v => {
    v.checked = false
  })
  val.checked = !val.checked
}

// 手动定位
function manualLocation () {
  const queryData: ManualLocationModel = {
    range: 20,
    addressLocation: currentPosition.value
  }
  router.push({
    path: '/selectLocation',
    query: {
      queryData: JSON.stringify(queryData)
    }
  })
}

// 处理图片选择
function handelFileChange (files: Array<File> | null) {
  if (files) {
    if (files.length > imgFileLimit) files = Array.from(files).splice(0, imgFileLimit - imgFileList.value.length)
    for (let i = 0; i < files.length; i++) {
      fileToBase64(files[i]).then((res) => {
        imgFileList.value?.push(res as string)
      })
    }
  }
}

// 图片预览
function preViewOutSideImg (index: number) {
  initPage.value = index
  showPreview.value = true
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
        // 始终保留一个当前位置 用于手动定位 queryData
        currentPosition.value = res
        const manualLocationStr = cache.session.get(ManualLocationKey)
        if (manualLocationStr && JSON.parse(manualLocationStr)) {
          addressLocation.value = JSON.parse(manualLocationStr)
          cache.session.remove(ManualLocationKey)
        } else {
          addressLocation.value = res
        }
        if (checkRangeList.value) {
          checkStatus.value = CheckStatusType.notInRange
          // 判断当前点是否在范围内
          for (let i = 0; i < checkRangeList.value.length; i++) {
            const isInRange = await checkInRange(checkRangeList.value[i], AMap)
            if (isInRange) {
              checkStatus.value = CheckStatusType.canCheck
              break
            }
          }
        }
        await AMapHelper.reGeocoder(AMap, addressLocation.value as number[]).then((addressInfo) => {
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
    isFaceCheck.value = res.data.wqCheck === 2
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
async function submit () {
  let timeFrame = ''
  let isSelect = true
  timeframeList.value.forEach(v => {
    if (v.checked) {
      timeFrame = v.fx
      isSelect = false
    }
  })
  if (isSelect) {
    showWarningMessage(t('outSide.please') + t('outSide.select') + t('outSide.selectTimeFrame'))
    return
  }
  if (!clientName.value?.trim()) {
    showWarningMessage(t('outSide.please') + t('outSide.input') + t('outSide.clientName'))
    return
  }
  if (!imgFileList.value.length) {
    showWarningMessage(t('outSide.please') + t('outSide.uploadOutSidePhoto'))
    return
  }
  const checkInTime = timeStr.value
  // 提交信息
  if (checkStatus.value === CheckStatusType.canCheck && addressLocation.value) {
    const outSideInfo = {
      ...submitInfo.value,
      fx: timeFrame,
      customerName: clientName.value,
      outsideInfo: clientInfo.value,
      wqImages: JSON.stringify(imgFileList.value),
      lx: '0',
      sj: checkInTime,
      jing: addressLocation.value[0].toString(),
      wei: addressLocation.value[1].toString(),
      address: address.value,
      userImage: ''
    }
    if (isFaceCheck.value) {
      // 检测人脸
      // 缓存定位信息 用于后续返回的时候判断如果有信息&&有图片之后直接提交
      cache.session.set(OutSideInfoKey, aesEncrypt(JSON.stringify(outSideInfo)))
      // 跳转到人脸识别页面
      router.push('/faceRecognition')
    } else {
      // 提交信息
      submitData(outSideInfo)
    }
  }
}

// 提交数据
async function submitData (outSideInfo: SubmitOutSideModel) {
  const loading = Toast.loading(t('loading'), {
    duration: 0,
    cover: true
  })
  outSideInfo.wqImages = imgFileList.value.join(',')
  try {
    const res = await OutSideApi.submitOutSide(outSideInfo)
    if (res?.code === ResponseCode.success) {
      showSuccessMessage(t('clockIn.checkTime', { date: outSideInfo.sj }), {
        title: t('outSide.outSideSuccess')
      })
      timeframeList.value.forEach(v => {
        v.checked = false
      })
      clientName.value = ''
      clientInfo.value = ''
      imgFileList.value = []
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

// 根据缓存拿取数据
function getCacheData (outSideInfoStr: string, faceRecognition: string) {
  const outSideInfo = JSON.parse(aesDecrypt(outSideInfoStr as string))
  // 回显数据
  timeframeList.value.forEach(v => {
    if (outSideInfo.fx === v.fx) {
      v.checked = true
    }
  })
  clientName.value = outSideInfo.customerName
  clientInfo.value = outSideInfo.outsideInfo
  imgFileList.value = JSON.parse(outSideInfo.wqImages)
  outSideInfo.userImage = faceRecognition
  submitData(outSideInfo)
}

onMounted(() => {
  document.title = t('title.outSide')
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
    const outSideInfo = cache.session.get(OutSideInfoKey)
    const faceRecognition = cache.session.get(FaceRecognitionKey)
    if (outSideInfo && faceRecognition) {
      getCacheData(outSideInfo, faceRecognition)
      cache.session.remove(OutSideInfoKey)
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
.out-side-page {
  height: 100%;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  position: relative;
  color: $color-black-800;
  .out-side-header, .outside_content {
    background: white;
    margin: 12px 12px 0 12px;
  }
  // 头部地址
  .out-side-header {
    padding: 20px 22px 0;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    .out-side-location-box {
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
      .out-side-location-info {
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
      .out-side-date {
        color: white;
        font-size: 28px;
        margin-left: 68px;
        margin-bottom: 28px;
        span {
          margin-left: 3vw;
        }
      }
      .out-side-status {
        position: relative;
        height: 28px;
        color: white;
        line-height: 1;
        font-size: 28px;
        margin-left: 68px;
        &.red-text {
          color: $color-yellow-500;
        }
        >span{
          position: absolute;
          right: 20px;
          font-size: 24px;
          color: #FFAB33;
          z-index: 99;
          .selfLocation {
            font-size: 28px;
            vertical-align: text-bottom;
          }
        }
      }
    }
  }
  // 内容主体
  .outside_content {
    flex: 1;
    margin-top: 0;
    padding: 32px 20px 26px;
    // 选择时段
    .content_timeframe {
      width: 100%;
      margin-bottom: 40px;
      .timeframe_title {
        width: 100%;
        height: auto;
        font-size: 32px;
        margin-bottom: 20px;
        &::before {
          content: '*';
          color: red;
        }
      }
      .timeframe_box {
        width: 100%;
        height: calc(100% - 22px);
        display: flex;
        justify-content: space-between;
        .timeframe_item {
          width: 203px;
          height: 100%;
          >div:nth-child(1) {
            width: 100%;
            height: 126px;
            text-align: center;
            margin-bottom: 10px;
            img {
              height: 100%;
            }
          }
          >div:nth-child(2) {
            width: 100%;
            height: 80px;
            text-align: center;
            line-height: 80px;
            font-size: 32px;
            border-radius: 12px;
            background-color: #fff;
            box-shadow: 0px 1px 9px 0px rgba(51,51,51,0.21);
          }
          .noColor {
            border: 2px solid #fff;
          }
          .checkedColor {
            border: 2px solid $color-blue-500;
          }
        }
      }
    }
    // 客户名称
    .content_clientName {
      width: 100%;
      margin-bottom: 40px;
      .clientName_title {
        width: 100%;
        height: 80px;
        line-height: 80px;
        font-size: 32px;
        // margin-bottom: 30px;
        &::before {
          content: '*';
          color: red;
        }
        .clientNameInput{
          width: 50%;
          float: right;
          height: 80px;
          line-height: 80px;
          padding: 0;
          input::placeholder {
            color: #C3C6CC;
          }
        }
      }
      .clientName_box {
        width: 100%;
        .clientNameArea{
          width: 676px;
          height: 196px;
          background: #FFFFFF;
          border: 1px solid #DFDFDF;
          border-radius: 8px;
          textarea {
            padding-top: 10px;
            line-height: 40px;
          }
          textarea::placeholder, .nut-textarea__limit {
            color: #C3C6CC;
            font-size: 30px;
          }
        }
      }
    }
    // 上传外勤照片
    .content_outSideImg {
      width: 100%;
      margin-bottom: 60px;
      .outSideImg_title {
        width: 100%;
        height: auto;
        font-size: 32px;
        margin-bottom: 30px;
        &::before {
          content: '*';
          color: red;
        }
      }
      .outSideImg_box {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        .outSideImg_item {
          position: relative;
          width: 135px;
          height: 135px;
          margin-right: 30px;
          float: left;
          margin-bottom: 20px;
          >img {
            width: 100%;
            height: 100%;
          }
          .delete {
            position: absolute;
            top: 0;right: 0;
            transform: translate(50%, -50%);
            color: red;
            font-size: 32px;
          }
        }
        .outSideImg_upload {
          width: 135px;
          height: 135px;
          text-align: center;
          line-height: 135px;
          background-color: #FBFBFB;
          border-radius: 16px;
          border: 1px dashed #E6E6E6;
          float: left;
          margin-bottom: 20px;
          .upload {
            font-size: 80px;
            color: #E6E6E6;
          }
        }
      }
    }
  }
  // 底部按钮
  footer {
    width: 680px;
    background-color: #fff;
    .footerBtn {
      width: 100%;
      height: 88px;
      background-color: $color-blue-500;
      font-size: 36px;
      border-radius: 12px;
    }
  }
}
</style>
