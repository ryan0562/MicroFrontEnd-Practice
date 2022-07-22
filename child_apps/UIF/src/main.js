import './public-path'
import Vue from 'vue';
import App from './App';
import bus from './bus';
import 'es6-promise/auto';
import store from './store';
import router from './router';
import directives from '@/directives';
import {base64} from 'js-base64';
import Cookie from '@/util/cookie.js';
import echarts from 'echarts';
import elementui from 'element-ui';
import moment from 'moment'//导入文件
import 'element-ui/lib/theme-chalk/index.css';
import './../static/style/index.scss';//全局样式
import './../static/iconfont/iconfont.css';//iconfont图标样式
import 'animate.css';
import api from '@/api';
Vue.use(elementui);
Vue.use(directives)
Vue.prototype.$bus = bus;
Vue.prototype.$moment = moment;
Vue.prototype.$cookie = Cookie;
Vue.prototype.$base64 = base64;
Vue.prototype.$echarts = echarts;
// Vue.config.productionTip = false;
Vue.prototype.$api = api;

//vue
window.myVue = new Vue({
  el: '#child_apps_lszyqjslfh',
  store,
  router,
  render: h => h(App)
})
