<template>
  <transition enter-active-class="animated fadeInRight" leave-active-class="animated fadeOutRight">
    <div class="onduty" :style="[{'top':frame.offset[0]},{'right':frame.offset[1]},{'width':frame.size[0]},{'height':frame.size[1]}]">
      <!-- <button @click="csrc">111</button> -->
      <iframe ref="sigFrame" :name="frame.name" :id="frame.name + '_single'" :src="frame.path"  frameborder="0" scrolling="no"></iframe>
      <i class="iconfont icon-add" @click="close"></i>
    </div>
  </transition>
</template>
<script>
import { mapState, mapActions } from "vuex"
const CONFIG = window.MTI[process.env.NODE_ENV]
export default {
  props:['frame'],
  data() {
    return {

    };
  },
  computed: {
    ...mapState({

    }),
  },
  created(){

  },
  mounted(){

  },
  methods:{
    reload(){
      document.getElementById(this.frame.name).src = this.frame.path
    },
    close(){
      this.$emit('close')
    },
    updateSrc(path){
      this.$refs['sigFrame'].src = path
    },
  },
  components:{

  }
};
</script>
<style lang="scss" scoped>
.onduty{
  position: absolute;
  z-index:99999;
  iframe{
    width:100%;
    height: 100%;
  }
  i{
    position: absolute;
    transform: rotate(45deg);
    right:10px;
    top:10px;
    font-size: 16px;
    cursor: pointer;
    color:$white;
  }
}
</style>
