<template>
    <!--  日历  -->
    <div class="attendance-sum-calendar">
      <div class="calendar-date-box" @click="isShowDatepicker=true">
        <div class="month-box">
          <span class="month-value">{{ selectMonth }}</span>{{ t('attendanceSum.month') }}
          <span class="iconfont icon-xialaxuanze"></span>
        </div>
        <div class="year-box">{{ currentDate.getFullYear() }} {{t('attendanceSum.year')}}</div>
      </div>
      <div class="calendar-week-box">
        <div class="calendar-week-top-box">
          <div class="calendar-week-item" v-for="index in 7" :key="index">
            {{ t('attendanceSum.weekday' + (index)) }}
          </div>
        </div>
        <div class="calendar-week-bottom-box" @touchstart="handleWeekDayTouchStart" @touchend="handleWeekDayTouchEnd">
          <div class="calendar-week-bottom-content" :class="{'left-in':isWeekLeftIn,'right-in':isWeekRightIn}">
            <div v-for="(weekday,index) in weekdayList"
                 @click="handleWeekdayClick(weekday)"
                 :key="index"
                 class="calendar-week-item"
                 :class="{'isActive':getDateIsEqual(selectedDate,weekday)}"
            >
              {{ handelDayFormat(weekday) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <nut-datepicker
    v-model="currentDate"
    type="year-month"
    @confirm="handelYearMonthChoose"
    v-model:visible="isShowDatepicker"
  ></nut-datepicker>
</template>

<script lang="ts" setup>
import { computed, defineEmits, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate, getWeekStart, getMonthEnd } from '@/utils/date'
import moment from 'moment/moment'

const { t } = useI18n()

// emit
interface EmitType{
    (e: 'change', date: Date|null): void
}

const emits = defineEmits<EmitType>()

// 日期组件 选择的日期
const currentDate = ref(new Date())
// 选择日 选择的日期 当通过日期组件选择后则为null
const selectedDate = ref<Date | null>(new Date())
// 是否显示选择日期的弹出
const isShowDatepicker = ref(false)
// 日期滑动开始
const touchStartX = ref<number | null>(null)
// 周从左侧进入
const isWeekLeftIn = ref(false)
// 从右侧进入
const isWeekRightIn = ref(false)
// 选择的月份
const selectMonth = computed(() => {
  const month = currentDate.value.getMonth() + 1
  return month >= 10 ? month : '0' + month
})

// 当前天对应的一周的日期
const weekdayList = computed(() => {
  const weekdayList: Array<Date> = []
  if (selectedDate.value) {
    // 本周第一天
    if (selectedDate.value.getDay() === 0) {
      const startDate = getWeekStart(selectedDate.value)
      const day: Date = new Date(startDate.getTime() + (1 * 3600 * 24 * 1000))
      for (let i = -8; i < -1; i++) {
        const date = moment(day).add(i, 'day').toDate()
        weekdayList.push(date)
      }
    } else {
      const startDate = getWeekStart(selectedDate.value)
      const day: Date = new Date(startDate.getTime() + (1 * 3600 * 24 * 1000))
      for (let i = 0; i < 7; i++) {
        const date = moment(day).add(i - 1, 'day').toDate()
        weekdayList.push(date)
      }
    }
  }
  return weekdayList
})

watch(selectedDate, (value:Date|null) => {
  if (value) {
    emits('change', value)
  }
})

// 处理年月选择
function handelYearMonthChoose (value: any) {
  if (value && value.selectedValue) {
    currentDate.value = new Date(Number.parseInt(value.selectedValue[0]), Number.parseInt(value.selectedValue[1]) - 1)
    selectedDate.value = getMonthEnd(currentDate.value)
    emits('change', currentDate.value)
  }
}

// 格式化天的日期
function handelDayFormat (date: Date) {
  return formatDate(date, 'DD')
}

/**
 * 判断日期（年月日）是否相等
 * @param firstDate 比较的日期
 * @param secondDate 比较的日期
 */
function getDateIsEqual (firstDate: Date, secondDate: Date) {
  if (firstDate && secondDate) {
    return formatDate(firstDate, 'YYYY-MM-DD') === formatDate(secondDate, 'YYYY-MM-DD')
  }
  return false
}

// 日期 滑动开始
function handleWeekDayTouchStart (event: TouchEvent) {
  if (event && event.changedTouches && event.changedTouches.length > 0) {
    touchStartX.value = event.changedTouches[0].pageX
  }
}

// 日期 滑动结束
function handleWeekDayTouchEnd (event: TouchEvent) {
  if (event && event.changedTouches && event.changedTouches.length > 0 && touchStartX.value) {
    const diffX = event.changedTouches[0].pageX - touchStartX.value
    if (diffX < -50) {
      // 向左滑
      isWeekRightIn.value = true
      setTimeout(() => {
        isWeekRightIn.value = false
      }, 120)
      currentDate.value = moment(weekdayList.value[0]).add(7, 'day').toDate()
      selectedDate.value = moment(selectedDate.value).add(7, 'day').toDate()
    } else if (diffX > 50) {
      // 向右滑
      isWeekLeftIn.value = true
      setTimeout(() => {
        isWeekLeftIn.value = false
      }, 120)
      currentDate.value = moment(weekdayList.value[0]).add(-7, 'day').toDate()
      selectedDate.value = moment(selectedDate.value).add(-7, 'day').toDate()
    }
  }
  touchStartX.value = null
}

// 处理周点击时间
function handleWeekdayClick (date: Date) {
  selectedDate.value = date
  currentDate.value = date
}
</script>
<style lang="scss" scoped>
 // 左边进入
  @keyframes weekLeftIn {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }

  // 右边进入
  @keyframes weekRightIn {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(0);
    }
  }

  .attendance-sum-calendar {
    color: $color-black-800;
    display: flex;
    align-items: center;

    .calendar-date-box {
      margin-top: -4px;
      padding: 0 18px;

      .month-box {
        color: $color-blue-500;
        font-size: 30px;
        display: flex;
        align-items: center;

        .month-value {
          font-size: 38px;
          margin-right: 4px;
        }

        .iconfont {
          font-size: 12px;
          color: #DCDCDC;
          transform: scale(.8);
          margin-left: 8px;
        }
      }

      .year-box {
        font-size: 24px;
      }
    }

    .calendar-week-box {
      flex: 1;

      .calendar-week-top-box, .calendar-week-bottom-box {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .calendar-week-item {
          width: 62px;
          font-size: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .calendar-week-top-box {
        margin-top: 2px;
      }

      .calendar-week-bottom-box {
        margin-top: 8px;
        overflow: hidden;

        .calendar-week-bottom-content {
          flex: 1;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          &.left-in {
            animation: weekLeftIn;
            animation-duration: 0.12s;
            animation-timing-function: linear;
          }

          &.right-in {
            animation: weekRightIn;
            animation-duration: 0.12s;
            animation-timing-function: linear;
          }
        }

        .calendar-week-item {
          font-size: 30px;
          height: 62px;

          &.isActive {
            background: $color-blue-500;
            color: white;
          }
        }
      }
    }
  }
</style>
