<template>
  <div class="late-record-page">
    <div class="header-box">
      <nut-tabs v-model="tab1value">
        <nut-tabpane :title= "t('attendanceSum.leave1')">
          <div class="bar-box">
            <div class="no-dtae-box" v-show="nodata">
              <img src="../../assets/images/clockIn/noData.png" alt="">
              <div>{{t('attendanceSum.noData')}}</div>
            </div>
            <div class="progress-bar-box" v-for="index in lateList" :key="index">
              <div class="progress-bar-date">
                <div>{{index.date.slice(5)}}</div>
                <div>{{index.week}}</div>
                 </div>
              <div class="progress-bar-point">
                <div class="progress-bar-point-success">
                  <div class="progress-bar-point-success-child"></div>
                </div>
                <div class="progress-bar-line"></div>
              </div>
              <div class="progress-bar-time">
                {{t('attendanceSum.leave1')}}
              </div>
            </div>
          </div>
        </nut-tabpane>
        <nut-tabpane :title="t('attendanceSum.leave2')">
          <div class="bar-box" v-show="nodata2">
            <div class="no-dtae-box">
              <img src="../../assets/images/clockIn/noData.png" alt="">
              <div>{{t('attendanceSum.noData')}}</div>
            </div>
            <div class="progress-bar-box" v-for="index in earlyList" :key="index">
              <div class="progress-bar-date">
                <div>{{index.date.slice(5)}}</div>
                <div>{{index.week}}</div>
                 </div>
              <div class="progress-bar-point">
                <div class="progress-bar-point-success">
                  <div class="progress-bar-point-success-child"></div>
                </div>
                <div class="progress-bar-line"></div>
              </div>
              <div class="progress-bar-time">
                {{t('attendanceSum.leave2')}}
              </div>
            </div>
          </div>
        </nut-tabpane>
        <nut-tabpane :title="t('attendanceSum.leave0')">
          <div class="bar-box">
            <div class="no-dtae-box" v-show="nodata3">
              <img src="../../assets/images/clockIn/noData.png" alt="">
              <div>{{t('attendanceSum.noData')}}</div>
            </div>
            <div class="progress-bar-box" v-for="index in leaveList" :key="index">
              <div class="progress-bar-date">
                <div>{{index.date.slice(5)}}</div>
                <div>{{index.week}}</div>
                 </div>
              <div class="progress-bar-point">
                <div class="progress-bar-point-success">
                  <div class="progress-bar-point-success-child"></div>
                </div>
                <div class="progress-bar-line"></div>
              </div>
              <div class="progress-bar-time">
                {{t('attendanceSum.leave0')}}
              </div>
            </div>
          </div>
        </nut-tabpane>
        <nut-tabpane :title="t('attendanceSum.leave3')">
          <div class="bar-box">
            <div class="no-dtae-box" v-show="nodata4">
              <img src="../../assets/images/clockIn/noData.png" alt="">
              <div>{{t('attendanceSum.noData')}}</div>
            </div>
            <div class="progress-bar-box" v-for="index in absenteeismList" :key="index">
              <div class="progress-bar-date">
                <div>{{index.date.slice(5)}}</div>
                <div>{{index.week}}</div>
                 </div>
              <div class="progress-bar-point">
                <div class="progress-bar-point-success">
                  <div class="progress-bar-point-success-child"></div>
                </div>
                <div class="progress-bar-line"></div>
              </div>
              <div class="progress-bar-time">
                {{t('attendanceSum.leave3')}}
              </div>
            </div>
          </div>
        </nut-tabpane>
      </nut-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import store from '@/store'
import { useI18n } from 'vue-i18n'
import checkWorkApi from '@/api/checkWork'
import { formatDate, getMonthEnd } from '@/utils/date'
import { ResponseCode } from '@/model/httpType'
import { showErrorMessage } from '@/utils/messageBox'
import { useRoute } from 'vue-router'
const route = useRoute()
const { t } = useI18n()
enum Type {
  // 旷工
  absenteeism = '3',
  // 请假
  leave = '2',
  // 迟到
  late = '1',
  // 早退
  early = '4',
  // 0
  zero = '0'
}
interface ListType {
    date: string, // 日期
    week: string, // 周几
    stratTime: string, // 开始时间
    endTime: string, // 结束时间
}
// Tabs组件所选标签
const tab1value = ref<number>(0)
// const state = reactive({ tab1value: 0 })
const {
  userSerial
} = store.state.user ?? {}
// 获取早退列表
const earlyList = ref<Array<ListType>>([])
// 获取迟到列表
const lateList = ref<Array<ListType>>([])
// 获取请假列表
const leaveList = ref<Array<ListType>>([])
// 获取旷工列表
const absenteeismList = ref<Array<ListType>>([])
// 旷工页面无打卡信息显示暂无数据
const nodata4 = ref<boolean>(true)
// 请假页面无打卡信息显示暂无数据
const nodata3 = ref<boolean>(true)
// 迟到页面无打卡信息显示暂无数据
const nodata = ref<boolean>(true)
// 早退页面无打卡信息显示暂无数据
const nodata2 = ref<boolean>(true)

// 获取迟到早退请假旷工的接口数据
async function getAttendanceTime (date:Date) {
  if (userSerial) {
    const res = await checkWorkApi.getAttendanceInTime(userSerial.toString(), formatDate(date, 'YYYY-MM-DD'))
    if (res?.code === ResponseCode.success) {
      for (let i = 0; i < res.data.length; i++) {
        const listData = {
          date: res.data[i].date,
          week: res.data[i].week,
          stratTime: res.data[i].startTime,
          endTime: res.data[i].endTime
        }
        if (res.data[i].type === Type.absenteeism) {
          absenteeismList.value.push(listData)
          if (absenteeismList.value) {
            nodata4.value = false
          }
        }
        if (res.data[i].type === Type.leave) {
          leaveList.value.push(listData)
          if (leaveList.value) {
            nodata3.value = false
          }
        }
        if (res.data[i].type === Type.late) {
          lateList.value.push(listData)
          if (lateList.value) {
            nodata.value = false
          }
        }
        if (res.data[i].type === Type.early) {
          earlyList.value.push(listData)
          if (lateList.value) {
            nodata2.value = false
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
  const selectDay = route.query.msg
  const selectNmber = route.query.Number
  if (selectDay) {
    const monthEnd = getMonthEnd(JSON.parse(selectDay.toString()))
    getAttendanceTime(monthEnd)
    if (selectNmber === Type.zero) {
      tab1value.value = 2
    } else if (selectNmber === Type.late) { // 此处type.late对应不准确，因为tab1value的值从0开始，type值加1的对应意义才是对应的
      tab1value.value = 0
    } else if (selectNmber === Type.leave) {
      tab1value.value = 1
    } else {
      tab1value.value = 3
    }
  }
})
</script>

<style lang='scss' scoped>
.late-record-page {
  width: 100%;
  font-family: Sans-serif;
  box-sizing: border-box;
  .header-box {
    width: 100%;
    background-color: #fff;
    margin-top: 1px;
    display: flex;
    flex: 1;
    box-sizing: border-box;
    .nut-tabs.horizontal {
      width: 100%;
      height: 100vh;
    }
    :deep(.nut-tabs__titles) {
      background: #fff;
      color: $color-blue-500;
    }
    :deep(.nut-tabs__titles-item.active) {
      color: $color-blue-500;
    }
    .nut-tabpane {
      background-color: $table-tr-even-bg-color;
    }
    :deep(.nut-tabs__content) {
      height: 100%;
    }
    .nut-tabpane {
      padding: 12px;
      padding-bottom: 24px;
      box-sizing: border-box;
    }
    :deep(.nut-tabs__titles-item__text.ellipsis) {
      font-size: 32px;
    }
    .bar-box {
      width: 100%;
      height: 95%;
      overflow: auto;
      border-radius: 12px;
      background-color: $white;
      padding-top: 46px;
      box-sizing: border-box;
      .progress-bar-time{
        font-size: 30px;
      }
      .progress-bar-box {
        width: 100%;
        height: 140px;
        display: flex;
        padding-left: 50px;
        box-sizing: border-box;
        .progress-bar-date {
          margin-right: 58px;
          font-size: 30px;
        }

        .progress-bar-line {
          width: 3px;
          height: 100%;
          background-color: $color-black-200;
          margin-right: 58px;
        }

        .progress-bar-point-success {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin-left: -9px;
          margin-top: 6px;
          background: #d9ecff;

          .progress-bar-point-success-child {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #409eff;
            position: relative;
            top: 4px;
            left: 4px;
          }
        }
      }
      .no-dtae-box{
        text-align: center;
        img{
          width: 418px;
          margin-top: 290px;
        }
        div{
          font-size: 30px;
          color: #999999;
          margin-top: 34px;
        }
      }
    }
  }
}
</style>
