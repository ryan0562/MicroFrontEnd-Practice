import WS from '../utils/Ws';
import { Notification } from 'element-ui';

const state = {
  ws: null, // WebSocket
  wsUrl: '',
  timer: null,
  JsSIP: null,
  timeCount: 0,
  session: null,
  isJoin: false,
  hasAuth: false,
  wsState: false, // WebSocket 连接状态
  isCaller: false, //是否为主叫
  timeStr: '00:00',
  showAnswer: false,
  reconnectionTimes: 0,
  keepAliveTimer: null,
  reconnectionTimer: null,
  status: ['呼叫中', '通话中', '离线'],
  videoList: [], // 视频列表
  numberList: [], // 通话列表
}

// actions
const actions = {
  /** 创建连接 */
  connection(context, wsUrl) {
    if(wsUrl) state.wsUrl = wsUrl;
    let ws = new WS(state.wsUrl, actions.open, actions.message, actions.close, actions.error);
    mutations.SET_WS(state, ws);
  },
  /** WS 连接成功 */
  open() {
    state.wsState = true;
    /** 向WS服务端发送ping帧，使其WS连接一直保活——(非sip客户端代理时) */
    if(window.MTI.rcsType == 1) {
      state.keepAliveTimer = setInterval(()=>{
        state.ws.send({type: 'pong'});
      }, 1000*10)
    }
  },
  /** 监听返回 */
  message(data, all) {
    state.wsState = true;
    // console.log("监听返回 message -> data", data)
  },
  /** WS 连接关闭 */
  close() {
    state.wsState = false;
    console.log("连接关闭 close");
    /** 清除保活定时器 */
    if(state.keepAliveTimer) {
      clearInterval(state.keepAliveTimer);
      state.keepAliveTimer = null;
    }
    /** 清除重连定时器 */
    if(state.reconnectTimer){
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }
    /** 断线重连 */
    state.reconnectTimer = setTimeout(() => {
      actions.connection();
      console.log('重新连接中...');
    }, 30*1000)
  },
  /** WS 连接错误 */
  error() {
    state.wsState = false;
    ++state.reconnectionTimes;
    /** 清除重连定时器 */
    if(state.reconnectTimer){
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }
    if(state.reconnectionTimes > 5) return;
    /** 断线重连 */
    state.reconnectionTimer = setTimeout(() => {
      actions.connection();
    }, 30*1000)
  }
}

// getters
const getters = {}

// mutations
const mutations = {
  SET_WS: (state, data) => {
    state.ws = data;
  },
  SET_JSSIP: (state, data)=>{
    state.JsSIP = data;
  },
  SET_AUTH: (state, status) => {
    state.hasAuth = status;
  },
  SET_SESSION: (state, data) => {
    state.session = data;
  },
  SET_ISCALLER: (state, status) => {
    state.isCaller = status;
  },
  /** sip注册 */
  REGISTER:(state) => {
    state.ws.send({ code: 'code_client_register' });
  },
  /** 拨打电话 */
  CALL: (state, data) => {
    /** 判断是否有权限 */
    if(!state.hasAuth) {
      Notification({
        message: '此账号没有通话权限，请与管理员联系。',
        position: 'bottom-right',
        type: 'error',
        duration:0
      })
      return
    }
    /** 如果未连接则重连 */
    if(!state.wsState) actions.connection();
    /** 判断是否存有会议ID */
    if(sessionStorage.getItem('meetingId')) {
      /** 邀请加入会议 */
      state.ws.send({
        code: 'code_inviteMeeting',
        args: data
      })
    }else {
      /** 创建会议 */
      state.ws.send({
        code: 'code_createMeeting',
        args: data
      })
    }
    state.isJoin = true;
    state.isCaller = true; //主动呼叫
    data.forEach(item => {
      item.status = 0;
      mutations.UPDATE_NUMBER_LIST(state, item);
      /** 设置超时时间 */
      setTimeout(() => {
        let now = state.numberList.findIndex(v => v.number == item.number);
        if(now >= 0) {
          let temp = JSON.parse(JSON.stringify(state.numberList));
          temp[now].status = state.numberList[now].status == 1 ? 1 : 2;
          state.numberList = temp;
        }
      }, 60000)
    })
  },
  /** 拨打视频 */
  CALL_VIDEO: (state, data) => {
    /** 判断是否有权限 */
    if(!state.hasAuth) {
      Notification({
        message: '此账号没有通话权限，请与管理员联系。',
        position: 'bottom-right',
        type: 'error',
        duration:0
      })
      return
    }
    /** 如果未连接则重连 */
    if(!state.wsState) actions.connection();
    /** 判断是否存有会议ID */
    if(sessionStorage.getItem('meetingId')) {
      /** 邀请加入会议 */
      state.ws.send({
        code: 'code_inviteMeeting',
        args: data
      })
    }else {
      /** 创建会议 */
      state.ws.send({
        code: 'code_createMeeting',
        args: data
      })
    }
    state.isCaller = true; //主动呼叫
    data.forEach(item => {
      item.status = 0;
      mutations.UPDATE_VIDEO_LIST(state, item);
      /** 设置超时时间自动播放 */
      setTimeout(() => {
        let now = state.videoList.findIndex(v => v.number == item.number);
        if(now >= 0) {
          let temp = JSON.parse(JSON.stringify(state.videoList));
          if(!temp[now].status){
            temp[now].status = 1;
            let _domId = `${item.number}`;
            playVideo(_domId, 1500*2);
          }
          state.videoList = temp;
        }
      }, 10000)
    })
  },
  /** 加入会议 */
  JOIN: (state, data) => {
    state.isJoin = true;
    state.ws.send({
      code: 'code_joinMeeting',
      args: data
    })
  },
  /** 踢出会议 */
  KICK: (state, data) => {
    data.status = 2;
    let _numbers = [];
    if(window.MTI.rcsType == 1) _numbers.push(data);
    if(window.MTI.rcsType == 2) _numbers.push(data.number);
    mutations.UPDATE_NUMBER_LIST(state, data);
    if(state.numberList.length == 1) {
      mutations.HANGUP(state);
    }else {
      state.ws.send({
        code: 'code_kickOutMeeting',
        args: _numbers
      })
    }
  },
  /** 挂断 */
  HANGUP: (state) => {
    /** 主叫方：挂断即结束会议 */
    if(!sessionStorage.getItem('incomingNumber')){
      /** sip客户端代理时 */
      if(window.MTI.rcsType == 2) state.ws.send({ code: 'code_hangUp' });
      if(!state.videoList.length) state.ws.send({ code: 'code_endMeeting' });
    }else{ /** 被叫方：挂断即踢出会议 */
      let _numbers = [];
      state.numberList.forEach((item)=>{
        if(window.MTI.rcsType == 1) _numbers.push(item);
        if(window.MTI.rcsType == 2) _numbers.push(item.number);
      })
      state.ws.send({
        code: 'code_kickOutMeeting',
        args: _numbers
      })
    }
    /** 删除通话列表中所有数据 */
    mutations.CLEAR_NUMBER_LIST(state);
    state.showAnswer = false;
  },
  /** 结束会议 */
  END_MEETING: (state) => {
    state.ws.send({ code: 'code_endMeeting' });
    /** 删除通话列表中所有数据 */
    mutations.CLEAR_NUMBER_LIST(state);
  },
  /** 接听电话 */
  ANSWER: (state) => {
    state.ws.send({ code: 'code_answer' });
    state.showAnswer = false;
    state.isJoin = true;
  },
  /** 更新呼叫列表人员 */
  UPDATE_NUMBER_LIST: (state, data) => {
    let now = state.numberList.findIndex(v => v.number == data.number);
    if(now >= 0) {
      let temp = JSON.parse(JSON.stringify(state.numberList));
      temp[now].status = data.status;
      state.numberList = temp;
    }else {
      state.numberList.push(data);
    }
  },
  /** 更新视频列表成员 */
  UPDATE_VIDEO_LIST: (state, data)=>{
    let now = state.videoList.findIndex(v => v.number == data.number);
    if(now >= 0) {
      let temp = JSON.parse(JSON.stringify(state.videoList));
      temp[now].status = data.status;
      state.videoList = temp;
    }else {
      state.videoList.push(data);
    }
  },
  /** 删除呼叫列表成员 */
  DELECT_NUMBER_LIST: (state, data) => {
    let now = state.numberList.findIndex(v => v.number == data.number);
    if(state.numberList.length > 1){
      if(now > -1) state.numberList.splice(now, 1);
    }else{
      if(now == 0) mutations.HANGUP(state);
    }
  },
  /** 删除视频列表成员 */
  DELECT_VIDEO_LIST: (state, data)=>{
    let now = state.videoList.findIndex(v => v.number == data.number);
    state.videoList.splice(now, 1);
  },
  /** 清空通话列表 */
  CLEAR_NUMBER_LIST: (state) => {
    state.isJoin = false;
    state.numberList = [];
    mutations.CLEAR_TIMER(state);
    if(!state.videoList.length){
      sessionStorage.removeItem('meetingId'); // 清除会议 ID
    } 
    /** 被叫方：清除来电号码 */
    if(sessionStorage.getItem('incomingNumber')){
      sessionStorage.removeItem('incomingNumber');
    }
  },
  /** 清空视频列表 */
  CLEAR_VIDEO_LIST: (state)=>{
    /** 主叫方：挂断即结束会议 */
    if(!sessionStorage.getItem('incomingNumber')){
      /** sip客户端代理时 */
      if(window.MTI.rcsType == 2) state.ws.send({ code: 'code_hangUp' });
      if(!state.numberList.length) state.ws.send({ code: 'code_endMeeting' });
    }else{ /** 被叫方：挂断即踢出会议 */
      let _numbers = [];
      state.videoList.forEach((item)=>{
        if(window.MTI.rcsType == 1) _numbers.push(item);
        if(window.MTI.rcsType == 2) _numbers.push(item.number);
      })
      state.ws.send({
        code: 'code_kickOutMeeting',
        args: _numbers
      })
    }
    state.videoList = [];
    /** 清除会议 ID */
    sessionStorage.removeItem('meetingId');
  },
  /** 计时器 */
  TIMER: (state) => {
    if(state.timer) return false;
    state.timer = setInterval(() => {
      let count = state.timeCount + 1;
      state.timeCount = count;
      const s = count % 60;
      const ss = s < 10 ? '0'+s : s;
      const m = parseInt(count / 60) % 60;
      const mm = m < 10 ? '0'+m : m;
      const h = parseInt(count / 60 / 60) % 24;
      const hh = h < 10 ? '0'+h : h;
      const d = parseInt(count / 60 / 60 / 24);
      const dd = d < 10 ? '0'+d : d;
      state.timeStr = `${mm}:${ss}`;
    }, 1000)
  },
  /** 清除计时器 */
  CLEAR_TIMER: (state) => {
    clearInterval(state.timer);
    state.timer = null;
    state.timeCount = 0;
    state.timeStr = '00:00';
  },
  /** 显示接听弹框 */
  SHOW_ANSWER: (state) => {
    state.showAnswer = true;
  },
  /** 隐藏接听弹框 */
  HIDE_ANSWER: (state) => {
    state.showAnswer = false;
  },
}

export default {
  state,
  getters,
  actions,
  mutations
}