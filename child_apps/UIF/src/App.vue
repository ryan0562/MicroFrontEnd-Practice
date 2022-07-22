<template>
  <div id="app" :class="{'bigScreen': bigScreen}">
    <router-view/>

    <!-- 电话呼叫——音频标签 -->
    <audio id="remoteAudio" crossOrigin="anonymous" preload="auto" autoplay>
      <p>Your browser doesn't support HTML5 audio.</p>
    </audio>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
export default {
  name: 'App',
  data() {
    return {

    };
  },
  computed:{
    ...mapState({
      map: state => state.map.map, //地图控件
      themes:state => state.ui.themes,
      bigScreen:state => state.ui.bigScreen
    })
  },
  watch:{
    themes(newVal, oldVal){
      window.document.documentElement.setAttribute('data-theme', `theme_${newVal}`);
    },
  },
  created(){
    console.log(window);
    console.log(window.rawWindow);
  },
  mounted(){
    window.document.documentElement.setAttribute('data-theme', `theme_${this.themes}`);
  },
  methods: {},
}
</script>
<style lang="scss">
#app{
  width: 100%;
  height: 100%;
  overflow: hidden;
  max-width: 3800px;
  margin: 0 auto;
  &.bigScreen {
    min-width: 3840px;
    width: 3840px;
    height: 1080px;
    .bar-left, .bar-right {
      width:calc((3840 - 622px) / 2);
    }
  }
}
body{
  min-width: 1300px;
}
// 首页行政区选择样式
.sel-home {
  top: 117px !important;
  left: 105px !important;
  width: 400px !important;
  .opt-item {
    width: 25%;
    float: left;
  }
  .opt-parent {
    width: 100%;
    text-align: center;
  }
  .popper__arrow {
    left: 335px !important;
  }
}
// 首页行政区选择样式End

// 日期选择框
.sel-date {
  position: absolute;
  top: 188px !important;
  left: 500px !important;
  width: 500px;
  height: 500px;
  z-index: 2001;
  display: block !important;
  .selected {
    display: table-cell !important;
  }
}
</style>