import moment from 'moment'

/**
 * 格式化日期
 * @param date 日期
 * @param fmt 格式化文字
 */
export function formatDate (date: Date, fmt: string): string {
  return moment(date).format(fmt)
}

/**
 * 月开始第一天
 * @param date 日期
 */
export function getMonthStart (date: Date): Date {
  return moment(date).startOf('month').toDate()
}

/**
 * 月开始最后一天
 * @param date 日期
 */
export function getMonthEnd (date: Date): Date {
  return moment(date).endOf('month').toDate()
}

/**
 * 周开始第一天
 * @param date 日期
 */
export function getWeekStart (date: Date): Date {
  return moment(date).startOf('week').add(1, 'day').toDate()
}

/**
 * 周开始最后一天
 * @param date 日期
 */
export function getWeekEnd (date: Date): Date {
  return moment(date).endOf('week').add(1, 'day').toDate()
}

/**
 * 获取周几
 * @param date
 * @param t
 */
export function getWeekDay (date: Date, t: any): string {
  const week = moment(date).day()
  switch (week) {
    case 1:
      return t('monday')
    case 2:
      return t('tuesday')
    case 3:
      return t('wednesday')
    case 4:
      return t('thursday')
    case 5:
      return t('friday')
    case 6:
      return t('saturday')
    case 0:
      return t('sunday')
  }
  return ''
}
