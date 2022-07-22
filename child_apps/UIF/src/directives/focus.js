import Vue from 'vue'
const focus = Vue.directive('focus', {
  bind: function(el, bindings, vnode) {
    console.log('focus1111', el)
  }
})
export default {
  focus
}
