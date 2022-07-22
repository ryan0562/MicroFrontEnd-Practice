import API from '../api';
import store from '@/store';
import { Notification } from 'element-ui';

function getSelf() {
  let userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || {};
  const result = {
    type: 1,
    orgId: userInfo.orgId,
    orgName: userInfo.orgName,
    personName: userInfo.name,
    personId: userInfo.personId,
    number: sessionStorage.getItem('sipNum'),
    callId: sessionStorage.getItem('callId'),
    meetingId: sessionStorage.getItem('meetingId')
  }
  return result;
}

export default {
  /** ⇨ 登陆 */
  code_login: () => {
    const msg = {
      code: 'code_login',
      data: {
        orgId: getSelf().orgId,
        usercode: getSelf().personId
      }, 
      type: 0
    }
    return msg;
  },
  /** ⇨ 客户端注册 */
  code_client_register: (args) => {
    const msg = {
      code: 'code_client_register_success',
      provider: 'freeswitch-1-true', //版本号-false（是否启用后台呼叫）
      data: {
        sipNumber: getSelf().number
      },
    }
    return msg;
  },
  /** ⇦ 登陆返回 */
  code_onDeviceStateListener: (ws, data) => {
    if(data.success) {
      if(data.sipNumber) {
        /** 设置权限 */
        store.commit('SET_AUTH', true);
        sessionStorage.setItem('sipNum', data.sipNumber);
      }else {
        Notification({
          type: 'error',
          duration: 6000,
          position: 'bottom-right',
          message: '此账号没有通话权限，请与管理员联系。',
        })
        /** 设置权限 */
        store.commit('SET_AUTH', false);
      }
    }else {
      // 重新登录
      // ws.send({code: 'code_login'});
    }
  },
  /** ⇦ 错误信息 */
  code_error: (ws, data) => {
    store.commit('CLEAR_NUMBER_LIST');
    Notification({
      type: 'error',
      duration: 6000,
      message: data.message,
      position: 'bottom-right',
    })
  },
  /** ⇨ 退出 */
  code_logout: () => {
    const msg = {
      code: 'code_logout',
      data: {}, 
      type: 0
    }
    return msg;
  },
  /** ⇨ 单个呼叫 */
  code_makeCall: (args) => {
    const msg = {
      code: 'code_makeCall',
      data: {
        callType: 1,   // 呼叫类型
        called: args,  // 被叫号码
        caller: getSelf().number,  // 主叫号码
      },
      type: 0
    }
    return msg;
  },
  /** ⇨ 呼叫应答 */
  code_answer: (args) => {
    const msg = {
      code: 'code_answer',
      data: {
        meetingId: getSelf().meetingId,
        sipNumbers: [getSelf()]
      },
      type: 0
    }
    return msg;
  },
  /** ⇦ 来电 */
  code_incoming: (ws, data) => {
    /** 来电弹框 */
    if (store.state.SipCallStore.isJoin) return;
    store.commit('SHOW_ANSWER');
    /** 保存 callId */
    sessionStorage.setItem('callId', data.callId);
    sessionStorage.setItem('incomingNumber', data.sipNumber);
  },
  /** ⇨ 创建会议 */
  code_createMeeting: (args)=> {
    const msg = {
      code: 'code_createMeeting',
      provider: window.MTI.rcsType == 1 ? 'freeswitch-1-true' : 'yousk-1-true',
      data: {
        type: 1,
        appCode: '',
        sipMeetingBO:{
          objKey: '',
          objType: '',
          meetingId: getSelf().meetingId,
          sipNumbers: [getSelf(), ...args]  
        }
      },
    }
    return msg;
  },
  /** ⇨ 邀请入会 */
  code_inviteMeeting: (args)=> {
    const msg = {
      code: 'code_inviteMeeting',
      provider: window.MTI.rcsType == 1 ? 'freeswitch-1-true' : 'yousk-1-true',
      data: {
        type: 1,
        appCode: '',
        sipMeetingBO:{
          meetingId: getSelf().meetingId,
          sipNumbers: [...args]  
        }
      },
    }
    return msg;
  },
  /** ⇨ 加入会议 */
  code_joinMeeting: (args)=> {
    const msg = {
      code: 'code_joinMeeting',
      data: {
        meetingId: args,  // 会议Id
        sipNumbers: {
          number: getSelf().number,
          usercode: getSelf().personId
        }
      },
      type: 1
    }
    return msg;
  },
  /** ⇦ 呼叫返回 */
  code_callState: (ws, data) => {
    /** 保存 callId */
    sessionStorage.setItem('callId', data.callId);
    // if(data.status == 5) {
    //   let meetingId = data.sipNumber.substr(4);
    //   /** 加入会议时获取会议成员状态 */
    //   if(store.state.SipCallStore.isJoin) {
    //     API.getMembers({meetingId: meetingId}).then(res => {
    //       store.commit('CLEAR_NUMBER_LIST');
    //       res.forEach(item => {
    //         store.commit('UPDATE_NUMBER_LIST', {number: item.memberId, status: 1});
    //       })
    //     })
    //   }
    //   sessionStorage.setItem('meetingId', meetingId);
    //   store.commit('TIMER');
    //   store.commit('HIDE_ANSWER');
    // }
    // if(data.status == 6) {
    //   store.commit('HIDE_ANSWER');
    // }
  },
  /** ⇦ 会议状态 */
  code_meeting_Status: (ws, data)=> {
    /** 会议创建 */
    if(data.type == 'conference_create' && !getSelf().meetingId) {
      let meetingId = data.meetingId;
      sessionStorage.setItem('meetingId', meetingId);
      store.commit('TIMER');
    }
    /** 会议销毁 */
    if(data.type == 'conference_destroy' && (data.meetingId == getSelf().meetingId)) {
      store.commit('CLEAR_NUMBER_LIST')
    }
  },
  /** ⇦ 会议成员状态 */
  code_meeting_memberStatus: (ws, data)=> {
    if(data.meetingId != getSelf().meetingId) return;
    let status = data.status == 'conference_member_in' ? 1 : 2;
    if(data.sipNumber == getSelf().number) {
      if(status == 2) store.commit('CLEAR_NUMBER_LIST');
      return
    }
    // 拨打SIP号拉取视频时
    let _videoList = store.state.SipCallStore.videoList;
    let now = _videoList.findIndex(v => v.number == data.sipNumber);
    if(now >= 0){
      store.commit('UPDATE_VIDEO_LIST', {number: data.sipNumber, status: status});
      if(data.status == 'conference_member_in'){ //成员加入会议
        let _domId = `${data.sipNumber}`; // 视频窗口ID
        playVideo(_domId, 1500*2); // USCVideo.js
      }
      if(data.status == 'conference_member_out'){ //成员离开会议
        closeVideo(`video_${data.sipNumber}`); // USCVideo.js
        // store.commit('DELECT_VIDEO_LIST', {number: data.sipNumber});
      }
    }else{
      store.commit('UPDATE_NUMBER_LIST', {number: data.sipNumber, status: status});
    }
  },
  /** ⇨ 将某人踢出会议 */
  code_kickOutMeeting: (args)=> {
    const msg = {
      code: 'code_kickOutMeeting',
      provider: window.MTI.rcsType == 1 ? 'freeswitch-1-true' : 'yousk-1-true',
      data: {
        type: 1,
        appCode: '',
        sipMeetingBO:{
          meetingId: getSelf().meetingId,
          sipNumbers: [...args]
        }
      },
    }
    return msg;
  },
  /** ⇨ 挂断接口 */
  code_hangUp: ()=> {
    const msg = {
      code: 'code_hangUp',
      provider: window.MTI.rcsType == 1 ? 'freeswitch-1-true' : 'yousk-1-true',
      data: {
        callId: getSelf().callId 
      },
      type: 0
    }
    return msg
  },
  /** ⇨ 结束会议 */
  code_endMeeting: ()=> {
    const msg = {
      code: 'code_endMeeting',
      provider: window.MTI.rcsType == 1 ? 'freeswitch-1-true' : 'yousk-1-true',
      data: {
        type: 1,
        appCode: '',
        sipMeetingBO:{
          meetingId: getSelf().meetingId
        },
      },
    }
    return msg;
  }
}