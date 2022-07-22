<template>
  <div class="tel-answer-wrap type2" >
    <span class="tag">{{ webRtc.personName }} 邀请你加入会议</span>
    <div class="action">
      <!-- <a href="javascript:;" class="iconfont icon-playvideo" @click="answer"></a> -->
      <a href="javascript:;" class="iconfont icon-shipindianhua" @click="answer2"></a>
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
      url: 'https://yjzh.mti-sh.cn/',   // 198 环境
      // url: 'https://yjzch.mti-sh.cn/',   // 242 环境
    }
  },
  computed: {
    userInfo(){
      return JSON.parse(sessionStorage.getItem('userInfo'))
    }
  },
  mounted(){
    this.play()
  },
  methods:{
    answer(){
      // const url = this.url + 'rtc/room/getRoom'  // 142
      // const url = this.url + 'api/rtc/room/getRoom'  // 198 和 242
      // let [orgId, , incidentId] = this.webRtc.content.roomKey.split('_')
      // Axios.get(url, {params: { orgId, incidentId }}).then(res => {
      //   if(res) {
      //     window.open(this.webRtc.url)
      //   } else {
      //     Message({
      //       type: 'error',
      //       message: '直播已关闭，请重试。'
      //     })
      //   }
      //   this.close()
      // })
      let url = `${window.MTI[process.env.NODE_ENV].webrtcUrl}?member=${JSON.stringify({roomKey:this.webRtc.roomKey, personId:this.userInfo.personId, personName:this.userInfo.name, clientType:1})}`
      window.open(url,'视频会议', 'height=742, width=1020, top=0, left=0, toolbar=no, menubar=no, scrollbars=no,resizable=no,location=no, status=no')
      this.close()
    },
    answer2(){
      // const url = this.url + 'rtc/room/getRoom'  // 142
      // const url = this.url + 'api/rtc/room/getRoom'  // 198 和 242
      // let [orgId, , incidentId] = this.webRtc.content.roomKey.split('_')
      // Axios.get(url, {params: { orgId, incidentId }}).then(res => {
      //   if(res) {
      //     window.open(this.webRtc.url)
      //   } else {
      //     Message({
      //       type: 'error',
      //       message: '直播已关闭，请重试。'
      //     })
      //   }
      //   this.close()
      // })
      let url = `${window.MTI[process.env.NODE_ENV].webrtcUrl}?member=${JSON.stringify({roomKey:this.webRtc.roomKey, personId:this.userInfo.personId, personName:this.userInfo.name})}`
      window.open(url,'视频会议', 'height=742, width=1020, top=0, left=0, toolbar=no, menubar=no, scrollbars=no,resizable=no,location=no, status=no')
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
  // background: rgba($color: #033347, $alpha: 0.5);
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
