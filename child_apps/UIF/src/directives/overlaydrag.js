import Vue from 'vue';
const overlaydrag = Vue.directive('drag', {
    inserted:function(el, bindings, vnode){
      let _this = vnode.context, _oldOffset = []
      if (bindings.value) {
        el.onmousedown = function(e) {
          let _cDiv = document.createElement("div"), _dDiv = document.getElementById('container')
          _cDiv.setAttribute('class', 'v-dragging__wrapper')
          _cDiv.id = 'v-dragging-wrapper'
          _dDiv.appendChild(_cDiv)
          let elp = el.parentNode,
          disx = e.pageX - elp.offsetLeft,
          disy = e.pageY - elp.offsetTop;
          document.onmousemove = function(e) {
            e.preventDefault();
            elp.style.left = e.pageX - disx + "px";
            elp.style.top = e.pageY - disy + "px";
            _this.option.offset = [elp.style.left, elp.style.top]
            // console.log(_oldOffset,[elp.style.left, elp.style.top])
            if(_oldOffset[0] != elp.style.left || _oldOffset[1] != elp.style.top){
              let _mess = {
                type:'changeWindow',
                offset:[elp.offsetLeft, _this.option.title ? elp.offsetTop + 40 : elp.offsetTop],
                size:[elp.offsetWidth, _this.option.title ? elp.offsetHeight - 40 : elp.offsetHeight]
              }
              _this.messenger.targets[_this.option.curSystem].send(JSON.stringify(_mess))
              _oldOffset = [elp.style.left, elp.style.top]
            }
          };
          document.onmouseup = function() {
            _dDiv.removeChild(document.getElementById('v-dragging-wrapper'))
            document.onmousemove = document.onmouseup = null;
          };
        };
      } else {
        el.onmousedown = null;
      }
    }
  })
export default {
  overlaydrag
}
