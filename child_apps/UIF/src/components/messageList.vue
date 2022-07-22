<template>
  <div class="msg-box">
    <ul class="msg-list">
      <li v-for="(item,index) in data" :key="index" @click="handleMsg(item)">
        <el-row>
          <el-col :span="15">
            <span class="circle"></span>
            <span class="title ellipsis">{{ item.msgName }}</span>
          </el-col>
          <el-col :span="9">
            <span>{{ item.createTime }}</span>
          </el-col>
          <el-col :span="24">
            <p>{{ item.notice.notify }}</p>
          </el-col>
        </el-row>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  props: ['data'],
  data() {
    return {};
  },
  filters: {
    formatDate: function (value) {
      return this.$moment(parseInt(value)).format('YYYY-MM-DD');
    }
  },
  computed: {
    ...mapState({
      messenger: state => state.messenger.messenger
    })
  },
  created() {
    this.$bus.$on('removeMessage', msg => {
      this.removeMessage(msg);
    });
  },
  methods: {
    ...mapActions(['clickMsg', 'removeMessage']),
    // 点击详情
    handleMsg(item) {
      console.log(item);
      this.clickMsg(item);
    }
  },
  beforeDestroy() {
    this.$bus.$off('removeMsg');
  }
};
</script>
<style lang="scss" scoped>
.msg-box {
  width: 400px;
  height: 550px;
  @include mixin(background-color, ($dark-6) ($dark-6));
  @include mixin(border, (none) (1px $dark-2 solid));
  box-shadow: 0px 3px 13px 3px rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 86px;
  right: 40px;
  z-index: 1001;
  .msg-list {
    width: 100%;
    padding-top: 10px;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    li {
      width: 100%;
      height: 90px;
      padding: 10px 15px;
      border-style: solid;
      border-width: 0 0 1px 0;
      @include mixin(color, ($white) ($white));
      @include mixin(border-color, ($dark-2) ($dark-2));
      cursor: pointer;
      .el-row {
        width: 100%;
        height: 100%;
        .el-col-15 {
          overflow: hidden;
          line-height: 26px;
          span.circle {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            background-color: #ff0000;
          }
          span.title {
            font-size: 16px;
            display: inline-block;
            vertical-align: middle;
            width: calc(100% - 15px);
            @include mixin(color, ($white) ($white));
          }
        }
        .el-col-9 {
          overflow: hidden;
          line-height: 26px;
          text-align: right;
          span {
            @include mixin(color, ($color-ac) ($color-ac));
          }
        }
        .el-col-24 {
          width: 100%;
          p {
            margin-top: 5px;
            padding-left: 12px;
            font-size: 14px;
            line-height: 20px;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            @include mixin(color, ($color-cc) ($color-cc));
            overflow: hidden;
          }
        }
      }
      &.active {
        @include mixin(background-color, ($bg-secondary) ($bg-secondary));
      }
    }
  }
}
</style>
