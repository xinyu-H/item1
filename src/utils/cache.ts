/**
 * 缓存帮助文件
 */

const sessionCache = {
  set (key: string, value: string) {
    if (!sessionStorage) {
      return
    }
    if (key != null && value != null) {
      sessionStorage.setItem(key, value)
    }
  },
  get (key: string): string | null {
    if (!sessionStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return sessionStorage.getItem(key)
  },
  setJSON (key: string, jsonValue: any) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON (key: string) {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value)
    }
  },
  remove (key: string) {
    sessionStorage.removeItem(key)
  },
  clear () {
    if (!sessionStorage) {
      return
    }
    sessionStorage.clear()
  }
}
const localCache = {
  set (key: string, value: string) {
    if (!localStorage) {
      return
    }
    if (key != null && value != null) {
      localStorage.setItem(key, value)
    }
  },
  get (key: string): string | null {
    if (!localStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return localStorage.getItem(key)
  },
  setJSON (key: string, jsonValue: any) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON (key: string) {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value)
    }
  },
  remove (key: string) {
    localStorage.removeItem(key)
  },
  clear () {
    if (!localStorage) {
      return
    }
    localStorage.clear()
  }
}

export default {
  /**
   * 会话级缓存
   */
  session: sessionCache,
  /**
   * 本地缓存
   */
  local: localCache
}

// openid 关键字
export const OpenIdKey = 'openId'
// 是否记住密码 关键字 不为null就是记住密码
export const RememberMeKey = 'rememberMe'
// 账号、密码
export const AccountInfoKey = 'accountInfo'
// tabbar
export const TabBarListKey = 'tabBarList'
// 我的应用
export const MyMenuListKey = 'myMenuList'
// 顶部菜单
export const TopMenuListKey = 'topMenuList'
// 我的页面里面的菜单
export const MePageMenuListKey = 'mePageMenuList'
// 定位考勤打开信息
export const ClockInInfoKey = 'clockInInfo'
// 人脸识别照片信息
export const FaceRecognitionKey = 'faceRecognition'
// 手动定位信息
export const ManualLocationKey = 'manualLocationData'
// 外勤考勤信息
export const OutSideInfoKey = 'outSideInfo'
