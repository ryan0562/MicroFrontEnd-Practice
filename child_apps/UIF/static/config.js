/*
 * @Description:
 * @Author: yang
 * @Date: 2022-06-14 17:35:23
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-06-28 11:05:54
 */
const baseUrl = {
  development: 'ecis.server.mti',
  production: '10.168.4.198'
}

window.version = ''

window.MTI = {
  themes: true,
  rcsType: 1, // 1:jsSip 2:sip客户端代理
  phoneModule: true, // 是否启用电话模块功能
  endClientPoint: '.eduty.',
  title: localStorage.getItem('systemTitle') || '凉山州应急综合管理平台',
  weather: {
    // appid:'36673331',
    // appsecret:'SVl2VVU6',
    // cityId:'101210701'
    appid: '55137235',
    appsecret: '6EbP1XIr',
    cityId: '101271601',
    weatherUrl: "http://tianqiapi.com/api?version=v1&cityid=101271601&appsecret=6EbP1XIr&appid=55137235&vue=1"
  },
  development: {
    baseUrl: '//' + baseUrl.development + ':9080/',
    socketUrl: '//' + baseUrl.development + ':9080/',
    signalServerUrl: '//' + baseUrl.development + ':8191/',
    webRtcUrl: 'https://yjzch.mti-sh.cn/apircs/#/home',
    videoUrl: 'http://localhost:8888/#/video'
  },
  production: {
    baseUrl: '//' + baseUrl.production + '/api/',
    socketUrl: '//' + baseUrl.development + '/msg-websocket/',
    signalServerUrl: '//' + baseUrl.development + ':8191/',
    webRtcUrl: 'https://yjzch.mti-sh.cn/apircs/#/home',
    videoUrl: 'http://yjzch.mti-sh.cn/#/video'
  }
}
