'use strict'
import Axios from 'axios'
import router from '../router'
import { Message } from 'element-ui'

import Vue from 'vue'
import Vuex from 'vuex'
import store from '../store'
import Cookie from '@/util/cookie.js';

Vue.use(Vuex)

// 发起request 拦截器
Axios.interceptors.request.use(config => {
  // 加上统一用户需要的Headers
  // config.headers['x-app-code'] = 'uif'
  config.headers['Content-Type'] = 'application/json';
  config.headers['x-end-point'] = window['MTI'].endClientPoint || 'eduty';
  let _token = sessionStorage.getItem('token');
  config.headers['Authorization'] = `${ _token }`;
  return config;
}, err => {
  return Promise.reject(err)
})

// 收到response 拦截器
Axios.interceptors.response.use(response => {
  const data = response.data
  if(!data.code) return data;
  // console.log('[' + response.config.url +"]接口，服务器返回：", data)
  // 统一用户成功返回状态码为'000000'
  if (data.code === 200 || data.code === '000000') return data.data
  if(data.code === 100001){
    Message({
      type: 'error',
      message: data.data
    })
    store.dispatch('logOut', true)
    return false
  }
    Message({
      type: 'error',
      message: data.message
    })
  return new Promise(() => {})
}, err => {
  console.log("[失败]服务器返回：", err)
  Message({
    type: 'error',
    message: '抱歉，网络或服务器不稳定，请重试'
  })
  return new Promise(() => {})
})

export default Axios
