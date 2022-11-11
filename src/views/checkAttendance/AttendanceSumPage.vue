<template>
  <div class="attendance-sum-page">
    <calendar @change="changeTime"></calendar>
    <!-- 打卡时间统计 首次打卡末次打卡，月份打卡统计-->
    <div class="punch-card-statistics-box">
      <!-- 当日打卡时间统计 -->
      <div class="day-time" v-if="monthShow">
        <div class="first-last-time">
          <div>{{ t('attendanceSum.firstTime') }}</div>
          <p v-show="firstTimeShow">_ _ _</p>
          <p v-show="!firstTimeShow">{{firstTime}}</p>
        </div>
        <div class="divided-line"></div>
        <div class="first-last-time">
          {{ t('attendanceSum.lastTime') }}
          <p v-show="lastTimeShow">_ _ _</p>
          <p v-show="!lastTimeShow">{{lastTime}}</p>
        </div>
      </div>
      <!-- 当月打卡时间统计 -->
      <div class="month-time" v-else>
        <div class="month-time-top">
          <div class="month-time-top-left">
            <div class="month-time-sum">
              <div>{{ formatDate(selectDay, 'MM') }}{{ t('attendanceSum.monthday') }}</div>
              <div>{{ t('attendanceSum.attendancesum') }}</div>
            </div>
          </div>
          <div class="month-time-top-right">
            <div>{{sumDay}}<span>/{{monthNumber}}{{ t('attendanceSum.day2') }}</span></div>
          </div>
        </div>
        <div class="month-time-bottom">
          <div class="month-time-bottom-box" v-for="index in 4" :key="index" @click="RouterChange(index)">
            <div>{{ t('attendanceSum.leave' + (index - 1)) }}</div>
            <div><span>{{total[index - 1]}}</span>{{ t('attendanceSum.day') }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 打卡进度条每日打卡具体时间显示 -->
    <div class="progress-bar">
      <div class="progress-bar-box" v-for="(item, index) in monthList" :key="index" @click.self="popoverShow(item.date , index)">
        <div class="progress-bar-date">
          <div>{{ formatDate(item.date, 'MM-DD') }}</div>
          <div>{{ getWeekDay(item.date, t).replace('周', '星期') }}</div>
        </div>
        <div class="progress-bar-point" :class="'index'+index">
          <div class="progress-bar-point-success" v-if="startTimeList[index] || endTimeList[index]">
            <div class="progress-bar-point-success-child"></div>
          </div>
          <div class="progress-bar-point-default" v-if="!startTimeList[index] && !endTimeList[index]">
            <div class="progress-bar-point-default-child"></div>
          </div>
          <div class="progress-bar-line"></div>
        </div>
        <div class="progress-bar-time" @click="clickTime(item.date , index )">
          <div>
            <div v-if="!startTimeList[index] && !endTimeList[index]">{{ t('attendanceSum.nopunch') }}</div>
            <div v-if="startTimeList[index]">{{ t('attendanceSum.firstpunch') }} {{startTimeList[index]}}</div>
            <div v-if="endTimeList[index]">{{ t('attendanceSum.lastpunch') }} {{endTimeList[index]}}</div>
          </div>
          <div v-show="item.isShow" :class="(index > (monthList.length - 4)) ? 'popover-list-box' : 'popover-box'" v-if="startTimeList[index] || endTimeList[index]">
            <div>{{t('attendanceSum.punchCardTime')}}</div>
            <li v-for="index in timelist" :key="index">{{index}}</li>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatDate, getWeekDay, getMonthStart } from '@/utils/date'
import Calendar from '@/views/checkAttendance/components/Calendar.vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import checkWorkApi from '@/api/checkWork'
import store from '@/store'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import router from '@/router'

const { t } = useI18n()
// 日期显示
const selectDay = ref<Date>(new Date())
// 显示月份统计的打卡时间或者一天的最早最晚打卡时间
const monthShow = ref<boolean>(true)
// 当前日期
const now = new Date()
// 当月第一天
const monthStart = ref<Date>()
// 当前月可查看的打卡日期
const monthList = ref<Array<{
  date: Date
  isShow: boolean
}>>([])
// 当前月的天数
const monthNumber = ref()
const {
  userSerial
} = store.state.user ?? {}
// 是否有首次打卡时间
const firstTimeShow = ref<boolean>(true)
// 是否有末次打卡时间
const lastTimeShow = ref<boolean>(true)
// 一天内的打卡时间列表
const timelist = ref<Array<string>>([])
// 首次打卡时间
const firstTime = ref<string>()
// 末次打卡时间
const lastTime = ref<string>()
// 月打卡时间汇总
const sumDay = ref<string>('0')
// 首次打卡时间列表
const startTimeList = ref<Array<string>>([])
// 末次打卡时间列表
const endTimeList = ref<Array<string>>([])
// 迟到时间
const late = ref<string>()
// 请假时间
const leave = ref<string>()
// 旷工时间
const absenteeism = ref<string>()
// 出差时间
const goOut = ref<string>()
// 迟到请假早退矿工总数据表
const total = ref<Array<string>>([])
// 日历组件选择日期的传入
function changeTime (date: Date) {
  if (date) {
    selectDay.value = date
    monthStart.value = getMonthStart(date)
    if (now.getMonth() !== date.getMonth() || now.getFullYear() !== date.getFullYear()) {
      monthShow.value = false
    } else {
      monthShow.value = true
    }
    // 获取指定月份的总天数
    const nowDay = date.getDate()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const days = new Date(year, month, 0)
    monthNumber.value = days.getDate() + '.0'

    monthList.value = []
    for (let i = 0; i < nowDay; i++) {
      const day: Date = new Date(date.getTime() - (i * 3600 * 24 * 1000))
      monthList.value.push({
        date: day,
        isShow: false
      })
    }
    getLeaveTime(date)
    getAttendanceTime(date)
  }
}
// 点击出现一天内所有打卡时间列表
function clickTime (date: Date, index :number) {
  getClockTime(date)
  monthList.value.forEach(item => {
    item.isShow = false
  })
  monthList.value[index].isShow = true
}
function popoverShow (date: Date, index :number) {
  getClockTime(date)
  monthList.value.forEach(item => {
    item.isShow = false
  })
  monthList.value[index].isShow = false
}

// 跳转详细数据信息界面
function RouterChange (index : number) {
  const queryData: Date = selectDay.value
  router.push({
    name: 'LateRecordedPage',
    query: {
      msg: JSON.stringify(queryData),
      Number: index - 1
    }
  })
  // console.log(index)
}
// 获取某一天的所有打卡时间
async function getClockTime (date :Date) {
  if (userSerial) {
    timelist.value = []
    const res = await checkWorkApi.getClockInTime(userSerial.toString(), formatDate(date, 'YYYY-MM-DD'))
    if (res?.code === ResponseCode.success) {
      timelist.value = []
      for (let i = 0; i < res.data.length; i++) {
        timelist.value.push(res.data[i].sj)
      }
    } else {
      showErrorMessage(res?.msg || t('httpError.systemError'), { closeMillisecond: 5000 })
      return false
    }
    return true
  }
}
// 获取请假、迟到、早退、旷工时间
async function getLeaveTime (date:Date) {
  if (userSerial) {
    const res = await checkWorkApi.getLeaveTime(userSerial.toString(), formatDate(date, 'YYYY-MM-DD'))
    if (res?.code === ResponseCode.success) {
      // console.log('res:', res)
      late.value = res.data[0].late
      leave.value = res.data[0].leave
      absenteeism.value = res.data[0].absenteeism
      goOut.value = res.data[0].goout
      total.value = [leave.value, late.value, goOut.value, absenteeism.value]
    } else {
      showErrorMessage(res?.msg || t('httpError.systemError'), { closeMillisecond: 5000 })
      return false
    }
    return true
  }
}

// 获取打卡时间列表首末次打卡时间
async function getAttendanceTime (date:Date) {
  if (userSerial) {
    const res = await checkWorkApi.getAttendanceInTime(userSerial.toString(), formatDate(date, 'YYYY-MM-DD'))
    if (res?.code === ResponseCode.success) {
      startTimeList.value = []
      endTimeList.value = []
      firstTimeShow.value = true
      lastTimeShow.value = true
      for (let i = 0; i < res.data.length; i++) {
        if (res.data[i].startTime === '00:00:00' && res.data[i].endTime === '00:00:00') {
          res.data[i].startTime = ''
          res.data[i].endTime = ''
        } else {
          startTimeList.value.push(res.data[i].startTime)
          endTimeList.value.push(res.data[i].endTime)
        }
        let punchCardSum = 0
        for (let i = 0; i < startTimeList.value.length; i++) {
          sumDay.value = '0.0'
          if (startTimeList.value[i] !== '') {
            punchCardSum = punchCardSum + 1
          }
          sumDay.value = '0.0'
          sumDay.value = punchCardSum + '.0'
        }
        if (formatDate(selectDay.value, 'YYYY-MM-DD') === res.data[i].date) {
          firstTime.value = res.data[i].startTime
          lastTime.value = res.data[i].endTime
          if (firstTime.value) {
            firstTimeShow.value = false
          }
          if (lastTime.value) {
            lastTimeShow.value = false
          }
        }
      }
    } else {
      showErrorMessage(res?.msg || t('httpError.systemError'), { closeMillisecond: 5000 })
      return false
    }
    return true
  }
}
onMounted(() => {
  changeTime(now)
  getClockTime(now)
  getLeaveTime(now)
  getAttendanceTime(now)
})
</script>

<style lang="scss" scoped>
.attendance-sum-page {
  height: calc(100% - 10px);
  background: white;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  padding: 28px 24px 38px;
  box-sizing: border-box;
  font-family: Sans-serif;

  .punch-card-statistics-box {
    width: 100%;
    border-radius: 18px;
    background: linear-gradient(40deg, #2aa7f7, #226bde);
    margin-top: 15px;
    margin-bottom: 60px;

    .day-time {
      width: 100%;
      height: 270px;
      display: flex;
      flex: 1;
      align-items: center;

      .first-last-time {
        width: calc(50% - 1px);
        height: 100%;
        color: white;
        font-size: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .divided-line {
        width: 2px;
        height: 150px;
        background-color: #8ec9ff;
      }
    }

    .month-time {
      width: 100%;
      height: 100%;

      .month-time-top {
        width: 100%;
        height: 168px;
        display: flex;

        .month-time-top-left {
          width: 50%;
          height: 100%;

          .month-time-sum {
            width: 50%;
            height: 100%;
            color: white;
            font-size: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top:8px;
          }
        }

        .month-time-top-right {
          width: 50%;
          height: 100%;
          color: white;
          font-size: 80px;
          padding-top: 40px;

          span {
            font-size: 36px;
          }
        }
      }

      .month-time-bottom {
        width: 100%;
        // height: calc(100% - 168px);
        background: #409eff;
        color: white;
        border-bottom-right-radius: 18px;
        border-bottom-left-radius: 18px;
        display: flex;
        flex: 1;

        .month-time-bottom-box {
          width: 25%;
          height: 100%;
          text-align: center;
          padding: 10px 0;
          font-size: 26px;
          position: relative;

          span {
            font-size: 36px;
          }

          & + .month-time-bottom-box {
            &::before {
              content: "";
              height: 45px;
              width: 2px;
              background: #8ec9ff;
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
            }
          }
        }
      }
    }
  }

  .progress-bar {
    height: 0;
    overflow: auto;
    flex: 1;
  }

  .progress-bar-box {
    width: 100%;
    height: 120px;
    display: flex;
    font-size: 30px;
    color: #454545;
    padding-left: 50px;
    box-sizing: border-box;

    .progress-bar-date {
      margin-right: 58px;
    }

    .progress-bar-line {
      width: 3px;
      height: 100%;
      background-color: #EEEEEE;
      margin-right: 36px;
    }

    .progress-bar-point-success {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-left: -9px;
      margin-top: 6px;
      background: #D9ECFF;

      .progress-bar-point-success-child {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #409EFF;
        position: relative;
        top: 4px;
        left: 4px;
      }
    }

    .progress-bar-point-default {
      width: 19px;
      height: 19px;
      border-radius: 50%;
      margin-top: 6px;
      margin-left: -9px;
      border: #409EFF 1px solid;

      .progress-bar-point-default-child {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #409EFF;
        position: relative;
        top: 6px;
        left: 6px;
      }
    }
    .progress-bar-time {
      position: relative;
    }
  }
  .popover-box{
    width: 400px;
    height: auto;
    background-color: #F3F8FF;
    text-align: center;
    font-size: 30px;
    color: #20456A;
    line-height: 70px;
    z-index: 99;
    position:absolute;
    left: -4px;
    top: 6px;
    min-height: 120px;
    max-height: 400px;
    border-radius: 16px;
    overflow: auto;
    box-shadow: 2px 2px 16px 0px rgba(8,23,47,0.16);
    li{
      font-size: 26px;
    }
  }
  .popover-list-box{
    width: 400px;
    height: auto;
    background-color: #F3F8FF;
    text-align: center;
    font-size: 30px;
    color: #20456A;
    line-height: 70px;
    z-index: 99;
    position:absolute;
    left: -4px;
    bottom: 0;
    min-height: 120px;
    max-height: 400px;
    border-radius: 16px;
    overflow: auto;
    box-shadow: 2px 2px 16px 0px rgba(8,23,47,0.16);
    li{
      font-size: 26px;
    }
  }
}
</style>
