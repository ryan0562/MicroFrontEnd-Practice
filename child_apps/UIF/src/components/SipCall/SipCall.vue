<template>
  <div>
    <!-- 通话列表 -->
    <List />
    <!-- 通话列表 -->
    <Answer />
    <!-- 右下角连接状态 -->
    <Status />
    <!-- 4G单兵视频 -->
    <soldierVideo  v-if="videoList.length > 0"/>
  </div>
</template>

<script>
import API from './package/api';
import List from './package/widget/List';
import Answer from './package/widget/Answer';
import Status from './package/widget/Status';
import soldierVideo from './package/widget/4GVideo';
import { mapState, mapActions, mapMutations } from 'vuex';
import JsSIP from './package/utils/sip.js';
export default {
  components:{
    List,
    Answer,
    Status,
    soldierVideo
  },
  data() {
    return {
      sipInfo: {},
      serverInfo: {},
      wsUrl: 'ws://127.0.0.1:9002',
    }
  },
  computed: {
    ...mapState({
      JsSIP: state => state.SipCallStore.JsSIP, 
      videoList: state => state.SipCallStore.videoList, 
		}),	
    getUserInfo(){
      return JSON.parse(sessionStorage.getItem('userInfo')) || {};
    }
  },
  created(){},
  async mounted() {
    if(window.MTI.rcsType == 1){
      await this.getServerInfo();
      await this.getSipInfo();
    }
    if(window.MTI.rcsType == 2){
      /** 连接 SipCall WebSocket */
      this.connection(this.wsUrl);
    }
  },
  methods: {
    ...mapActions(['connection']),
    ...mapMutations(['REGISTER', 'SET_AUTH', 'SET_JSSIP']),
    initSip(){
      // new Sip实例
      let _options ={
        wsType: 'wss',
        sipPort: '', //5060
        prefixNumber: '', //910
        fsIp: this.sipInfo.gateway,
        wsIp: this.sipInfo.gateway,
        name: this.getUserInfo.name,
        wsPort: this.sipInfo.conferenceUrl,
        code: this.sipInfo.sipNumber,
        password: this.sipInfo.pwd,
      } 
      let _jsSIP = new JsSIP(_options);
      this.SET_JSSIP(_jsSIP);
    },
    // 获取sip相关服务    
    async getServerInfo(){
      let params = {
        accountId: this.getUserInfo.code
      };
      let _data = await API.getServerInfo(params);
      if(_data){
        this.serverInfo = _data;
        /** 连接 SipCall WebSocket */
        this.connection(_data.wsUrl);
      }
    },
    // 获取sip账号信息
    async getSipInfo(){
      let params = {
        gateway: this.serverInfo.sipIp,
        accountId: this.getUserInfo.code,
      };
      let _data = await API.getSipInfo(params);
      if(_data){
        this.sipInfo = _data;
        if(_data.sipNumber && _data.sipNumber != ''){
          this.initSip();
          this.SET_AUTH(true);
          sessionStorage.setItem('sipNum', _data.sipNumber);
          setTimeout(()=>{ this.REGISTER() }, 500)
        }
      }
    },
  },
  beforeDestroy(){
    if(this.JsSIP) this.JsSIP.unRegister();
  }
}
</script>
<style lang="scss" scoped>

</style>