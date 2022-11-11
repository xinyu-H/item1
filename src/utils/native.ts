import router from '@/router'
import { getEnv } from '@/utils/env'
import { EnvType } from '@/model/envType'
import { wxScanQRCode } from '@/utils/wxApi'
import { AMapHelper } from '@/utils/aMap'

/**
 * 一些原生能力
 */
// TODO: 获取定位、定位解析

type scanQrCodeFunType = ((value: any) => void) | null
// 扫码回调的方法
export const scanQrCodeFun: { resolve: scanQrCodeFunType, reject: scanQrCodeFunType } = {
  resolve: null,
  reject: null
}

/**
 * 扫码方法
 */
export function scanQrCode () {
  if (getEnv() === EnvType.wx) {
    return wxScanQRCode()
  } else {
    return new Promise<string | null>((resolve, reject) => {
      router.push({ name: 'ScanQRCodePage' })
      scanQrCodeFun.resolve = resolve
      scanQrCodeFun.reject = reject
    })
  }
}

/**
 * 获取定位
 */
export function getLocation (AMap: any): Promise<Array<number>> {
  return new Promise((resolve, reject) => {
    // // 测试直接返回测试数据
    // resolve([121.397743, 37.420148])
    navigator.geolocation.getCurrentPosition(
      (position) => {
        AMapHelper.convertGps(AMap, [position.coords.longitude, position.coords.latitude]).then(res => {
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      },
      err => {
        reject(err)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000
      }
    )
  })
}
