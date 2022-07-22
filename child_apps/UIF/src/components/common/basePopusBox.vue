<template>
  <div class="basePopusBox">
    <div class="header">
      <div class="headerBgColor"></div>
      <div class="headerBgPic"></div>
      <div class="title">
        {{ title }} <i class="close-btn el-icon-close" @click="close"></i>
      </div>
    </div>
    <div class="middle">
      <slot></slot>
    </div>
    <div class="footer">
      <div class="footerBgPic left"></div>
      <div class="footerBgColor"></div>
      <div class="footerBgPic right"></div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "标题",
    },
    data: null,
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    // 关闭弹框
    close() {
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
.basePopusBox {
  // z-index: 90000;
  // position: fixed;
  // // position: absolute;
  // left: 20%;
  // right: 20%;
  // top: 90px;
  // bottom: 20px;
  @include mixColor($white, $white);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .header {
    width: calc(100% + 7px);
    height: 48px;
    display: flex;
    position: relative;
    left: -7px;
    .headerBgColor {
      background: url("~@/assets/images/workPopup/title.png") no-repeat left top;
      background-size: auto 100%;
      flex: 1;
      &::after {
        content: "";
        display: block;
        height: 100%;
        margin-left: 20px;
        border-top: 1px solid #05799f;
        background: #0f3643;
      }
    }
    .headerBgPic {
      width: 20px;
      background: url("~@/assets/images/workPopup/tankuang_jiao.png") no-repeat
        left top;
    }
    .title {
      text-indent: 12px;
      position: absolute;
      left: 30px;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 38px;
      line-height: 38px;
      background: linear-gradient(90deg, #05809f, rgba(5, 128, 159, 0));
      &::before {
        content: "";
        display: block;
        width: 2px;
        height: 38px;
        background: #00eaff;
        position: absolute;
        left: -5px;
        top: 50%;
        transform: translateY(-50%);
      }
      .close-btn {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 22px;
        font-weight: 800;
        @include mixColor(#b6effa, $white);
        cursor: pointer;
      }
    }
  }
  & > .middle {
    flex: 1;
    background: rgba($color: #0f3643, $alpha: 1);
    border: 1px solid;
    border-top: 0;
    border-bottom: 0;
    border-color: #05799f;
    overflow: hidden;
    overflow-y: auto;
  }
  & > .footer {
    height: 15px;
    display: flex;
    position: relative;
    .footerBgPic {
      width: 20px;
      background: url("~@/assets/images/workPopup/jiao.png") no-repeat;
      background-size: 100% 100%;
      &.left {
        transform: rotate(180deg);
      }
      &.right {
        transform: rotateX(180deg);
      }
    }
    .footerBgColor {
      flex: 1;
      border-bottom: 1px solid #05799f;
      background: #0f3643;
      &::before {
        content: "";
        height: 1px;
        width: calc(100% - 40px);
        background: rgba($color: #045773, $alpha: 1);
        position: absolute;
        top: 8px;
      }
      &::after {
        content: "";
        height: 1px;
        width: 5%;
        background: rgba($color: #00eaff, $alpha: 0.6);
        position: absolute;
        top: 9px;
        left: 15px;
      }
    }
  }
}
</style>
