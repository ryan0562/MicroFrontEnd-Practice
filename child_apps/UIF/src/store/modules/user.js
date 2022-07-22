'use strict'
import systemApi from '@/api/modules/system'
import Cookie from '@/util/cookie.js';
const state = {
  token:''
}
const getters = {

}
const actions = {

}
const mutations = {
  setToken(state, data) {
    state.token = data
  },
}
export default {
  state,
  getters,
  actions,
  mutations
}
