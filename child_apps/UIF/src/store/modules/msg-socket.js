import bus from "@/bus";
import store from '@/store';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { MessageBox } from 'element-ui';
import { Notification } from 'element-ui';
import systemApi from "@/api/modules/system";

const NETWORK_CONFIG = window.MTI[process.env.NODE_ENV];

const state = {
  audio: null,
  audio2: null,
  msgSocket: null,
  stompClient: null,
  reconnecting: false,
  msgList: [],
  audioData: [],
  notifyObj: {},
}
state.audio = new Audio()
state.audio.src = './../../../static/audio/incident.mp3'//默认声音文件
state.audio.loop = true

state.audio2 = new Audio()
state.audio2.src = './../../../static/audio/notify.mp3'//默认声音文件
state.audio2.loop = false

// actions
const actions = {
  async getUnLineMsg(){
    let _userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    let _data = await systemApi.getMessage({personId:_userInfo.personId,orgId:_userInfo.orgId})
    state.msgList = _data || []
  },
  audioPlayAndPause(){
    if(state.audioData.length > 0){
      if(state.audio.paused) try{state.audio.play()}catch(err){}
    }else{
      try{state.audio.pause();state.audio.load()}catch(err){}
    }
  },
  async removeMsg(state, msg){
    let _userInfo = JSON.parse(sessionStorage.getItem('userInfo')),
    _state = state.state,
    _index = _state.audioData.indexOf(msg.msgCode + msg.objKey),
    _key = -1,
    _mess = {
      objKey:msg.objKey,
      msgCode:msg.msgCode,
      excludePerson:_userInfo.personId
    }
    _index != -1 ? (_state.audioData.splice(_index, 1), actions.audioPlayAndPause()) : ''
    for(let i in _state.msgList){
      if(_state.msgList[i].msgCode + _state.msgList[i].objKey == msg.msgCode + msg.objKey){
        _key = i
        _mess.additional = _state.msgList[i].additional,
        _mess.notify = _userInfo.name + '处理了一条' + _state.msgList[i].msgName
        break
      }
    }
    _key != -1 ? (_state.msgList.splice(_key, 1), await systemApi.removeMsg(_mess).then(res=>{console.log('删除成功')})) : (console.log('不存在的消息'), console.log(msg))
  },
  async clickMsg(state, msg){
    if(msg.remind){
      let _messenger = store.state.messenger.messenger
      store.state.ui.curFrame != msg.systemName ? (store.commit('setCurFrame', msg.systemName),_messenger.targets[msg.systemName].send(JSON.stringify({type:'switchMenu',path:store.state.ui.historyPath[msg.systemName]}))) : ''
      let _mess = {
        type:'page',
        objKey:msg.objKey,
        remind:msg.remind,
        content:msg.content,
        msgCode:msg.msgCode,
      }
      _messenger.targets[msg.systemName].send(JSON.stringify(_mess))
    }else{
      state.notifyObj[msg.msgCode + msg.objKey] ? state.notifyObj[msg.msgCode + msg.objKey].close() : ''
    }
  },
  removeMessage(state, msg){
    let _content = typeof msg.content == 'string' ? JSON.parse(msg.content) : msg.content,
    _state = state.state,
    _index = _state.audioData.indexOf(_content.removeMsgCode + _content.objKey), _key = -1
    _index != -1 ? (_state.audioData.splice(_index, 1), actions.audioPlayAndPause()) : ''
    for(let i in _state.msgList){
      if(_state.msgList[i].msgCode + _state.msgList[i].objKey == _content.removeMsgCode + _content.objKey){
        _key = parseInt(i)
        break
      }
    }
    if(_key != -1){
      _state.msgList.splice(_key, 1)
      _state.notifyObj[_content.removeMsgCode + _content.objKey] ? _state.notifyObj[_content.removeMsgCode + _content.objKey].close() : ''
    }
  },
  subscribeCallback(event){
    let _userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    let _msg = JSON.parse(event.body), _messenger = store.state.messenger.messenger
    console.log('我收到消息了',_msg)
    // if(_msg.excludes && _msg.excludes.indexOf(_userInfo.personId) != -1) return//黑名单
    // if(_userInfo.roleMsg.indexOf(_msg.msgRole) != -1 || !_msg.msgRole){//是否有接收权限
      if(_msg.remind){//是否接收
        state.msgList.unshift(_msg)//接收到消息放入消息列表
        _msg.audio ? (state.audioData.push(_msg.msgCode + _msg.objKey), actions.audioPlayAndPause()) : ''//是否声音提醒
      }
      if(_msg.notice){//是否通知
        state.notifyObj[_msg.msgCode + _msg.objKey] = Notification({//弹出提醒通知框
          title: _msg.notice.title,
          message: _msg.notice.notify,
          position: 'top-right',
          type: 'warning',
          customClass: "Notification",
          iconClass: _msg.icon | 'msg-notify-icon',
          offset: 30,
          duration:8000,
          onClick:function(){//提醒通知框回调打开组件
            actions.clickMsg(state, _msg)
            this.close()
          },
          onClose:function(){//提醒通知框关闭时的监听
            delete state.notifyObj[_msg.msgCode + _msg.objKey]
          }
        })
        if(state.audio.paused) try{ state.audio2.play()}catch(err){}
      }
      if(_msg.method){
        if(_msg.systemName.toLowerCase() == 'uif'){
          // actions[`${_msg.method}`](state, _msg)
          bus.$emit(_msg.method, _msg)
        }else{
          let _mess = {
            type:'method',
            method:_msg.method,
            objKey:_msg.objKey,
            content:_msg.content,
            msgCode:_msg.msgCode,
          }
          _messenger.targets[_msg.systemName].send(JSON.stringify(_mess))
        }
      }
    // }
  },
  async logOut(_state, status){
    let _token = sessionStorage.getItem('token'), _userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    if(status == 'manual'){
      MessageBox.confirm('此操作将退出当前系统, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let params = {
          token:store.state.user.token
        }
        _userInfo ? params.userCode = _userInfo.code : ''
        await systemApi.logout(params).then(res=>{
          sessionStorage.clear()
          state.stompClient.disconnect()
          state.msgSocket ? (state.msgSocket.close(), state.msgSocket = null) : ''
          state.audio ? state.audio.pause() : ''
          state.msgList = [],
          state.audio = new Audio()
          state.audio.src = './../../../static/audio/incident.mp3'//默认声音文件
          state.audio.loop = true
          state.audio2 = new Audio()
          state.audio2.src = './../../../static/audio/notify.mp3'//默认声音文件
          state.audio2.loop = false
          state.audioData = []
          store.commit('setIsHandle', false)
          store.commit('setIsLogin', true)
          store.commit('setHistoryPath', {})
        })
      }).catch(() => {});
    }else{
      if(JSON.parse(status.content).token == store.state.user.token){
        sessionStorage.clear()
        state.stompClient.disconnect()
        state.msgSocket ? (state.msgSocket.close(), state.msgSocket = null) : ''
        state.audio ? state.audio.pause() : ''
        state.msgList = [],
        state.audio = new Audio()
        state.audio.src = './../../../static/audio/incident.mp3'//默认声音文件
        state.audio.loop = true
        state.audio2 = new Audio()
        state.audio2.src = './../../../static/audio/notify.mp3'//默认声音文件
        state.audio2.loop = false
        state.audioData = []
        store.commit('setIsHandle', false)
        store.commit('setIsLogin', true)
        store.commit('setHistoryPath', {})
        let _messenger = store.state.messenger.messenger
        _messenger.targets[store.state.ui.curFrame].send(JSON.stringify({type:'switchMenu',path:'/padding'}))
        MessageBox.alert(JSON.parse(status.content).message, '提示', {
          confirmButtonText: '确定',
          callback: action => {}
        })
      }
    }                           
  },
  connect(val){
    //初始化socket
    let _token = sessionStorage.getItem('token'), _infoId = sessionStorage.getItem('infoId') || Math.random().toString(36).substr(2)
    if(!sessionStorage.getItem('infoId')) sessionStorage.setItem('infoId', _infoId)
    if (state.msgSocket && !state.reconnecting) {
      state.notifiy = Notification({
        message: "消息中心已断开，正在尝试重新连接...",
        position: 'bottom-right',
        type: 'error',
        customClass: "Notification",
        duration:0
      })
      state.reconnecting = true
    }
    state.msgSocket = new SockJS(NETWORK_CONFIG.socketUrl + 'msg-websocket')
    state.stompClient = Stomp.over(state.msgSocket)
    // state.stompClient.heartbeat.outgoing = 1000
    // state.stompClient.heartbeat.incoming = 5000
    let _header = {
      token: _token,
      infoId: _infoId
    }
    val ? _header.connectType = 1 : '';
    state.stompClient.connect(_header, function () {
      state.notifiy ? state.notifiy.close() : ''
      Notification({
        type: 'success',
        message: "消息中心已连接",
        position: 'bottom-right',
        customClass: "Notification",
        duration: 3000
      })
      this.subscribe('/user/' + _infoId + '/person/msg', actions.subscribeCallback);
      !val ? actions.getUnLineMsg() : ''
      state.reconnecting ? state.reconnecting = false : ''
    }, () => {
      setTimeout(()=>{
        actions.connect(1)
      }, 2000)   
    })
  }
}

// getters
const getters = {}

// mutations
const mutations = {
  CONNECT_MSG_SOCKET: (state) => {
    actions.connect()
  },
}

export default {
  state,
  getters,
  actions,
  mutations
}
