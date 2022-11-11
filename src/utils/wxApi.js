import wx from 'weixin-js-sdk'

/**
 * 初始化
 * @param config
 */
export function wxConfig (config) {
  return new Promise((resolve, reject) => {
    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: config.appId, // 必填，公众号的唯一标识
      timestamp: config.timestamp, // 必填，生成签名的时间戳
      nonceStr: config.nonceStr, // 必填，生成签名的随机串
      signature: config.signature, // 必填，签名
      jsApiList: [
        'scanQRCode'
      ], // 必填，需要使用的JS接口列表
      openTagList: ['wx-open-launch-weapp']
    })
    wx.ready(() => {
      resolve('ready')
    })
    wx.error(() => {
      // TODO:看看微信SDK加载异常都是什么问题
      reject('')
    })
  })
}

/**
 * 扫码
 */
export function wxScanQRCode () {
  return new Promise((resolve, reject) => {
    wx.checkJsApi({
      jsApiList: ['scanQRCode'],
      success: function () {
        wx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
          success: (res) => {
            resolve(res.resultStr)
          },
          error: function (res) {
            if (res.errMsg.indexOf('function_not_exist') > 0) {
              reject()
            }
          },
          cancel: function () {
            reject()
          }
        })
      }
    })
  })
}
