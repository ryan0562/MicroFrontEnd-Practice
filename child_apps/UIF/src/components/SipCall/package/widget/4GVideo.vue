<template>
  <div id="dialog" v-drag>
    <div class="header">
      <span>单兵视频连线</span>
      <i class="el-icon-close" @click="closeDialog"></i>
    </div>
    <div class="content" :class="dynamicClass">
      <!-- 118.122.8.53:1936/8003000000091974 -->
      <div :id="item.number" class="video" :url="item.videoUrl" v-for="(item, index) in videoList" :key="index">
        <canvas :id='`video_${item.number}`' style='height:100%;width:100%;'></canvas>
        <!-- <p class="tip" v-if="item.name">
          <span class="name">{{ item.name }}</span>
        </p> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
  data() {
    return {
      show: true,
    }
  },
  computed: {
    ...mapState({
      videoList: state => state.SipCallStore.videoList, 
		}),	
    dynamicClass(){
      let _class = '';
      let _len = this.videoList.length;
      if(_len == 1) _class = 'temp-1';
      if(_len == 2) _class = 'temp-2';
      if(_len > 2) _class = 'temp-3';
      return _class;
    },
  },
  watch: {
    videoList(newVal){
      console.log(222222, newVal)
      if(newVal.length && newVal.length < 4){
        newVal.forEach((item)=>{
          this.$nextTick(()=>{
            let _domId = `video_${item.number}`; // canvas视频窗口ID 
            let _canvasObj = document.getElementById(_domId);
            // USC play.js 提供方法
            fullPlayer.resize(_canvasObj)
          })
        })
      }
    }
  },
  directives: {
    drag(el) {
      el.onmousedown = function (e) {
        let elp = el;
        var disy = e.pageY - elp.offsetTop;
        var disx = e.pageX - elp.offsetLeft;
        document.onmousemove = function (e) {
          elp.style.top = e.pageY - disy + 'px';
          elp.style.left = e.pageX - disx + 'px';
        }
        document.onmouseup = function () {
          document.onmousemove = document.onmouseup = null;
        }
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations(['SET_ISCALLER', 'DELECT_VIDEO_LIST', 'CLEAR_VIDEO_LIST']),
    closeDialog() {
      this.SET_ISCALLER(false);
      /** 关闭所有播放视频 */
      this.videoList.forEach((item)=>{
        closeVideo(`video_${item.number}`); // USCVideo.js
      })
      this.CLEAR_VIDEO_LIST();
    }
  },
  beforeDestroy(){
    this.SET_ISCALLER(false);
    if(this.videoList.length) this.CLEAR_VIDEO_LIST();
  }
}
</script>
<style lang="scss" scoped>
#dialog {
  width: 800px;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10000;
  transform: translate(-40%, -50%);
  @include mixin(border-color, ($white) ($dark-2));
  @include mixin(background-image, ($page-bg) ($page-bg-dark));
  overflow: hidden;
  .header {
    width: 100%;
    height: 46px;
    font-size: 16px;
    line-height: 46px;
    padding: 0px 15px;
    border: 1px solid;
    @include mixin(color, ($white) ($white));
    @include mixin(border-color, ($primary) ($dark-2));
    @include mixin(background-color, ($primary) ($primary-dark));
    i {
      font-size: 22px;
      cursor: pointer;
      position: absolute;
      top: 12px;
      right: 15px;
    }
  }
  .content {
    width: 100%;
    height: 450px;
    display: flex;
    flex-wrap: wrap;
    // width: auto;
    // max-height: 450px;
    overflow: hidden;
    overflow-y: auto;
    .video{
      // float: left !important;
      // width: 400px;
      // height: 225px;
      margin: 0;
      border: 1px solid;
      position: relative;
      @include mixin(border-color, ($primary) ($dark-2));
      @include mixin(background-color, ($black) ($black));
      overflow: hidden;
      .tip{
        width: 100%;
        height: 36px;
        display: flex;
        padding: 0px 15px;
        align-items: center;
        justify-content: space-between;
        background-color: rgba(255, 255, 255, 0.2);
        position: absolute;
        left: 0px;
        bottom: 0px;
        z-index: 11;
        cursor: pointer;
        .name{
          color: #fff;
          font-size: 16px;
        }
        i{
          display: none;
          font-size: 20px;
        }
      }
    }
    &.temp-1 .video{
      width: 100% !important;
      height: 100% !important;
    }
    &.temp-2 .video{
      width: 50% !important;
      height: 100% !important;
    }
    &.temp-3 .video{
      width: 50% !important;
      height: 50% !important;
    }
  }
}
</style>