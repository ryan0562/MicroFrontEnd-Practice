import WsCode from './WsCode';
import { Notification } from 'element-ui';
export default class Ws {
  /**
   * 构造函数
   * @author 高金斌 <gaojb@mti-sh.cn>
   */
  constructor(url, open, success, close, err) {
    this.socket = new WebSocket(url);
    /** 连接成功 */
    this.socket.onopen = () => {
      this._open(open);
    }
    /** 有消息进来的回调 */
    this.socket.onmessage = (evt) => {
      this._success(evt, success);
    }
    /** 连接关闭 */
    this.socket.onclose = () => {
      this._close(close);
    }
    /** 连接错误 */
    this.socket.onerror = () => {
      console.error('🚀 电话呼叫 webSocket 连接失败！')
      Notification({
        type: 'error',
        duration: 3000,
        position: 'top-right',
        message: "电话呼叫 webSocket 连接失败！",
      })
      if(typeof err === 'function') err()
    }
  }
  /**
   * 内部方法->连接成功
   * @author 高金斌 <gaojb@mti-sh.cn>
   * @param {Function} cb 回调
   */
  _open(cb) {
    console.log('🚀 [SipCall] 连接成功...')
    /** 连接成功后发送登录消息 —— (sip客户端代理时) */
    if(window.MTI.rcsType == 2) this.send({code: 'code_login'});
    if(typeof cb === 'function') cb();
  }
  /**
   * 内部方法->有消息进来的方法
   * @author 高金斌 <gaojb@mti-sh.cn>
   * @param {Object} data 接收到的消息对象
   * @param {Function} cb 回调
   */
  _success(data, cb) {
    // console.log('🚀 [SipCall] 接收到消息 =>', data.data)
    let res = JSON.parse(data.data)
    /** 根据 code 调用方法 */
    if(WsCode[res.code]) WsCode[res.code].apply(this, [this, res.data, data]);
    if(typeof cb === 'function') cb(res, data);
  }
  /**
   * 内部方法->连接关闭
   * @author 高金斌 <gaojb@mti-sh.cn>
   * @param {Function} cb 回调
   */
  _close(cb) {
    console.log('🚀 [SipCall] 连接已关闭...')
    if(typeof cb === 'function') cb();
  }
  /**
   * 发送消息
   * @author 高金斌 <gaojb@mti-sh.cn>
   * @param {Object} msg 要发送的消息
   */
  send(msg) {
    let sendMsg
    /** 根据 code 调用方法，如果没有 code 直接发送 */
    if(WsCode[msg.code]) {
      sendMsg = WsCode[msg.code].apply(this, [msg.args]);
    }else {
      sendMsg = msg;
    }
    /** 转换成字符串发送 */
    this.socket.send(JSON.stringify(sendMsg));
  }
}