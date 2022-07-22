<template>
  <div class="tel-answer-wrap type2" >
    <span class="tag">{{ webRtc.name }}邀请你加入会议</span>
    <div class="action">
      <a href="javascript:;" class="iconfont icon-shipindianhua" @click="answer"></a>
      <a href="javascript:;" class="iconfont icon-voice-hangUp-circle" @click="hangup"></a>
    </div>
    <audio id="video_callings" loop autoplay>
      <source src="./package/assets/video_callings.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>
<script>
import Axios from '@/axios'
import { Message } from 'element-ui'
import { mapState, mapMutations } from 'vuex'
export default {
  props:['webRtc'],
  data() {
    return {
      number: null,
      audio: null,
      t: null,
      // url: 'https://ypyj.mti-sh.cn/',   // 142 环境
      url: 'http://yjzh.mti-sh.cn/',   // 198 环境
      // url: 'https://yjzch.mti-sh.cn/',   // 242 环境
    }
  },
  computed: {
    ...mapState({
      // withHeader:state => state.ui.withHeader,
      // themes:state => state.ui.themes,
      // msgList:state => state.msgSocket.msgList,
      // handledList:state => state.messenger.handled
    }),
  },
  mounted(){
    this.play()
  },
  methods:{
    answer(){
      window.open('https://'+this.webRtc.url)
      this.close()
    },
    hangup(){
      this.close()
    },
    play() {
      setTimeout(()=> {
        if(!this.audio) this.audio = document.getElementById('video_callings')
        if(this.audio && this.audio.paused) {
          try{
            this.audio.play()
          }catch(err) {

          }
        }
      }, 100)
    },
    paused() {
      if(this.audio && !this.audio.paused) this.audio.pause()
    },
    autoHangup() {
      /** 30秒后自动挂断 */
      this.t = setTimeout(() => {
        this.$emit('close')
      }, 30000)
    },
    close() {
      clearTimeout(this.t)
      this.paused()
      this.$emit('close')
    }
  },
  components:{

  }
}
</script>
<style lang="scss" scoped>
.tel-answer-wrap {
  position: fixed;
  top: 150px;
  right: 30px;
  width:420px;
  height:auto;
  // background:rgba(255,255,255,1);
  background: rgba($color: #072B38, $alpha: 1);
  box-shadow:0px 0px 10px 0px rgba(123,123,123,0.3);
  border-radius:3px;
  border: 1px solid #05799f;
  padding-bottom: 10px;
  margin: 0 auto;
  span {
    display: inline-block;
    width: 100%;
    text-align: center;
    margin-top: 30px;
    &.number {
      margin-top: 20px;
      font-size: 24px;
      &::before {
        content: '';
        position: relative;
        top: 10px;
        margin-right: 15px;
        width: 40px;
        height: 40px;
        display: inline-block;
      }
    }
    &.tag {
      font-size: 25px;
      color: white;
      &::after {
        content: '';
        position: relative;
        margin-left: 15px;
        width: 25px;
        height: 25px;
        display: inline-block;
      }
    }
    &.label {
      margin-top: 25px;
      font-size: 24px;
      color: #0063F0;
    }
  }
  &.type1 {
    .number::before {
      // background: url('../img/icon_moshenghaoma.png');
    }
    .tag::after {
      // background: url('../img/icon_yiwen.png');
    }
  }
  &.type2 {
    .number::before {
      // background: url('../img/icon_diannaobohao.png');
    }
    .tag::after {
      content: none;
      // background: url('../img/icon_diannaobohao.png');
      background-size: cover;
    }
  }
  &.type3 {
    .number::before {
      // background: url('../img/icon_saoraodianhu.png');
    }
    .tag::after {
      // background: url('../img/icon_saoraohaoma.png');
    }
  }
  .action {
    text-align: center;
    margin: 25px 0;
    a{
      display: inline-block;
      font-size: 50px;
      // width:50px;
      // height: 50px;
      margin: 0 20px;
      line-height: 50px;
      @include mixin(color, (green) (green));
      & + a{
        @include mixin(color, (red) (red));
      }
    }
  }
}
</style>
