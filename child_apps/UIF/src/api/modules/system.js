'use strict'
/**
 * 系统请求接口
 */
import Axios from '@/axios'
const CONFIG = window.MTI[process.env.NODE_ENV]
export default {
  //platform
  // 登陆接口
  login: (param)=> {
    let url = CONFIG.baseUrl + 'platform/user/operate/toLogin'
    return Axios.post(url, param)
  },
  // 登出
  logout: (param)=> {
    let url = CONFIG.baseUrl + 'platform/user/operate/logout'
    return Axios.get(url, {
      params: {
        ...param
      }})
  },
  // 静默登录
  silentLogin: (param) => {
    let url = CONFIG.baseUrl + 'platform/user/avoidLogin'
    return Axios.post(url, param)
  },
  // 请求字典表
  getSystemDict:(param)=> {
    let url = CONFIG.baseUrl + 'platform/dictData/query/list'
    return Axios.post(url, param)
  },
  // 用户信息补偿
  getUserInfoByToken:(param)=> {
    let url = CONFIG.baseUrl + 'platform/user/operate/getUserModuleInfo'
    return Axios.post(url, param)
  },
  // 修改密码
  changePassword: (param)=> {
    let url = CONFIG.baseUrl + 'platform/user/update/updatePassword'
    return Axios.post(url, param)
  },
  // 获取天气
  getWeather:(param)=> {
    let url = CONFIG.baseUrl + 'extend/weather/query/getWeatherData'
    return Axios.get(url, {
      params: {
        ...param
      }})
  },
  // 设置天气
  saveWeatherData:(param)=> {
    let url = CONFIG.baseUrl + 'extend/weather/save/saveWeatherData'
    return Axios.post(url, param)
  },
  // 获取通讯录目录
  getAddressBookOrg:(param)=> {
    let url = CONFIG.baseUrl + 'platform/org/query/queryOrgRegionTree4New'
    return Axios.post(url, param)
  },
  // 获取通讯录人员
  getAddressBookPerson:(param)=> {
    let url = CONFIG.baseUrl + 'platform/person/query/queryPerson4Maintain'
    return Axios.post(url, param)
  },

  //ump
  // 获取离线消息
  getMessage:(param)=> {
    let url = CONFIG.socketUrl + 'ump/message/queryMessage'
    return Axios.post(url, param)
  },
  // 移除消息
  removeMsg:(param)=> {
    let url = CONFIG.socketUrl + 'ump/message/removeMsg'
    return Axios.post(url, param)
  },
  // 消息属性列表
  getMessagePropertyList: (param)=> {
    let url = CONFIG.baseUrl + 'ump/messageProperty/queryList'
    return Axios.post(url, param)
  },
  // 消息属性详情
  getMessagePropertyDetail: (param)=> {
    let url = CONFIG.baseUrl + 'ump/messageProperty/findByMsgCode'
    return Axios.get(url, {
      params: {
        ...param
      }})
  },
  // 保存消息属性
  saveMessagePropertyDetail: (param)=> {
    let url = CONFIG.baseUrl + 'ump/messageProperty/save'
    return Axios.post(url, param)
  },
  // 删除消息属性
  delMessagePropertyItem: (param)=> {
    let url = CONFIG.baseUrl + 'ump/messageProperty/deleteByMsgCode'
    return Axios.get(url, {
      params: {
        ...param
      }})
  },
  // 消息规则详情
  getMessageRuleDetail: (param)=> {
    let url = CONFIG.baseUrl + 'ump/messageRule/findByMsgCode'
    return Axios.get(url, {
      params: {
        ...param
      }})
  },
  // 消息基础规则查询
  getMessageBaseRule: (param)=> {
    let url = CONFIG.baseUrl + 'ump/messageRule/queryList'
    return Axios.post(url, param)
  },
  // 新增/修改子系统信息
  saveSubSystem:(param)=> {
    let url = CONFIG.baseUrl + 'platform/dictData/add/save'
    return Axios.post(url, param)
  },
  // 删除子系统信息
  delSubSystem:(param)=> {
    let url = CONFIG.baseUrl + 'platform/dictData/del/delete'
    return Axios.post(url, param)
  },
  // 查询子系统数据
  getSubSystemList: params => {
    let url = CONFIG.baseUrl + 'platform/dictData/query/pageQuery'
    return Axios.post(url, params)
  },
  //webrtc向信令服务器申请房间号
  rtcRoomCreate:params=> {
    let url = CONFIG.signalServerUrl + 'rtc/video/create'
    return Axios.post(url, params)
  },
  //webrtc向信令服务器申请房间号
  transferMsgByUmp:params=> {
    let url = CONFIG.baseUrl + 'ump/message/sendBatchMsg'
    return Axios.post(url, params)
  },
}
