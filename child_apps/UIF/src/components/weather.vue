<template>
  <transition enter-active-class="animated fadeInRight" leave-active-class="animated fadeOutRight">
    <div class="wea-dialog">
      <div class="title">
        气象信息
        <i class="iconfont icon-add" @click="close"></i>
      </div>
      <div class="cont">
        <div class="today" v-if="data.today">
          <span class="iconfont" :class="'icon-wea-' + data.today.wea_img"></span>
          <span>
            {{ data.today.tem2.replace("℃", "°C") }}-{{ data.today.tem1.replace("℃", "°C") }}<br />
            <b>{{ data.today.wea }}，{{ data.city }}</b>
            <br />
            <b>{{data.today.win[0]}}，{{data.today.win_meter}}</b>
            <br />
            <b>气压{{data.today.pressure}}Pa，湿度{{data.today.humidity}}</b>
          </span>
        </div>
        <ul v-if="data.sevendays">
          <li v-for="(item, index) in data.sevendays" :key="index">
            <span>{{ item.date | dateFilter }}</span>
            <span>{{ item.week }}</span>
            <span class="iconfont" :class="'icon-wea-' + item.wea_img"></span>
            <span>{{ item.tem2.replace("℃", "°C") }}-{{ item.tem1.replace("℃", "°C") }}</span>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: ["data"],
  components: {},
  data() {
    return {};
  },
  computed: {},
  filters: {
    dateFilter(val) {
      return val.substring(5);
    },
  },
  created() {},
  mounted() {
    console.log(this.data, '====================')
  },
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
.wea-dialog {
  position: absolute;
  width: 274px;
  overflow: hidden;
  top: 88px;
  right: 120px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  @include mixin(background, (#033950) ($page-bg-dark));
  .title {
    width: 100%;
    height: 34px;
    line-height: 34px;
    font-size: 16px;
    @include mixin(background-color, ($primary-dark) ($primary-dark));
    @include mixin(color, ($white) ($white));
    padding: 0 15px;
    i {
      position: absolute;
      transform: rotate(45deg);
      right: 10px;
      top: 2px;
      font-size: 16px;
      cursor: pointer;
      color: $white;
    }
  }
  .cont {
    width: 100%;
    overflow: hidden;
    .today {
      width: 100%;
      height: 140px;
      border-bottom: 1px $br-primary solid;
      display: flex;
      span {
        @include mixin(color, ($white) ($white));
        &:nth-child(1) {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
          @include mixin(color, ($white) ($white));
          flex: 1.1;
        }
        &:nth-child(2) {
          font-size: 30px;
          line-height: 20px;
          padding-top: 30px;
          @include mixin(color, ($state-5) ($state-5));
          flex: 2;
          b {
            font-size: 16px;
            font-weight: 400;
            @include mixin(color, ($white) ($white));
          }
        }
      }
    }
    ul {
      width: 100%;
      overflow: hidden;
      padding: 5px 0;
      li {
        width: 100%;
        height: 26px;
        line-height: 26px;
        font-size: 16px;
        padding: 0 15px;
        display: flex;
        span {
          @include mixin(color, ($white) ($white));
          &:nth-child(1) {
            flex: 1.2;
          }
          &:nth-child(2) {
            flex: 1.1;
          }
          &:nth-child(3) {
            flex: 0.8;
            text-align: center;
          }
          &:nth-child(4) {
            flex: 1.9;
            @include mixin(color, ($state-5) ($state-5));
          }
        }
      }
    }
  }
}
</style>
