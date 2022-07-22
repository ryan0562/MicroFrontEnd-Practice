<template>
  <div class="tel-answer-wrap" v-if="showAnswer">
    <p class="number">
      <i></i>
      <font>{{ number }}</font>
    </p>
    <p class="tag">{{ name }}</p>
    <div class="action">
      <img @click="answer" src="../img/icon_boda.png">
      <img @click="hangup" src="../img/icon_guaduan.png">
    </div>
    <audio id="calling" loop="loop" autoplay="autoplay">
      <source src="../img/calling.wav" type="audio/wav">
    </audio>
  </div>
</template>

<script>
import API from '../api';
import { mapState, mapMutations } from 'vuex';
export default {
  data() {
    return {
      audio: null,
      number: null,
      name: '陌生号码'
    }
  },
  computed: {
    ...mapState({
      JsSIP: state => state.SipCallStore.JsSIP, 
      session: state => state.SipCallStore.session,
      showAnswer: state => state.SipCallStore.showAnswer,
    }),
  },
  watch: {
    showAnswer(newVal) {
      if(newVal){
        this.init();
        this.name = '陌生号码';
        // this.play();
      }
    }
  },
  mounted(){
    this.init();
  },
  methods:{
    ...mapMutations(['ANSWER', 'HANGUP', 'SET_SESSION']),
    answer() {
      this.ANSWER();
      // this.paused();
      // jsSip接听电话
      this.session.answer({
        'mediaConstraints':{'audio' : true, 'video': false}
      });
      this.JsSIP.soundPlayer.pause();
			this.JsSIP.soundPlayer.removeAttribute('loop');
      const peerconnection = this.session.connection;
      let _audio = document.querySelector('#remoteAudio');
      peerconnection.addEventListener("addstream", (e)=>{
        _audio.srcObject = e.stream;
      });
    },
    hangup() {
      this.HANGUP();
      // this.paused();
      this.session.terminate();
      this.SET_SESSION(null);
    },
    init() {
      this.number = localStorage.getItem('incomingNumber');
      if(!this.number) return;
      /** 查询电话号码对应的人员 */
      API.getPersonByPhone({phones: [this.number]}).then(res => {
        if(res && res[0]) {
          this.name = res[0].personName || res[0].name;
        }
      })
    },
    play() {
      setTimeout(()=> {
        if(!this.audio) this.audio = document.getElementById('calling');
        if(this.audio && this.audio.paused) {
          try{
            this.audio.play();
          }catch(err) {

          }
        }
      }, 100)
    },
    paused() {
      if(this.audio && !this.audio.paused) this.audio.pause();
    }
  },
}
</script>
<style lang="scss" scoped>
.tel-answer-wrap {
  width: 360px;
  height: auto;
  padding: 15px;
  border-radius:3px;
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  border: 2px solid;
  border-radius: 3px;
  @include mixin(border-color, (#05799f) ($dark-2));
  @include mixin(background-color, (#032b39) ($page-bg-dark));
  audio {
    opacity: 0;
  }
  p {
    width: 100%;
    text-align: center;
    display: inline-block;
    &.number {
      color: #fff;
      font-size: 22px;
      i {
        content: '';
        width: 38px;
        height: 38px;
        position: relative;
        display: inline-block;
        vertical-align: middle;
        background: url('../img/icon_diannaobohao.png');
        background-repeat: no-repeat;
        background-size: 38px 38px;
      }
    }
    &.tag {
      color: #fff;
      font-size: 20px;
      margin-top: 10px;
    }
  }
  .action {
    margin-top: 20px;
    text-align: center;
    img {
      width: 50px;
      height: 50px;
      cursor: pointer;
      margin: 0 25px;
    }
  }
}
</style>