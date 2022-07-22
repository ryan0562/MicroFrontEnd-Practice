import Vue from 'vue';
import Vuex from 'vuex';
import ui from './modules/ui';
import user from './modules/user';
import messenger from './modules/messenger';//信使
import msgSocket from './modules/msg-socket';//消息模块
import { SipCallStore } from '@/components/SipCall';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  modules: {
    ui,
    user,
    msgSocket,
    messenger,
    SipCallStore,
  },
})