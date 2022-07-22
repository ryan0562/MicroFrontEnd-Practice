/**
 * 会议请求接口
 */
import Axios from '@/axios'
const CONFIG = window.MTI[process.env.NODE_ENV]
const baseUrl = CONFIG.baseUrl
function getSelf() {
  let userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || {}
  const result = {
    personId: userInfo.personId,
    orgId: userInfo.orgId,
    orgName: userInfo.orgName,
    personName: userInfo.name,
    duty: userInfo.duty,              // 职务
    type: 1
  }
  return result
}
export default {
  // 创建会议
  create: (param) => {
    param = {
      businessId: '1',  // 业务id
      businessType: 0,    // 业务类型
      createName: getSelf().personName,  // 创建人姓名	
      creater: getSelf().personId,    // 创建人id	
      members: param.members,
      name: param.name,       // 会议名称	
      orgId: getSelf().orgId,       // 创建会议单位id	
      orgName: getSelf().orgName,    // 创建会议单位名称	
      type: 1                   // 会议类型(0：公开会议，1：带密码的私有会议)
    }
    let url = baseUrl + 'sip/muc-meeting/appointment'
    return Axios.post(url, param)
  },
  // 加入会议
  join: (param) => {
    /** param = {
        meetingId: '598208893050421248',
        personId: '7777'
      }
    */
    let url = baseUrl + 'sip/muc-meeting/join'
    return Axios.post(url, param)
  },
  // 退出会议
  out: (param) => {
    /** param = {
        meetingId: '598208893050421248',
        personId: '7777'
      }
    */
    let url = baseUrl + 'sip/muc-meeting/out'
    return Axios.post(url, param)
  },
}