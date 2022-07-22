<template>
  <div class="tel-list-wrap" v-if="isJoin"> 
    <div v-if="!showList" class="moudel" @click="showList = true">
      <img src="../img/icon_tonghuazhong.png">
      <!-- <span>{{timeStr}}</span> -->
    </div>
    <div class="list" v-if="showList">
      <div class="title">
        <img class="status" src="../img/icon_tonghuazhong.png">
        <!-- <span class="time">{{timeStr}}</span> -->
        <img class="close" src="../img/icon_shouqi.png" @click="showList = false">
      </div>
      <ul>
        <li v-for="(item, index) in numberList" :key="index" :class="'status' + item.status">
          <span class="name">{{ item.name || item.number }}</span>
          <div class="action">
            <!-- 挂断按钮 -->
            <img @click="kick(item)" v-if="item.status == 0 || item.status == 1" src="../img/icon_status1.png">
            <!-- 拨打按钮 -->
            <img @click="call(item)" v-if="item.status == 2" src="../img/icon_status2.png">
            <!-- 删除按钮 -->
            <img @click="remove(item)" v-if="item.status == 2" src="../img/icon_remove.png">
          </div>
        </li>
      </ul>
      <div class="btn">
        <el-button @click="hangup()" type="danger">挂断</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      list: [],
      showList: false,
    }
  },
  computed: {
    ...mapState({
      isJoin: state => state.SipCallStore.isJoin,
      timeStr: state => state.SipCallStore.timeStr,
      numberList: state => state.SipCallStore.numberList,
    }),
  },
  mounted(){},
  methods:{
    ...mapMutations(['CALL', 'HANGUP', 'KICK', 'SET_ISCALLER', 'DELECT_NUMBER_LIST']),
    kick(item) {
      this.KICK(item);
    },
    call(item) {
      this.CALL([item]);
    },
    remove(item) {
      this.DELECT_NUMBER_LIST(item);
    },
    hangup() {
      this.HANGUP();
      this.showList = false;
      this.SET_ISCALLER(false);
    },
  },
  beforeDestroy(){
    this.HANGUP();
    this.showList = false;
    this.SET_ISCALLER(false);
  }
}
</script>
<style lang="scss" scoped>
.tel-list-wrap {
  position: fixed;
  top: 90px;
  right: 40px;
  z-index: 9999;
  .moudel {
    width: 80px;
    height: 80px;
    display: flex;
    border: 2px solid;
    border-radius: 3px;
    align-items: center;
    justify-content: center;
    @include mixin(border-color, (#05799f) ($dark-2));
    @include mixin(background-color, (#032b39) ($page-bg-dark));
    text-align: center;
    cursor: pointer;
    img {
      width: 40px;
      height: 40px;
    }
    span {
      font-size: 22px;
      color: #0FBB99;
    }
  }
  .list {
    width:290px;
    height:390px;
    padding: 15px;
    border: 2px solid;
    border-radius: 3px;
    @include mixin(border-color, (#05799f) ($dark-2));
    @include mixin(background-color, (#032b39) ($page-bg-dark));
    border-radius:3px;
    .title {
      .status {
        width: 28px;
        height: 28px;
      }
      .time {
        font-size: 24px;
        margin-left: 15px;
        color: #0FBB99;
      }
      .close {
        width: 25px;
        height: 25px;
        float: right;
        cursor: pointer;
      }
    }
    ul {
      height: 260px;
      margin-top: 15px;
      overflow: hidden;
      overflow-y: auto;
      li {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .name {
          width: 150px;
          color: #fff;
          font-size: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          display: inline-block;
        }
        /** 呼叫 */
        &.status0 .name {
          color: #0063EF;
        }
        /** 通话 */
        &.status1 .name {
          color: #0FBB99;
        }
        /** 离线 */
        &.status2 .name {
          color: #97969C;
        }
        .action {
          width: 80px;
          text-align: right;
          display: inline-block;
          img {
            width: 25px;
            height: 25px;
            margin-left: 5px;
            cursor: pointer;
          }
        }
      }
    }
    .btn{
      width: 100%;
      margin-top: 15px;
      text-align: center;
    }
  }
}
</style>