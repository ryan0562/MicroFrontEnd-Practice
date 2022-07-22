<template>
  <div class="login" :class="{'show':show}">
    <div class="left"></div>
      <div class="right">
        <div class="formMain">
          <p class="login-name">{{ sysTitle }}</p>
          <el-form :model="loginData" :rules="rules" ref="login">
            <el-form-item prop="userName">
              <!-- <span class="el-icon-user"></span> -->
              <el-input  v-model="loginData.userCode" placeholder="请输入用户名" autocomplete="off" clearable>
                <i slot="prefix" class="el-icon-user"></i></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <!-- <span class="el-icon-lock"></span> -->
              <el-input type="password" v-model="loginData.password" placeholder="请输入用户密码" autocomplete="off" clearable  @keyup.enter.native="submit">
                <i slot="prefix" class="el-icon-lock"></i>
              </el-input>
            </el-form-item>
            <div class="pass">忘记密码?</div>
            <el-form-item>
              <el-button type="primary" class="submit" @click="submit" :loading="loading">登 录</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="erweima">
          <img class="image" src="~@/assets/images/QRcode.png" alt="">
          <span class="app">凉山应急指挥APP</span>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import { mapActions, mapMutations } from 'vuex';
const CONFIG = window.MTI[process.env.NODE_ENV];
export default {
  props: ['layout', 'loading', 'show'],
  data() {
    return {
      topbar: null,
      isload: false,
      loginData: {
        userCode: '',
        password: ''
      },
      rules: {
        userCode: [{ required: true, message: '请输入用户名称', trigger: 'change' }],
        password: [{ required: true, message: '请输入用户密码', trigger: 'change' }],
        type: []
      },
      sysTitle: ''
    };
  },
  computed: {
    userInfo() {
      return JSON.parse(sessionStorage.getItem('userInfo')) || null;
    }
  },
  created() {
    this.sysTitle = this.userInfo && this.userInfo.currentSystemName ? this.userInfo.currentSystemName : window.MTI['title'];
  },
  mounted() {
    // setTimeout(()=>{
    //   this.isShow = true
    // },500)
  },
  methods: {
    ...mapMutations(['setToken', 'setCustomTopbar']),
    async submit(obj) {
      sessionStorage.clear();
      let params = this.loginData;
      let _data = await this.$api.System.login(params);
      this.layout.header.menu = _data.modules;
      this.layout.frames.homed = _data.homed;
      this.layout.frames.data = _data.frames;

      // _data.topbar = {url:'http://system.ecis.mti:8169/#/topbar', size:['100%', '90px'], offset:['0px', '0px']}

      this.setToken(_data.token);
      //设置系统标题
      _data.user.currentSystemName_ = _data.user.currentSystemName || window.MTI['title'];
      _data.user.currentSystemName
        ? (localStorage.setItem('systemTitle', _data.user.currentSystemName),
          (window.MTI['title'] = _data.user.currentSystemName),
          (document.title = _data.user.currentSystemName))
        : '';
      //用户信息、鉴权
      sessionStorage.setItem('token', _data.token);
      sessionStorage.setItem('homed', JSON.stringify(_data.homed));
      _data.topbar ? sessionStorage.setItem('topbar', JSON.stringify(_data.topbar)) : '';
      sessionStorage.setItem('menus', JSON.stringify(_data.modules));
      sessionStorage.setItem('userInfo', JSON.stringify(_data.user));
      sessionStorage.setItem('homed', JSON.stringify(_data.homed));
      sessionStorage.setItem(
        'frames',
        JSON.stringify(
          _data.frames.filter(item => {
            return item.system != 'uif';
          })
        )
      );
      this.$emit('success');
    }
  }
};
</script>
<style lang="scss" scoped>
 .el-input__inner {
  border-color: #05799f;
  font-size: 18px !important;
  border-radius: 10px;
  &:focus {
    border-color: #00eaff;
    background-color: #033347;
  }
  &:hover {
    border-color: #00eaff;
  }
}
 input:-moz-placeholder,
 textarea:-moz-placeholder {
  color: #bbbbbb;
  font-size: 18px;
}
 input:-ms-input-placeholder,
 textarea:-ms-input-placeholder {
  color: #bbbbbb;
  font-size: 18px;
}
 input::-webkit-input-placeholder,
 textarea::-webkit-input-placeholder {
  font-size: 18px;
  color: #bbbbbb;
}
// 伪类
 ::-webkit-input-placeholder {
  font-size: 18px;
  color: #bbbbbb;
}
 :-moz-placeholder {
  font-size: 18px;
  color: #bbbbbb;
}
 ::-moz-placeholder {
  font-size: 18px;
  color: #bbbbbb;
}
 :-ms-input-placeholder {
  font-size: 18px;
  color: #bbbbbb;
}
//  .el-icon-user:before{
//   color: #11DFF2;
//   font-size: 30px;
//   line-height: 60px;
// }
.login {
  position: absolute;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(~@/assets/images/login_bg.jpg) no-repeat center 0;
  background-size: cover;
  // background-size:100% 100%;
  display: none;
  &.show {
    display: block;
  }
  .left {
    width: 1000px;
    height: 560px;
    position: absolute;
    margin-left: -550px;
    top: 25%;
    left: 35%;
    background: url(~@/assets/images/1st_bg.png) no-repeat center 0;
  }
  //  @keyframes rotation {
  //     from {
  //       transform: rotate(0deg);
  //     }
  //     to {
  //       transform: rotate(45deg);
  //     }
  //   }
  //   .left {
  //     transform: rotate(45deg);
  //     animation: rotation 15s linear infinite;
  //   }
  .right {
    width: 558px;
    height: 419px;
    // min-width: 380px;
    // @include mixin(background-color, (#103442) ($dark-6));
    background: url(~@/assets/images/login_bg.png) no-repeat center 0;
    // background-color:#103442;
    // box-shadow: 0 0 10px 0 rgba(114,114,114,0.24);
    border-radius: 6px;
    position: absolute;
    top: 50%;
    right: 38%;
    margin-top: -255px;
    margin-right: -500px;
    .formMain  {
      width: 100%;
      height: 100%;
      padding: 40px 30px;
      .login-name {
        // @include mixin(color, ($color-3) ($white));
        font-weight: bold;
        font-size: 38px;
        text-align: center;
        margin-bottom: 30px;
        // font-size: 38px;
        font-family: 'FZLTCHJW';
        // font-weight: normal;
        color: #ffffff;
        text-shadow: 0px 5px 7px rgba(0, 26, 35, 0.35);

        background: linear-gradient(#b9f4ff, #4ee3fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .el-form {
        .el-form-item {
          margin-bottom: 20px;
          .el-input {
            display: inline-block;
            // width: 450px;
            .el-input__inner {
              font-size: 24px;
              padding: 0 50px;
              height: 60px;
              line-height: 60px;
              background-color: #003d50;
            }
          }
          .el-icon-user {
            margin-right: 10px;
            color: #11dff2;
            font-size: 30px;
            line-height: 60px;
          }
          .el-icon-lock {
            margin-right: 10px;
            color: #11dff2;
            font-size: 30px;
            line-height: 60px;
          }
        }
        .pass {
          margin-bottom: 20px;
          float: right;
          color: #ffffff;
        }
      }
      .submit {
        width: 100%;
        height: 64px;
        color: #fff;
        font-size: 24px;
        // margin-left: 15px;
        // border-radius:4px;
        // background: #036EB8;
        background: linear-gradient(90deg, #049bbf 0%, #02ada2 100%);
        border-radius: 10px;
        margin-top: 20px;
      }
    }
    .erweima {
      width: 303px;
      height: 173px;
      // background: #00EAFF;
      background: url(~@/assets/images/login_erweima.png) no-repeat center 0;
      float: right;
      margin-top: 95px;
      position: relative;
      .image {
        width: 110px;
        height: 110px;
        position: absolute;
        right: 96px;
      }
      .app {
        width: 150px;
        height: 18px;
        font-size: 18px;
        font-family: Microsoft YaHei;
        font-weight: bold;
        color: #ffffff;
        position: absolute;
        top: 73%;
        right: 18%;
      }
    }
  }
}
.loading {
  width: 100%;
  height: 40px;
  margin: 0 auto;
  background: #036eb8;
  text-align: center;
  border-radius: 4px;
}
.loading span {
  display: inline-block;
  width: 5px;
  height: 100%;
  border-radius: 4px;
  background: lightgreen;
  -webkit-animation: load 1.04s ease infinite;
}
@-webkit-keyframes load {
  0%,
  100% {
    height: 10px;
    background: rgba(255, 255, 255, 0.5);
  }
  50% {
    height: 20px;
    margin-top: 0;
    background: lightblue;
  }
}
.loading span:nth-child(2) {
  -webkit-animation-delay: 0.13s;
}
.loading span:nth-child(3) {
  -webkit-animation-delay: 0.26s;
}
.loading span:nth-child(4) {
  -webkit-animation-delay: 0.39s;
}
.loading span:nth-child(5) {
  -webkit-animation-delay: 0.52s;
}
</style>
