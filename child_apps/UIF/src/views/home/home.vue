<template>
  <div id="container">
    <!-- <div v-drag="true" style="width:100px;height:300px;position:absolute;top:100px;left:100px;z-index:10000;background:red;">{{exchangedFrames}}</div> -->
    <!-- 头部区域 -->
    <top-bar ref='topbar' v-if="!isLogin && !customTopbar" :layout="layout" @select="handleSelect" @messageSwitch="messageSwitchHandle" />
    <div ref="customTopbar" v-if="!isLogin && customTopbar" class="custom-topbar" :style="{width:customTopbar.size[0], height:customTopbar.size[1], left:customTopbar.offset[0], top:customTopbar.offset[1]}">
      <iframe ref="frames" name="customTopbar" id="topbar" :src="`${customTopbar.url}?systemName=topbar`" frameborder="0" scrolling="no" allowtransparency="true" />
    </div>

    <!-- 首页子系统 -->
    <div :id="`${layout.frames.homed.system}IframeBox`" class="iframe-box" v-show="curFrame == layout.frames.homed.system || exchangedFrames.includes(layout.frames.homed.system)" :style="calcStyle(layout.frames.homed.system)">
      <iframe-title v-if="exchangedOptions[layout.frames.homed.system]" :option="{...exchangedOptions[layout.frames.homed.system], ...{curSystem:layout.frames.homed.system}}" :draggable="exchangedOptions[layout.frames.homed.system].draggable || false" :title="exchangedOptions[layout.frames.homed.system].title || null" @close="closeIframePop(layout.frames.homed.system)" @click.native="setFrameHL(layout.frames.homed.system)" :index="exchangedIndex" />
      <iframe allow="geolocation; microphone; camera; midi; encrypted-media;" :class="{'has-title':exchangedOptions[layout.frames.homed.system]}" ref="frames" :name="layout.frames.homed.system" :id="layout.frames.homed.system" :src="layout.frames.homed.system == 'outer' ? layout.frames.homed.command : layout.frames.homed.url" frameborder="0" scrolling="no" />
    </div>
    <!-- 其它子系统 -->
    <div :id="`${item.system}IframeBox`" class="iframe-box" v-show="curFrame == item.system || exchangedFrames.includes(item.system)" v-for="(item, index) in layout.frames.data" :key="index" :style="calcStyle(item.system)">
      <iframe-title v-if="exchangedOptions[item.system]" :option="{...exchangedOptions[item.system], ...{curSystem:item.system}}" :draggable="exchangedOptions[item.system].draggable || false" :title="exchangedOptions[item.system].title || null" @close="closeIframePop(item.system)" @click.native="setFrameHL(item.system)" :index="exchangedIndex" />
      <iframe allow="geolocation; microphone; camera; midi; encrypted-media;" :class="{'has-title':exchangedOptions[item.system]}" ref="frames" :name="item.system" :id="item.system" :src="item.url ? item.url : ''"  frameborder="0" scrolling="no" />
    </div>
    <!-- 登录界面 -->
    <transition leave-active-class="animated fadeOut">
      <login v-if="isLogin || (!isLogin && loginLoading)" :show="loginShow" :layout="layout" :loading="loginLoading" @success="loginSuccess" />
    </transition>
    <!-- 背景交互蒙层 -->
    <div v-if="exchangedOptions[layout.frames.homed.system] && !exchangedOptions[layout.frames.homed.system].interactive" class="interact-layer" :style="{'z-index':exchangedOptions[layout.frames.homed.system].zIndex || 1}"></div>
    <div v-if="exchangedOptions[item.system] && !exchangedOptions[item.system].interactive" v-for="(item, index) in layout.frames.data" class="interact-layer" :style="{'z-index':exchangedOptions[item.system].zIndex || 1}"></div>
    <!-- 右边消息列表 -->
    <messageList v-if="msgList.length > 0" ref="messageList" v-show="isShowMsg" :data="msgList" />
    <!-- webrtc -->
    <!-- <videos v-if="videoCallData && videoCallData.length > 0" :data="videoCallData" @close="closeVideos" /> -->
    <!--WEBRTC answer-->
    <transition enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutRight">
      <answer v-if="webRtcAnswer" :webRtc="webRtcAnswer" @close="webRtcAnswer = null" />
    </transition>
    <!-- sipcall -->
    <SipCall v-if="isShowSipCall && !isLogin"/>
  </div>
</template>

<script>
import videos from '@/views/videos';
import Login from "@/components/login.vue";
import TopBar from "@/components/topbar.vue";
import { webRtcApi } from '@/components/webRtc';
import SipCall from '@/components/SipCall/SipCall';
import answer from "@/components/webRtc/answer.vue";
import IframeTitle from "@/components/iframeTitle.vue";
import messageList from "@/components/messageList.vue";
import { mapState, mapActions, mapMutations } from "vuex";
import Messenger from "@/util/mti-messenger.js";
// import listenerCB from '@/mixins/listenerCB'
const CONFIG = window.MTI[process.env.NODE_ENV];
export default {
  // mixins:[listenerCB],
  components:{
    Login,
    TopBar,
    answer,
    SipCall,
    messageList,
    IframeTitle,
    videos
  },
  data () {
    return {
      readyList:[],
      isShowMsg:false,
      customTopbar:null,
      isShowInteract:false,
      exchangedFrames:[],
      exchangedOptions:{},
      exchangedIndex:0,
      videoCallData:[],
      loginShow:false,
      loginLoading:false,
      isShowMsg:false,
      isShowWeather:false,
      isShowSipCall: window.MTI.phoneModule,
      timer:{},
      layout:{
        header:{
          menu:[],
          curMenu:''
        },
        frames:{
          homed:{},
          data:[],
        }
      },
      webRtcAnswer:null,
    }
  },
  computed: {
    ...mapState({
      themes:state => state.ui.themes,
      isLogin:state => state.ui.isLogin,
      curFrame:state => state.ui.curFrame,
      msgList:state => state.msgSocket.msgList,
      historyPath:state => state.ui.historyPath,
      messenger:state => state.messenger.messenger,
      handledList:state => state.messenger.handled,
    }),
    userInfo() {
      let _userInfo = sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : ''
      return _userInfo
    },
    calcStyle(){
      return function (system){
        let  _style
        if(this.exchangedOptions[system]){
          let _w, _h, _x, _y, _d = document.body
          this.exchangedOptions[system].size ? (_w = this.exchangedOptions[system].size[0], _h = this.exchangedOptions[system].size[1]) : (_w = `${_d.offsetWidth}px`, _h = `${_d.offsetHeight}px`)
          this.exchangedOptions[system].offset ? (_x = this.exchangedOptions[system].offset[0], _y = this.exchangedOptions[system].offset[1]) :  (_x = `${(_d.offsetWidth - parseInt(_w)) / 2}px`, _y = `${(_d.offsetHeight - parseInt(_h)) /2}px`)
          _style = {..._style, ...{'width':_w, 'height':_h, 'left':_x, 'top':_y, 'z-index':this.exchangedOptions[system].zIndex + 1 || '2', 'position':'absolute'}}
        }else{
          _style = {'width':'100%','height':'100%','left':'0','top':'0','z-index':'0'}
        }
        return _style
      }
    }
  },
  watch:{
    msgList: {
      handler(newVal, oldVal){
        this.isShowMsg = newVal.length <= 0 ? this.isShowMsg : false
        let _msg = {
          type:'messageListCount',
          count:newVal.length
        }
        if(this.readyList.includes('topbar')){
          this.sendMessage('topbar', JSON.stringify(_msg))
        }else{
          let _timmer = setInterval(()=>{
            if(this.readyList.includes('topbar')){
              this.sendMessage('topbar', JSON.stringify(_msg))
              clearInterval(_timmer)
            }
          },500)
        }
      },
    },
    historyPath:{
      handler(newVal,oldVal){
      }
    },
    themes:{
      handler(newVal,oldVal){
        let _systems = [this.layout.frames.homed].concat(this.layout.frames.data)
        if(this.customTopbar) _systems.push({system:'topbar'})
        for(let v of _systems){
            let _msg = {
              type:'themes',
              theme:newVal,
            }
            this.sendMessage(v.system, JSON.stringify(_msg))
          }
        }
    },
    isLogin:{
      handler(newVal,oldVal){
        if(newVal && !oldVal){
        this.layout = {
              header:{
                menu:[],
                curMenu:''
              },
              frames:{
                homed:{url:'http://'},
                data:[],
              }
            }
            this.loginShow = true
          }
      },
    },
    'document.activeElement.id':{
      handler(newVal,oldVal){
        console.log(oldVal,'====>',newVal)
      },
    }
  },
  created(){
    this.$bus.$on('rtcVideoInvite', this.rtcVideoInvite)
  },
  mounted(){
    !this.messenger ? this.initMessenger(new Messenger('parent', 'MessengerFrame')) : ''
    if(sessionStorage.getItem('token') && sessionStorage.getItem('userInfo')){
      this.checkLogin(1)
    }else{
      if(this.$route.query.code) {
        this.silentLogin()
      }else {
        this.checkLogin()
      }
    }
  },
  methods:{
    ...mapMutations(['CONNECT_MSG_SOCKET','initMessenger','setThemes', 'pushHandled', 'setCurFrame','setIsLogin','setToken','setHistoryPath', 'CALL','CALL_VIDEO']),
    ...mapActions(['logOut', 'removeMsg']),
    mousedown (event) {
      event = event || window.event;
      let _target = event.target
      let startx=event.clientX;
      let starty=event.clientY;
      let sb_bkx=startx-event.target.offsetLeft;
      let sb_bky=starty-event.target.offsetTop;
      let ww=document.documentElement.clientWidth;
      let wh = window.innerHeight;
      if (event.preventDefault) {
       event.preventDefault();
      } else{
       event.returnValue=false;
      };
      document.onmousemove=function (ev) {
       let event=ev||window.event;
       let scrolltop=document.documentElement.scrollTop||document.body.scrollTop;
       if (event.clientY < 0 || event.clientX < 0 || event.clientY > wh || event.clientX > ww) {
        return false;
       };
       let endx=event.clientX-sb_bkx;
       let endy=event.clientY-sb_bky;
       _target.style.left=endx+'px';
       _target.style.top=endy+'px';
      }
      },
      mouseup(e) {
      document.onmousemove=null;
    },
    sendMessage(frame, msg){
      this.messenger.targets[frame].send(msg);
    },
    silentLogin() {
      let params = {
        userCode: this.$route.query.code,
        source: this.$route.query.source ? this.$route.query.source : ''
      }
      this.$api.System.silentLogin(params).then(res =>{
        let _data = res
        this.layout.header.menu = _data.modules
        this.layout.frames.homed = _data.homed
        this.layout.frames.data = _data.frames
        this.setToken(_data.token)
        sessionStorage.setItem('token', _data.token)
        _data.topbar ? sessionStorage.setItem('topbar', JSON.stringify(_data.topbar)) : ''
        sessionStorage.setItem('menus', JSON.stringify(_data.modules))
        sessionStorage.setItem('userInfo', JSON.stringify(_data.user))
        sessionStorage.setItem('homed', JSON.stringify(_data.homed))
        sessionStorage.setItem('frames', JSON.stringify(_data.frames.filter(item=>{return item.system != 'uif'})))
        _data.user.currentSystemName ? (localStorage.setItem('systemTitle', _data.user.currentSystemName), window.MTI['title'] = _data.user.currentSystemName) : ''
        this.checkLogin()
      })
    },
    handleSelect(item){
      if(item.children && item.children.length > 0) return//非最下级不能点击
      if(item.command){
        switch (item.commandType) {//1.系统内跳转，2.内部弹窗，3.打开新浏览器，4.重定向，9.执行方法（子系统或uif）
          case 1:
            if(item.command == this.layout.header.curMenu) return
            if(this.curFrame != item.system){
              if(this.curFrame != 'outer'){
                this.sendMessage(this.curFrame, JSON.stringify({type:'switchMenu',path:'/padding'}))
                for(let v of this.exchangedFrames){
                  this.sendMessage(v, JSON.stringify({type:'switchMenu',path:'/padding'}))
                }
                this.exchangedFrames = []
                this.exchangedOptions = {}
              }
              this.setCurFrame(item.system)
            }
            if(item.system != 'outer'){
              let _path = item.command
              _path.indexOf('#') != -1 ? _path = _path.replace('#','') : ''
              let _msg = {
                type:'switchMenu',
                path:_path,
              }
              this.sendMessage(item.system, JSON.stringify(_msg))
            }else{
              document.getElementById(item.system).src = item.command
            }
            let _historyPath = JSON.parse(JSON.stringify(this.historyPath)), _path = item.command.indexOf('#') != -1 ? item.command.replace('#','') : item.command
            _historyPath[item.system] = _path
            this.setHistoryPath(_historyPath)
            break;
          case 2:
              let _path2 = item.command
              _path2.indexOf('#') != -1 ? _path2 = _path2.replace('#','') : ''
              if(this.curFrame == item.system){
                this.sendMessage(item.system, JSON.stringify({
                  type:'openInnerWindow',
                  path:_path2,
                }))
              }else{
                this.exchangedFrames.push(item.system)
                this.exchangedOptions[item.system] = {
                  size:['500px','600px'],//尺寸
                  offset:['1300px','100px'],//位置
                  title:'123456',//标题，不传则隐藏标题栏
                  draggable:true,//是否允许拖动
                  interactive:true,//是否允许背景交互
                }
                this.sendMessage(item.system, JSON.stringify({
                  type:'switchMenu',
                  path:_path2,
                }))
              }
                break;
          case 3:
              if(item.command){
                let _window = window.open('_blank');
                _window.location = item.command
              }
              break;
          case 4:
              item.command ? window.location.href = item.command : ''
            break;
          case 9:
              if(item.system == 'uif'){
                this.$bus.$emit(item.command)
              }else{
                this.curFrame != item.system ? ((this.curFrame != 'outer' ? this.sendMessage(this.curFrame, JSON.stringify({type:'switchMenu',path:'/padding'})) : ''), this.setCurFrame(item.system), this.sendMessage(item.system, JSON.stringify({type:'switchMenu',path:this.historyPath[item.system]}))) : ''
                if(item.system != 'outer'){
                    let _msg = {
                      type:'method',
                      method:item.command,
                    }
                    this.sendMessage(item.system, JSON.stringify(_msg))
                }
              }
            break;
          default:
              return
        }
      }
    },
    //登陆成功后回调
    loginSuccess(){
      this.loginLoading = true
      this.checkLogin()
    },
    //检查登陆状态
    checkLogin(value){
        let _token = sessionStorage.getItem('token'),
        _userInfo = sessionStorage.getItem('userInfo')
        this.exchangedFrames = []
        this.exchangedOptions = {}
        let _isLogin = _token && _userInfo ? false : true
        this.setIsLogin(_isLogin)
        if(!this.isLogin){//初次打开
          this.initMsgSocket()
          this.getSystemDict()
          this.setToken(_token)//刷新补偿VUEX里的token
          this.customTopbar = JSON.parse(sessionStorage.getItem('topbar')) || null
          this.layout.header.menu = JSON.parse(sessionStorage.getItem('menus'))
          this.layout.frames.homed = JSON.parse(sessionStorage.getItem('homed'))
          this.layout.frames.data = JSON.parse(sessionStorage.getItem('frames'))
          this.title = this.userInfo.currentSystemName_
          this.setCurFrame(this.layout.frames.homed.system)
          this.$nextTick(()=>{
            //注册信使
            this.customTopbar ? this.messenger.addTarget(document.getElementById('topbar').contentWindow, 'topbar') : ''//如果自定义头部，则注册信使
            if(this.layout.frames.homed.system != 'outer'){//外来系统不注册,并拉起login幕帘
              this.messenger.addTarget(document.getElementById(this.layout.frames.homed.system).contentWindow, this.layout.frames.homed.system)
            }else{
              this.loginLoading = false
            }
            for(let v of this.layout.frames.data){//外来系统不注册
              if(v.system != 'outer'){
                this.messenger.addTarget(document.getElementById(v.system).contentWindow, v.system)
              }
            }
            this.messenger.addTarget(window.self, 'parent')
            
            //握手当前子系统、外来系统则不握手
            if(!value){
              let _token = sessionStorage.getItem('token'), _userInfo = sessionStorage.getItem('userInfo')
              if(this.layout.frames.homed.system != 'outer'){
                let _msg = {
                  type:'firstHandle',
                  name:this.layout.frames.homed.system,
                  token:_token,
                  user:_userInfo,
                  url:this.layout.frames.homed.url + this.layout.frames.homed.command,
                  theme:this.themes
                }
                this.sendMessage(this.layout.frames.homed.system, JSON.stringify(_msg))
                console.log('握手==='+ _msg.name +'===发起')
                this.timer[this.layout.frames.homed.system] = setInterval(()=>{
                  this.sendMessage(this.layout.frames.homed.system, JSON.stringify(_msg))
                  console.log('握手==='+ _msg.name +'===发起')
                },1000)
              }

              //如果有自定义头部，则握手
              if(this.customTopbar){
                let _msg = {
                  type:'firstHandle',
                  name:'topbar',
                  token:_token,
                  user:_userInfo,
                  url:this.customTopbar.url,
                  theme:this.themes,
                  header:JSON.stringify(this.layout.header)
                }
                this.sendMessage('topbar', JSON.stringify(_msg))
                console.log('握手==='+ _msg.name +'===发起')
                this.timer['topbar'] = setInterval(()=>{
                  this.sendMessage('topbar', JSON.stringify(_msg))
                  console.log('握手==='+ _msg.name +'===发起')
                },1000)
              }

              //握手其它子系统、外来系统则不握手
              setTimeout(()=>{
                for(let v of this.layout.frames.data){
                  if(v.system != 'outer'){
                    let _token = sessionStorage.getItem('token'), _userInfo = sessionStorage.getItem('userInfo')
                    let _msg = {
                      type:'firstHandle',
                      name:v.system,
                      token:_token,
                      user:_userInfo,
                      url:v.url,
                      theme:this.themes
                    }
                    this.sendMessage(v.system, JSON.stringify(_msg))
                    console.log('握手==='+ _msg.name +'===发起')
                    this.timer[v.system] = setInterval(()=>{
                      this.sendMessage(v.system, JSON.stringify(_msg))
                      console.log('握手==='+ _msg.name +'===发起')
                    },1000)
                  }
                }
              },1000)
            }

              //注册消息监听
              let _that = this
              this.messenger.clear()
              this.messenger.listen((msg) => {
                let _msg = JSON.parse(msg)
                console.log(`🚀 [MTI信使] ~ UIF 收到信息 =>`, _msg)
                /** 各子系统握手成功后消息回传 */
                if(_msg.type == 'firstHandle'){
                  if(_that.layout.frames.homed.system == _msg.name){
                    let _path2 = this.layout.frames.homed.command
                    _path2.indexOf('#') != -1 ? _path2 = _path2.replace('#','') : ''
                    let _msg2 = {
                      type:'switchMenu',
                      path:_path2,
                    }
                    this.sendMessage(_msg.name, JSON.stringify(_msg2))
                  }
                  let _msg3 = {
                    type:'themes',
                    theme:this.themes
                  }
                  this.sendMessage(_msg.name, JSON.stringify(_msg3))
                  clearInterval(this.timer[_msg.name])
                  this.timer[_msg.name] = null
                  !this.handledList.includes(_msg.name) ? this.pushHandled(_msg.name) :''
                  this.handledList.includes(this.layout.frames.homed.system) ? this.loginLoading = false : ''
                  console.log('握手==='+ _msg.name +'===成功')
                }
                /** 各子系统通知UIF消息列表开关 */
                if(_msg.type == 'messageSwitch'){
                  this.messageSwitchHandle()
                }
                /** 各子系统通知UIF退出登录 */
                if(_msg.type == 'logOut'){
                  this.logOut('manual')
                }
                /** 各子系统通知UIF改变皮肤 */
                if(_msg.type == 'themesExchange'){
                  this.setThemes(_msg.theme)
                }
                  /** 自定义头部点击回调消息 */
                if(_msg.type == 'topbarMenuHandle'){
                  this.handleSelect(_msg.menuObj)
                }
                /** 自定义头部改变高度 */
                if(_msg.type == 'topbarExchange'){
                  let _customTopbar = this.$refs['customTopbar']
                  _customTopbar.style.left = _msg.left || this.customTopbar.offset[0]
                  _customTopbar.style.top = _msg.top || this.customTopbar.offset[1]
                  _customTopbar.style.width = _msg.width || this.customTopbar.size[0]
                  _customTopbar.style.height = _msg.height || this.customTopbar.size[1]
                }
                /** 各子系统之前的消息中转 */
                if(_msg.type == 'transferMsg'){
                  this.sendMessage(_msg.target, _msg.content)
                }
                /** 子系统Token失效 */
                if(_msg.type == 'unToken'){
                  this.logOut()
                }
                /** 移除消息 */
                if(_msg.type == 'removeMsg'){
                  this.removeMsg(_msg)
                }
                /** 菜单标记 */
                if(_msg.type == 'currentMenu'){
                  this.layout.header.curMenu = _msg.menu
                }
                /** 子系统准备完毕 iframe里内容已被加载 但不是握手成功*/
                if(_msg.type == 'ready'){
                  if(this.layout.frames.homed.system == _msg.system && value){
                    let _path2 = this.layout.frames.homed.command
                    _path2.indexOf('#') != -1 ? _path2 = _path2.replace('#','') : ''
                    let _msg2 = {
                      type:'switchMenu',
                      path:_path2,
                    }
                    this.sendMessage(_msg.system, JSON.stringify(_msg2))
                    let _msg3 = {
                      type:'themes',
                      theme:this.themes
                    }
                    this.sendMessage(_msg.system, JSON.stringify(_msg3))
                  }
                  !this.readyList.includes(_msg.system) ? this.readyList.push(_msg.system) : ''
                }
                /** 切换目标子系统形态 - 弹窗 */
                if(_msg.type == 'systemExchange'){
                  if(_msg.content){
                    let _content = _msg.content
                    if(this.exchangedFrames.includes(_msg.targetSystem)){
                      if(!_msg.content.path){
                        for(let i in _msg.content){
                          this.exchangedOptions[_msg.targetSystem][i] = _msg.content[i]
                        }
                        let _d = document.getElementById(`${_msg.targetSystem}IframeBox`), _s = this.calcStyle(_msg.targetSystem), _t = ''
                        for(let i in _s){
                          _t += `${i}:${_s[i]};`
                        }
                        _d.style.cssText = (_t)
                        return
                      }else{
                        if( this.exchangedOptions[_msg.targetSystem] && _msg.content.path == this.exchangedOptions[_msg.targetSystem].path){
                          _content = {...this.exchangedOptions[_msg.targetSystem], ..._msg.content}
                        }else{
                          let _idx = -1
                          for(let i in this.exchangedFrames){
                            if(this.exchangedFrames[i] == _msg.targetSystem) _idx = parseInt(i)
                            this.sendMessage(this.exchangedFrames[i], JSON.stringify({type:'switchMenu',path:'/padding'}))
                          }
                          _idx > -1 ? this.exchangedFrames.splice(_idx, 1) : ''
                          delete this.exchangedOptions[_msg.targetSystem]
                        }
                      }
                    }
                    setTimeout(()=>{
                      !this.exchangedFrames.includes(_msg.targetSystem) ? this.exchangedFrames.push(_msg.targetSystem) : ''
                      this.exchangedOptions[_msg.targetSystem] = _content
                      this.exchangedOptions[_msg.targetSystem].zIndex = this.exchangedIndex + 2
                      this.exchangedIndex = this.exchangedIndex + 2
                      this.$nextTick(()=>{
                        let _dom = document.getElementById(`${_msg.targetSystem}IframeBox`)
                        this.sendMessage(_msg.targetSystem, JSON.stringify({
                          type:'switchMenu',
                          path:_msg.content.path,
                          query:{..._msg.content.query, ...{
                            offset:[_dom.offsetLeft, _content.title ? _dom.offsetTop + 40 : _dom.offsetTop],
                            size:[_dom.offsetWidth, _content.title ? _dom.offsetHeight - 40 : _dom.offsetHeight]
                          }} || null
                        }))
                        // this.sendMessage(_msg.targetSystem, JSON.stringify({
                        //   type:'changeWindow',
                        //
                        // }))
                      })
                    },100)
                  }else{
                    this.closeIframePop(_msg.targetSystem, 1)
                  }
                }
                /** 视频呼叫 VideoCall */
                // if(_msg.type == 'videoCall'){
                //   // this.videoCallData = _msg.data
                //   this.createMeet(_msg.data)
                // }
                //webrtc视频会议
                if(_msg.type == 'WebRtcMeeting'){
                  this.createRtcMeeting(_msg.data)
                }
                /** 启用电话功能时接收信使传过来的 SipCall */
                if(window.MTI.phoneModule && _msg.type == 'SipCall'){
                  this.CALL(_msg.data)
                }
                /** 启用电话功能时接收信使传过来的 SipCall */
                if(window.MTI.phoneModule && _msg.type == 'SipCallVideo'){
                  this.CALL_VIDEO(_msg.data)
                }
                //视频监控
                if(_msg.type == 'VideoSurveillance'){
                  let { httpUrl, name } = _msg.data;
                  let url = `${window.MTI[process.env.NODE_ENV].videoUrl}?&httpUrl=${httpUrl}&name=${name}`;
                  let iHeight = 742, 
                      iWidth = 1020,
                      iTop = (window.screen.height - 30 - iHeight) / 2,
                      iLeft = (window.screen.width - 10 - iWidth) / 2;
                      console.log(iTop, iLeft)
                  window.open(url,'视频监控', `height=${iHeight}, width=${iWidth}, top=${iTop}, left=${iLeft}, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no`)
                }
                //设置新标题
                if(_msg.type == 'changeTitle'){
                  this.$refs['topbar'].setTitle(_msg.title)
                }
              })
          })
          let _historyPath = {}, _path = this.layout.frames.homed.command.indexOf('#') != -1 ? this.layout.frames.homed.command.replace('#','') : this.layout.frames.homed.command
          _historyPath[this.layout.frames.homed.system] = _path
          this.setHistoryPath(_historyPath)
        }else{
          this.loginShow = true
        }
    },
    //设置目标子系统形态 - 弹窗的高亮
    setFrameHL(system){
      if(this.exchangedOptions[system] && !this.exchangedOptions[system].interactive) return
      this.exchangedOptions[system].zIndex = this.exchangedIndex + 2
      this.exchangedIndex = this.exchangedIndex + 2
    },
    //初始化消息-socket
    async initMsgSocket(){
      await this.CONNECT_MSG_SOCKET()     // 初始化第三方SOCKET
    },
    //异步获取字典
    async getSystemDict() {
      let _dict = await this.$api.System.getSystemDict({})
      let list = _dict, _obj = {}
      for(let i in list){
        let _o = {}
        for(let k in list[i]){
          _o[list[i][k].key] = list[i][k].value
        }
        _obj[`_${i}`] = _o
      }
      sessionStorage.setItem('systemDict', JSON.stringify({...list, ..._obj}))
    },
    messageSwitchHandle(){
      this.isShowMsg = !this.isShowMsg
    },
    closeIframePop(system, flag){
      let _idx = -1
      for(let i in this.exchangedFrames){
        if(this.exchangedFrames[i] == system){
          _idx = parseInt(i)
          break;
        }
      }
      _idx > -1 ? this.exchangedFrames.splice(_idx, 1) : ''
      if(this.exchangedOptions[system] && this.exchangedOptions[system].callbackSystem && !flag){
        let _msg = {
          type:'systemExchangeClose',
          systemName:this.exchangedOptions[system].callbackSystem
        }
        this.sendMessage(system, JSON.stringify(_msg))
      }
      this.sendMessage(system, JSON.stringify({type:'switchMenu',path:'/padding'}))
      delete this.exchangedOptions[system]
    },
    closeVideos(){
      this.videoCallData = []
    },
    rtcVideoInvite(msg){
      let _cont = JSON.parse(msg.content)
      this.webRtcAnswer = _cont
    },
    async createRtcMeeting(data){
      let params = {
        objKey:data.objKey,
        objType:data.objType,
        list:data.members
      }
      let _roomKey = await this.$api.System.rtcRoomCreate(params)
      let _receivers = [], _owner, keys = {'1':'personId','2':'orgId'}
      for(let v of data.members){
        if(!v.owner){
          _receivers.push({
            key: v[keys[v.type]], 
            type: v.type
          })
        }else{
          _owner = v
        }
      }
      let params2 = {
          msgCode: "UIF_TRANSFER_MSG",
          objKey: Math.random().toString(36).substr(2),
          content: JSON.stringify({personId:_owner.personId, personName:_owner.personName, roomKey:_roomKey}),
          receivers: _receivers,
          excludeOwn:true
      }
      await this.$api.System.transferMsgByUmp(params2).then(res=>{
        let url = `${window.MTI[process.env.NODE_ENV].webrtcUrl}?&member=${JSON.stringify({roomKey:_roomKey, personName:_owner.personName, personId:_owner.personId})}`
        window.open(url,'视频会议', 'height=742, width=1020, top=0, left=0, toolbar=no, menubar=no, scrollbars=no,resizable=no,location=no, status=no')
      })
    }
    /**
     * 调用 Jitsi 组视频会议
     * @author 高金斌 <gaojb@mti-sh.cn>
     * @param {Function} personList 人员列表
     */
    // createMeet(personList) {
    //   let userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    //   let nowDate = new Date().toLocaleDateString()
    //   personList.forEach(item => {
    //     item.orgName = item.department
    //     item.personId = item.objKey
    //     item.personName = item.name
    //   })
    //   let param = {
    //     members: personList,
    //     name: `${userInfo.name}于${nowDate}发起的会议`,       // 会议名称
    //   }
    //   console.log(`🚀 [MTI] ~ createMeet ~ param`, param)
    //   /** 创建会议 */
    //   webRtcApi.create(param).then(res => {
    //     let url = `https://${res}`
    //     window.open(url)
    //   })
    // }
  },
}
</script>
<style lang="scss" scoped>
.iframe-box{
  position: absolute;
  left:50px;
  top:0;
  iframe{
    width: 100%;
    height: 100%;
    &.has-title{
      height:calc(100% - 40px);
    }
  }
}
.interact-layer{
  position: absolute;
  left: 0;
  top:0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.2);
  font-size: 600px;
}
.custom-topbar{
  position: absolute;
  z-index:999;
  iframe{
    width: 100%;
    height: 100%;
    background: transparent;
  }
}

</style>
