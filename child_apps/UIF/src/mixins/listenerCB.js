const listenerCB = {
  methods: {
    /* UIF握手回调 */
    firstHandle(_msg, _this, _value) {
      let _path2 = _this.layout.frames.homed.command
      _path2.indexOf('#') != -1 ? (_path2 = _path2.replace('#', '')) : ''
      let _msg2 = {
        type: 'switchMenu',
        path: _path2
      }
      _this.sendMessage(_msg.name, JSON.stringify(_msg2))
      let _msg3 = {
        type: 'themes',
        theme: _this.themes
      }
      _this.sendMessage(_msg.name, JSON.stringify(_msg3))
      clearInterval(_this.timer[_msg.name])
      _this.timer[_msg.name] = null
      // document.getElementById(_msg.name).src = _msg.path + '?ver=' + window.version
      _this.pushHandled(_msg.name)
      _this.handledList.indexOf(_this.layout.frames.homed.system) != -1 ? (_this.loginLoading = false) : ''
      console.log('握手===' + _msg.name + '===成功')
    },
    // /*各子系统之前的消息中转*/
    transferMsg(_msg, _this, _value) {
      _this.sendMessage(_msg.target, _msg.content)
    },
    /** 子系统Token失效 **/
    unToken(_msg, _this, _value) {
      _this.logOut()
    },
    /** 移除消息 **/
    removeMsg(_msg, _this, _value) {
      _this.removeMsg(_msg)
    },
    /** 菜单标记 **/
    currentMenu(_msg, _this, _value) {
      _this.layout.header.curMenu = _msg.menu
    },
    /** 子系统准备完毕 **/
    ready(_msg, _this, _value) {
      // debugger
      if (_this.layout.frames.homed.system == _msg.system && _value) {
        // console.log('系统==='+ _msg.system +'===准备完毕')
        let _path2 = _this.layout.frames.homed.command
        _path2.indexOf('#') != -1 ? (_path2 = _path2.replace('#', '')) : ''
        let _msg2 = {
          type: 'switchMenu',
          path: _path2
        }
        _this.sendMessage(_msg.system, JSON.stringify(_msg2))
        let _msg3 = {
          type: 'themes',
          theme: _this.themes
        }
        _this.sendMessage(_msg.system, JSON.stringify(_msg3))
      }
    },
    /** 切换目标子系统形态 - 弹窗 */
    systemExchange(_msg, _this, _value) {
      if (_msg.content) {
        let _content = _msg.content
        if (_this.exchangedFrames.includes(_msg.targetSystem)) {
          if (!_msg.content.path) {
            for (let i in _msg.content) {
              _this.exchangedOptions[_msg.targetSystem][i] = _msg.content[i]
            }
            let _d = document.getElementById(`${_msg.targetSystem}IframeBox`),
              _s = _this.calcStyle(_msg.targetSystem),
              _t = ''
            for (let i in _s) {
              _t += `${i}:${_s[i]};`
            }
            _d.style.cssText = _t
            return
          } else {
            if (_this.exchangedOptions[_msg.targetSystem] && _msg.content.path == _this.exchangedOptions[_msg.targetSystem].path) {
              _content = { ..._this.exchangedOptions[_msg.targetSystem], ..._msg.content }
            } else {
              let _idx = -1
              for (let i in _this.exchangedFrames) {
                if (_this.exchangedFrames[i] == _msg.targetSystem) _idx = parseInt(i)
              }
              _idx > -1 ? _this.exchangedFrames.splice(_idx, 1) : ''
              delete _this.exchangedOptions[_msg.targetSystem]
            }
          }
        }
        setTimeout(() => {
          _this.exchangedFrames.push(_msg.targetSystem)
          _this.exchangedOptions[_msg.targetSystem] = _content
          _this.exchangedOptions[_msg.targetSystem].zIndex = _this.exchangedIndex + 2
          _this.exchangedIndex = _this.exchangedIndex + 2
          _this.sendMessage(
            _msg.targetSystem,
            JSON.stringify({
              type: 'switchMenu',
              path: _msg.content.path,
              query: _msg.content.query || null
            })
          )
        }, 100)
      } else {
        _this.closeIframePop(_msg.targetSystem, 1)
      }
    },
    /** 视频呼叫 VideoCall */
    videoCall(_msg, _this, _value) {
      // _this.videoCallData = _msg.data
      _this.createMeet(_msg.data)
    },
    /** 启用电话功能时接收信使传过来的 SipCall */
    SipCall(_msg, _this, _value) {
      // if(window.MTI.phoneModule && _msg.type == 'SipCall'){
      _this.CALL(_msg.data)
    }
  }
}
export default listenerCB
