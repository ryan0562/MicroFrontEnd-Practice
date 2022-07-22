// state
const state = {
  handled: [],
  messenger: '',
}

// actions
const actions = {}

// getters
const getters = {}

// mutations
const mutations = {
  initMessenger(state, status) {
    state.messenger = status;
  },
  pushHandled(state, status) {
    state.handled.push(status);
  },
  sendMessage(state, data){
    data.toSystems.forEach((item)=>{
      state.messenger.targets[item].send(JSON.stringify(data));
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}