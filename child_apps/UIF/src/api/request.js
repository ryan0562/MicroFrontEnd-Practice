import Http from "./http";
import { Loading,Notification } from 'element-ui';

const Request = new Http();

//封装的载入模块
let loadingUtil = message => {
  this.message = message;
  this.open = Loading.service({
    lock: true,
    text: message,
    spinner: "el-icon-loading"
  })
}
loadingUtil.prototype.close = () => {
  this.open.close()
}
const reqBaseUrl = window.MTI[process.env.NODE_ENV].requestURL;

export default {
  post: async(url,params) => {
    let rdata;
    await Request.post({
      api: reqBaseUrl + url,
      param: params
    }).then(res => {
      if (res.data.code == 500) Notification.error('服务异常，请稍后再试');
      if (res.data.code == 200) rdata = res.data.data;
    }).catch(error => {
      Notification.error('服务异常，请稍后再试');
    })
    return rdata;
  },
  get: async (url, params) => {
    let rdata;
    await Request.get({
      api: reqBaseUrl + url,
      param: params
    }).then(res => {
      if (res.data.code == 500) Notification.error('服务异常，请稍后再试');
      if (res.data.code == 200) rdata = res.data.data;
    }).catch(error => {
      Notification.error('服务异常，请稍后再试');
    })
    return rdata;
  }
}
