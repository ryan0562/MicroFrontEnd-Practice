/*
 * @Author: sean
 * @Date: 2022-06-14 17:14:02
 * @LastEditTime: 2022-07-20 15:03:00
 * @Description: JsSip封装
*/
import store from '@/store';
class Sip {
  /** 基本信息 */
  static baseInfo = {
    name: 'test',
    code: '1004',
    password: '1111',
    fsIp: '10.168.4.231',
    sipPort: '5060',
    wsType: 'wss',
    wsPort: '7443',
    wsIp: '10.168.4.231',
    prefixNumber: '' //910
  }
  /**
   * @author: sean
   * @param  { Object } options 基本信息
   * @param  { Function } success 成功的回调
   * @param  { Function } close 关闭的回调
   * @param  { Function } err: 失败的回调
   * @description: 构造函数
   */  
  constructor(options, success, close, err) {
    this.soundPlayer = new Audio();
    let _options = options ? options : Sip.baseInfo;
    this.socket = new JsSIP.WebSocketInterface(_options.wsType + '://' + _options.wsIp + _options.wsPort);
    // this.socket = new JsSIP.WebSocketInterface(_options.wsType + '://' + _options.wsIp + ':' + _options.wsPort);
    // 用户代理配置信息
    var config = {
      realm: _options.fsIp,
      sockets: [this.socket], // 信令服务器的连接集合
      password: _options.password,
      display_name: _options.name,
      authorization_user: _options.code,
      uri: 'sip:' + _options.code + '@' + _options.fsIp + ':' + _options.sipPort + ';transport=' + _options.wsType,
      register_expires: 120,
      session_timers: false, // 启用会话计时器（根据RFC 4028)
    };
    this.UA = new JsSIP.UA(config);
    this.UA.start();
    this.setUserAgent(this.UA);
    /** 连接成功 */
    this.socket.onopen = () => {
      console.error('🚀 [js-Sip] webSocket 连接成功！')
    }
    /** 有消息进来的回调 */
    this.socket.onmessage = (evt) => {
      if (typeof success === 'function') success();
    }
    /** 连接关闭 */
    this.socket.onclose = () => {
      if (typeof close === 'function') close();
    }
    /** 连接错误 */
    this.socket.onerror = () => {
      console.error('🚀 [js-Sip] webSocket 连接失败！')
      if (typeof err === 'function') err();
    }
  }

  /**
   * @author: sean
   * @param  { Object } ua 用户代理
   * @description: 设置用户代理
   */  
  setUserAgent(ua) {
    // ws开始尝试连接
    ua.on('connecting', e => {
      console.log("🚀 ~ file: sip.js ~ line 74 ~ Sip ~ setUserAgent ~ ws开始尝试连接", e)
    });
    
    // ws连接完毕
    ua.on('connected', e => {
      console.log("🚀 ~ file: sip.js ~ line 79 ~ Sip ~ setUserAgent ~ ws连接完毕", e)
    });
    
    // ws连接失败
    ua.on('disconnected', e => {
      console.log("🚀 ~ file: sip.js ~ line 84 ~ Sip ~ setUserAgent ~ ws连接失败", e)
    })

    // SIP注册成功
    ua.on('registered', e => {
      console.log("🚀 ~ file: sip.js ~ line 89 ~ Sip ~ setUserAgent ~ SIP注册成功", e)
    });

    // SIP注册失败
    ua.on('registrationFailed', e => {
      console.log("🚀 ~ file: sip.js ~ line 94 ~ Sip ~ setUserAgent ~ SIP注册失败", e)
    });

    // SIP取消注册
    ua.on('unregistered', e => {
      console.log("🚀 ~ file: sip.js ~ line 99 ~ Sip ~ setUserAgent ~ SIP取消注册", e)
    });

    // sipEvent
    ua.on('sipEvent', e => {
      console.log("🚀 ~ file: sip.js ~ line 104 ~ Sip ~ setUserAgent ~ sipEvent", e)
    });
    
    // IM消息 事件
    ua.on('newMessage', e => {
      console.log('newMessage event被触发，IM新消息！event params:', e);
    });

    //newOptions 选项事件
    ua.on('newOptions', e => {
      console.log('newOptions event被触发，新的检索！event params:', e);
    });

    // 来电或者外呼事件
    ua.on('newRTCSession', e => {
      const session = e.session;
      //外部呼叫me，我方为被叫
      if (e.originator === 'remote') {
        this.setSession(session);
        store.commit('SET_SESSION',session);
        const callers = session.remote_identity.uri.user;
        console.log("🚀 ~ file: sip.js ~ line 125 ~ Sip ~ setUserAgent ~ incoming call", callers)
        if(store.state.SipCallStore.isCaller){
          // 主动接听电话（主叫）
          session.answer({
            'mediaConstraints':{'audio' : true, 'video': false},
            // 'pcConfig': {
            //   'iceServers': [
            //     // { 'urls': ['stun:a.example.com', 'stun:b.example.com'] },
            //     { 'urls': 'turn:124.70.193.179:3478', 'username': 'daoshu', 'credential': ' daoshu2017' }
            //   ]
            // }
          });
          const peerconnection = session.connection;
          let _audio = document.querySelector('#remoteAudio');
          peerconnection.addEventListener("addstream", (e)=>{
            console.log("🚀 ~ file: sip.js ~ line 134 ~ Sip ~ addstream 远程的媒体流 ~ e", e)
            _audio.srcObject = e.stream;
          }); 
        }else{
          //设置来电播放器（被叫）
          this.soundPlayer.volume = 1;
          this.soundPlayer.loop = "loop";
          this.soundPlayer.src = "/static/audio/incoming-call.ogg";
          this.soundPlayer.play();
        }
      } else {
        store.commit('SET_SESSION',session);
        let _audio = document.querySelector('#remoteAudio');
        console.log("🚀 ~ file: sip.js ~ line 147 ~ Sip ~ setUserAgent ~ outing call", e)
        const peerconnection = session.connection;
        peerconnection.addEventListener('addstream', (event) => {
          _audio.srcObject = event.stream;
        });
      }
    });
  }

  /**
   * @author: sean
   * @param  { Object } ua 用户代理
   * @description: 设置用户代理
   */  
	callPhone(number){
		// 注册会话过程中所有事件的处理程序
		let eventHandlers = {
		  'peerconnection':(e)=>{this.sessionPeerconnection(e)},
		  'connecting':(e)=>{this.sessionConnecting(e)},
		  'sending':(e)=>{this.sessionSending(e)},
		  'progress':(e)=>{this.sessionProgress(e)},
		  'accepted':(e)=>{this.sessionAccepted(e)},
		  'confirmed':(e)=>{this.sessionConfirmed(e)},
		  'ended':(e)=>{this.sessionEnded(e)},
		  'failed':(e)=>{this.sessionFailed(e)},
		  'newDTMF':(e)=>{this.sessionNewDTMF(e)},
		  'newInfo':(e)=>{this.sessionNewInfo(e)},
		  'hold':(e)=>{this.sessionHold(e)},
		  'unhold':(e)=>{this.sessionUnhold(e)},
		  'muted':(e)=>{this.sessionMuted(e)},
		  'unmuted':(e)=>{this.sessionUnmuted(e)},
		  'reinvite':(e)=>{this.sessionReinvite(e)},
		  'update':(e)=>{this.sessionUpdate(e)},
		  'refer':(e)=>{this.sessionRefer(e)},
		  'replaces':(e)=>{this.sessionReplaces(e)},
		  'sdp':(e)=>{this.sessionSdp(e)},
		  'icecandidate':(e)=>{this.sessionIcecandidate(e)},
		  'getusermediafailed':(e)=>{this.sessionGetuserMediaFailed(e)}
		};
		//呼叫参数
		let options = {
		  'eventHandlers'    : eventHandlers,
		  'mediaConstraints' : { 'audio': true, 'video': false }
		};
		let target = 'sip:' + baseInfo.prefixNumber + number;

		this.phoneSession = this.UA.call(target, options);
    store.commit('SET_SESSION',this.phoneSession);
	}

  /**
   * @author: sean
   * @description: 设置会话事件
   */  
	setSession(session){
		session.on('peerconnection',(e)=>{this.sessionPeerconnection(e)});
		session.on('connecting',(e)=>{this.sessionConnecting(e)});
		session.on('sending',(e)=>{this.sessionSending(e)});
		session.on('progress',(e)=>{this.sessionProgress(e)});
		session.on('accepted',(e)=>{this.sessionAccepted(e)});
		session.on('confirmed',(e)=>{this.sessionConfirmed(e)});
		session.on('ended',(e)=>{this.sessionEnded(e)});
		session.on('failed',(e)=>{this.sessionFailed(e)});
		session.on('newDTMF',(e)=>{this.sessionNewDTMF(e)});
		session.on('newInfo',(e)=>{this.sessionNewInfo(e)});
		session.on('hold',(e)=>{this.sessionHold(e)});
		session.on('unhold',(e)=>{this.sessionUnhold(e)});
		session.on('muted',(e)=>{this.sessionMuted(e)});
		session.on('unmuted',(e)=>{this.sessionUnmuted(e)});
		session.on('reinvite',(e)=>{this.sessionReinvite(e)});
		session.on('update',(e)=>{this.sessionUpdate(e)});
		session.on('refer',(e)=>{this.sessionRefer(e)});
		session.on('replaces',(e)=>{this.sessionReplaces(e)});
		session.on('sdp',(e)=>{this.sessionSdp(e)});
		session.on('icecandidate',(e)=>{this.sessionIcecandidate(e)});
		session.on('getusermediafailed',(e)=>{this.sessionGetuserMediaFailed(e)});
	}

  /**
   * @author: sean
   * @description: 注销UA
   */  
  unRegister(){
    let options = {
      all: false
    }
    this.UA.unregister(options);
  }

  //会话预连接事件处理器
	sessionPeerconnection(e){
		console.log('peerconnection event被触发！event params:',e);
	}
	
	//会话连接事件处理器
	sessionConnecting(e){
		console.log('connecting event被触发！event params:',e);
	}
	
	//sending事件处理器
	sessionSending(e){
		console.log('sending event被触发！event params:',e);
	}
	
	//接收或生成邀请请求的响应时触发此事件，该事件在SDP处理之前触发（如果存在）
	//以便在需要时进行微调，甚至通过删除数据对象中响应参数
	sessionProgress(e){
		if(e.originator == 'remote'){
			console.log('progress event被触发，我方为被叫，响应主叫内容！event params：', e);
		}else{
			console.log('progress event被触发，我方为主叫，发送邀请请求！event params：', e);
		}
	}
	
	// 呼叫成功/振铃
	sessionAccepted(e){
		if(e.originator == 'local'){
			console.log('accepted event被触发，已振铃！event params：',e)
		}else{
			console.log('accepted event被触发，已接听！event params：',e)
		}    
	}
	
	//确认呼叫后激发
	sessionConfirmed(e){
		if(e.originator == 'remote'){
			console.log('confirmed event 被触发，我方为被叫(incoming call)！event params:', e);
		}else{
			console.log('confirmed event 被触发，我方为主叫(outgoing call)！event params:',e);
		}
	}
	
	// 接听成功后 挂断
	sessionEnded(e){  
		if(e.originator == 'local'){ //主叫方挂断
      this.soundPlayer.pause();
			this.soundPlayer.removeAttribute('loop');
			console.log('ended event被触发，主叫挂断电话，通话结束！event params:',e );		
		}else{ //被叫方挂断
			console.log('ended event被触发，被叫挂断电话，通话结束！event params:',e );	
		}
	}
	
	// 接听失败
	sessionFailed(e){
		console.log('failed event被触发，未建立通话，就结束了（对方拒接或者自己挂断）！event params:',e );
	}
	
	//新的双音多频信令
	sessionNewDTMF(e){
		console.log('newDTMF event被触发，新的DTMF信令！event params:',e);	
	}
	
	//发送或接收SIP INFo消息
	sessionNewInfo(e){
		console.log('newInfo event被触发，新的SIP INFO消息！event params:',e);
	}
	
	// 通话被挂起
	sessionHold(e){
		const org = e.originator;
    if(org === 'local'){
			console.log('hold event被触发，通话被本地挂起！event params:', e);
    }else{
      console.log('hold event被触发，通话被远程挂起！event params:', e);
    }
	}
	
	// 通话被继续
	sessionUnhold(e){
		const org = e.originator;
    if(org === 'local'){
      console.log('unhold event被触发，通话被本地继续！event params:', e)
    }else{
      console.log('unhold event被触发，通话被远程继续！event params:', e);
    }
	}
	
	//静音事件处理器
	sessionMuted(e){
		console.log('muted event被触发，静音了！event params:',e);
	}
	
	//取消静音事件处理器
	sessionUnmuted(e){
		console.log('unmuted event被触发，取消静音！event params:',e);
	}
	
	//重新邀请事件处理器
	sessionReinvite(e){
		console.log('reinvite event被触发！event params:',e);
	}
	
	//更新事件处理器
	sessionUpdate(e){
		console.log('update event被触发！event params:',e);
	}
	
	//refer事件处理器
	sessionRefer(e){
		console.log('refer event被触发！event params:',e);
	}
	
	//replaces事件处理器
	sessionReplaces(e){
		console.log('replaces event被触发！event params:',e);
	}
	
	//将远程SDP传递到RTC引擎之前以及在发送本地SDP之前邀请。
	//此事件提供了修改传入和传出SDP的机制
	sessionSdp(e){
		console.log(`sdp event 被触发(${e.type})，event params:`,e);
	}
	
	//本地ICE候选对象事件处理器
	sessionIcecandidate(e){
		console.log('icecandidate event被触发！event params:',e);
	}
	
	//getUserMedia()失败事件处理器
	sessionGetuserMediaFailed(e){
		console.log('getusermediafailed event被触发，！event params:',e);
	}
}

export default Sip;