import Axios from '@/axios';

const CONFIG = window.MTI[process.env.NODE_ENV];
const baseUrl = CONFIG.baseUrl;

export default {
  login: (param) => {
    param = { type: 0 }
    let url = baseUrl + 'sip/getSipLoginInfo'
    return Axios.post(url, param)
  },
  // 新登陆接口
  getLoginNumber: () => {
    let url = baseUrl + 'sip/getLoginNumberByIp'
    return Axios.get(url)
  },
  // 获取当前会议成员
  getMembers: (param) => {
    let url = baseUrl + 'sip/meeting/getMembers'
    return Axios.get(url, { params: param })
  },
  // 获取当前会议列表
  getCurrentList: (param) => {
    let url = baseUrl + 'sip/meeting/getCurrentList'
    return Axios.get(url, { params: param })
  },
  // 获取历史通话记录
  getHistory: (param) => {
    // const params = {
    //   memberId: 1019,                    // 呼叫号码
    //   conferenceId: 'xxxxxx',            // 会议id
    //   startTime: '2020-07-31 17:10:00',  // 会议开始时间
    //   endTime: '2020-07-31 19:10:00'     // 会议结束时间
    // }
    let url = baseUrl + 'sip/meeting/getHistory'
    return Axios.post(url, param)
  },
  // 获取历史通话记录详情
  getHistoryMember: (param) => {
    let url = baseUrl + 'sip/meeting/getHistoryMember'
    return Axios.post(url, param)
  },
  // 根据手机号获取相关信息
  getPersonByPhone: (param) => {
    let url = baseUrl + 'platform/person/query/getPersonByPhone'
    return Axios.post(url, param)
  },
  // 获取服务信息
  getServerInfo: (params)=>{
    let url = baseUrl + `sip/getServerInfo/${params.accountId}`;
    return Axios.get(url);
  },
  // 获取SIP账号信息
  getSipInfo: (params)=>{
    let url = baseUrl + 'sip/getSipLoginInfo';
    return Axios.post(url, params);
  },
}