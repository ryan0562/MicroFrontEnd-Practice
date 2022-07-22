// state
const state = {
  themes: '1',
  curFrame: '',
  isLogin: true,
  isHandle: false,
  historyPath: {},
  unlineAuido: false,
  withHeader: 1,
  bigScreen: false
}

// actions
const actions = {

}

// getters
const getters = {

}

// mutations
const mutations = {
  setThemes(state, status) {
    state.themes = status;
  },
  setCurFrame(state, status) {
    state.curFrame = status;
  },
  setIsLogin(state, status) {
    state.isLogin = status;
  },
  setIsHandle(state, status) {
    state.isHandle = status;
  },
  setHistoryPath(state, status) {
    state.historyPath = status;
  },
  setWithHeader(state, status) {
    state.withHeader = status;
  },
  setBigScreen(state, status) {
    state.bigScreen = status;
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
