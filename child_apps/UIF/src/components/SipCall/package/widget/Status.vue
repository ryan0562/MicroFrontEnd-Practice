<template>
  <div 
    :title="tips"
    :class="statusClass"
    class="connection-status"
    @click="connectionHandle">
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  data(){
    return{
      sipNum: sessionStorage.getItem('sipNum')
    }
  },
  computed: {
    ...mapState({
      wsState: state => state.SipCallStore.wsState
    }),
    /** 图标提示文字 */
    tips() {
      return this.wsState ? `${this.sipNum}已连接！`: '点击重连！';
    },
    /** 状态的不同样式 */
    statusClass() {
      return this.wsState ? 'on': 'off';
    }
  },
  methods:{
    ...mapActions(['connection']),
    connectionHandle() {
      /** 如果未连接则重连 */
      if(!this.wsState) this.connection()
    }
  }
}
</script>
<style lang="scss" scoped>
.connection-status {
  width: 25px;
  height: 25px;
  position: fixed;
  border-radius: 50%;
  right: 4px;
  bottom: 4px;
  cursor: pointer;
  background-size: contain;
  &.on {
    background-image: url('../img/icon_diannaobohao.png');
  }
  &.off {
    background-image: url('../img/icon_saoraodianhu.png');
  }
}
</style>