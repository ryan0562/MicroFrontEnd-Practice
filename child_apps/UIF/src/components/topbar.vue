<template>
  <div :class="['topbar', {'hide':withHeader != 1}, {'bigScreen':bigScreen}]">
    <div class="bar-left">
      <menuTree :data="layout.header.menu" :cur="layout.header.curMenu" @select="handleSelect"></menuTree>
    </div>
    <div class="bar-center" />
    <div class="bar-right">
      <div v-if="bigScreen" class="date-time">
        <span class="time">{{ dateTime.time }}</span>
        <span class="date">{{ dateTime.date }}</span>
        <span class="col" />
      </div>
      <template v-if="weather.today">
        <span class="weatherBox" @click="handleWeather">
          <img class="wea_day_img" :src="require(`@/assets/images/weather/${weather.today.wea_day_img}.gif`)" />
          <span class="weather iconfont">{{ weather.today.tem }} {{weather.today.win[0]}}</span>
        </span>
      </template>
      <span class="col" v-if="isShowAddressBook" />
      <span class="iconfont icon-tongxunlu" v-if="isShowAddressBook" @click="handleAddressBook"></span>
      <span class="col" v-if="isShowSipCall" />
      <!-- <span class="iconfont icon-dial" v-if="isShowSipCall" @click="handleDial"></span>
      <span class="col" />-->
      <el-badge :hidden="msgList.length==0" :max="99" :value="msgList.length" class="item">
        <span class="iconfont icon-message" @click="handleMsg"></span>
      </el-badge>
      <span class="col" />
      <span :class="['iconfont', bigScreen?'icon-danping':'icon-daping1']" @click="bigScreenShow"></span>
      <span class="col" v-if="isShowSipCall" />
      <!-- <template v-if="chooseThemes">
        <el-popover ref="popover" placement="bottom" trigger="click" width="100">
          <div class="themes-picker">
            <label>主题</label>
            <a href="javascript:;" :class="{'active':themes == '1'}" @click="themesHandle('1')"></a>
            <a href="javascript:;" :class="{'active':themes == '2'}" @click="themesHandle('2')"></a>
          </div>
          <span class="iconfont icon-theme" slot="reference"></span>
        </el-popover>
        <span class="col" />
      </template> -->
      <span class="iconfont icon-touxiang">
        <span class="userName">{{userName}}</span>
      </span>
      <el-dropdown trigger="click" size="small" @command="handleCommand">
        <span class="iconfont icon-tuichu"></span>
        <el-dropdown-menu slot="dropdown" class="passwordPopus">
          <el-dropdown-item command="password">修改密码</el-dropdown-item>
          <el-dropdown-item command="loginOut">退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 标题 -->
    <div class="title">{{ title }}</div>
    <!-- 修改密码 -->
    <changepw v-if="isShowChangepassword" @close="closeCPW"></changepw>
    <!-- 天气 -->
    <weather v-show="isShowWeather" :data="weather" @close="handleWeatherClose"></weather>
    <!-- 消息管理 -->
    <messageManage v-if="isShowMessageManage" @close="handleMessageManageClose" :show="isShowMessageManage"></messageManage>
    <!-- 子系统管理 -->
    <subSystemManage v-if="isShowSubSystemManage" @close="handleSubSystemClose" :show="isShowSubSystemManage"></subSystemManage>
    <!-- 拨号盘 -->
    <!-- <dial v-if="isShowDial" @close="isShowDial = false" /> -->
    <!--WEBRTC answer-->
    <!-- <transition enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutRight">
      <answer v-if="isAnswerShow" :webRtc="webRtc" @close="isAnswerShow = !isAnswerShow" />
    </transition>-->
    <!--Jitis answer-->
    <transition enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutRight">
      <MeetingAnswer v-if="isMeetingAnswerShow" :webRtc="jRtc" @close="isMeetingAnswerShow = false" />
    </transition>
    <!-- 网络状态 -->
    <transition enter-active-class="animated fadeInDown" leave-active-class="animated fadeOutUp">
      <div v-if="!onLine" class="error">当前网络不可用，请检查您的网络设置！</div>
    </transition>
  </div>
</template>

<script>
import Axios from 'axios';
import dial from '@/components/SipCall/Dial';
import menuTree from '@/components//navMenu';
import weather from '@/components/weather.vue';
import changepw from '@/components/changepw.vue';
import messageManage from '@/components/messageManage.vue';
import subSystemManage from '@/components/subSystemManage.vue';
// import answer from "@/components/webRtc/answer.vue";
import MeetingAnswer from '@/components/webRtc/MeetingAnswer.vue';
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';
const CONFIG = window.MTI[process.env.NODE_ENV];
export default {
  name: 'Header',
  props: ['layout'],
  components: {
    dial,
    weather,
    menuTree,
    changepw,
    // answer,
    messageManage,
    subSystemManage,
    MeetingAnswer
  },
  data() {
    return {
      title:'',
      jRtc: {},
      onLine: true,
      timmer: null,
      // webRtc: {},
      // isAnswerShow: false,
      isMeetingAnswerShow: false,
      chooseThemes: window.MTI.themes,
      isShowSipCall: window.MTI.phoneModule,
      regionId: sessionStorage.userInfo ? JSON.parse(sessionStorage.userInfo).regionId : '',
      isRTCBox: false,
      isShowDial: false,
      isShowWeather: false,
      isShowAddressBook: true,
      isShowMessageManage: false,
      isShowChangepassword: false,
      isShowSubSystemManage: false,
      userName: sessionStorage.userInfo ? JSON.parse(sessionStorage.userInfo).name : '',
      activeIndex2: '',
      weather: {
        today: null,
        sevendays: null,
        city: '',
        timer: null
      },
      ondutyFrame: {
        path: ``,
        name: 'mv',
        pathdark: ``,
        offset: ['88px', '100px'],
        size: ['450px', '600px']
      },
      dateTime: {
        date: '',
        time: ''
      }
    };
  },
  computed: {
    ...mapState({
      themes: state => state.ui.themes,
      withHeader: state => state.ui.withHeader,
      msgList: state => state.msgSocket.msgList,
      messenger: state => state.messenger.messenger,
      curFrame: state => state.ui.curFrame,
      bigScreen: state => state.ui.bigScreen
    }),
    userInfo() {
      return JSON.parse(sessionStorage.getItem('userInfo')) || null;
    }
  },
  watch: {
    themes: {
      handler(newVal, oldVal) {
        let _path = this.ondutyFrame[`path${newVal}`];
        // this.$refs['singleFrame'].updateSrc(_path)
      }
    }
  },
  created() {
    this.title = this.userInfo.currentSystemName_
    this.initTime();
    this.getWeather();
    this.timmer = setInterval(() => {
      this.onLine = navigator.onLine;
    }, 3000);
    this.weather.timer = setInterval(() => {
      this.getWeather();
    }, 1000 * 360);
  },
  mounted() {
    this.$bus.$on('uifSubSystemDialog', () => {
      this.isShowSubSystemManage = true;
    });
    this.$bus.$on('uifMessageManageDialog', () => {
      this.isShowMessageManage = true;
    });
    this.$bus.$on('logOut', msg => {
      this.logOut(msg);
    });
    this.$bus.$on('handleAddressBook', this.handleAddressBook);
    // this.$bus.$on("rtcInvite", msg => {
    //   // 198
    //   let _content = JSON.parse(msg.content), _host = 'https://yjzh.mti-sh.cn/webrtc-page#/pages/webrtc/webrtc'
    //   // 242
    //   // let _content = JSON.parse(msg.content), _host = 'https://yjzch.mti-sh.cn/webrtc-page#/pages/webrtc/webrtc'
    //   this.isAnswerShow = true
    //   this.webRtc = {
    //     url:`${_host}?type=${_content.type}&clientKey=${this.userInfo.personId}&name=${this.userInfo.name}&roomKey=${_content.roomKey}&action=join`,
    //     room:_content.name,
    //     name:_content.personName,
    //     content: _content
    //   }
    // })
    this.$bus.$on('meetingInvite', msg => {
      let _content = JSON.parse(msg.content);
      _content = _content.content;
      this.isMeetingAnswerShow = true;
      this.jRtc = {
        url: _content.url,
        name: _content.name,
        content: _content
      };
    });
  },
  methods: {
    ...mapMutations(['setThemes', 'setConstant', 'setBigScreen']),
    ...mapActions(['logOut']),
    setTitle(title){
      this.title = title
    },
    initTime() {
      this.getDateTime();
      this.timer = setInterval(() => {
        this.getDateTime();
      }, 1000);
    },
    getDateTime() {
      function add_0(num) {
        return num < 10 ? '0' + num : num;
      }
      let myDate = new Date();
      this.dateTime = {
        date: myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate(),
        time: add_0(myDate.getHours()) + ':' + add_0(myDate.getMinutes()) + ':' + add_0(myDate.getSeconds())
      };
    },
    bigScreenShow() {
      this.setBigScreen(!this.bigScreen);
    },
    themesHandle(val) {
      if (this.themes != val) this.setThemes(val);
      this.$refs.popover.showPopper = false;
    },
    async getWeather() {
      let _data = await this.$api.System.getWeather({
        cityId: window.MTI.weather.cityId
      });
      if (_data.weather) {
        let weatherData = JSON.parse(_data.weather);
        this.weather.city = weatherData.city;
        this.weather.sevendays = weatherData.sevendays;
        this.weather.today = weatherData.today;
      } else {
        let _res = await Axios({
          method: 'get',
          url: window.MTI.weather.weatherUrl
        });
        if (_res.data) {
          this.weather.city = _res.city;
          this.weather.sevendays = _res.data;
          this.weather.today = _res.data ? _res.data[0] : null;

          let params = {
            weatherData: JSON.stringify(this.weather),
            cityId: window.MTI.weather.cityId
          };
          this.$api.System.saveWeatherData(params);
        }
      }
    },
    handleMsg() {
      this.msgList.length > 0 ? this.$emit('messageSwitch') : this.$notify({ message: '暂无消息', type: 'warning', duration: 2000 });
    },
    handleSelect(item) {
      this.$emit('select', item);
    },
    // curframe(name){
    //   return this.layout.iframes.find(item => item.name === name)
    // },
    handleCommand(command) {
      if (command == 'loginOut') {
        this.logOut('manual');
      } else if (command == 'password') {
        this.isShowChangepassword = true;
      } else if (command == 'message') {
        this.isShowMessageManage = true;
      } else if (command == 'subSystem') {
        this.isShowSubSystemManage = true;
      }
    },
    handleOnDuty() {
      let _path = this.ondutyFrame[`path${this.themes}`];
      this.$refs['singleFrame'].updateSrc(_path);
      this.isRTCBox = !this.isRTCBox;
    },
    handleWeather() {
      this.isShowWeather = !this.isShowWeather;
    },
    handleAddressBook() {
      if (this.curFrame == 'eum') {
        let _msg = {
          type: 'method',
          method: 'openMailList'
        };
        this.sendMessage('eum', JSON.stringify(_msg));
      } else {
        let _msg = {
          type: 'systemExchange',
          targetSystem: 'eum', //指向的需变化子系统的名称
          content: {
            size: ['calc(100% - 80px)', 'calc(100% - 70px)'], //尺寸
            offset: ['40px', '90px'], //位置
            title: '通讯录', //标题，不传则隐藏标题栏
            draggable: false, //是否允许拖动
            interactive: false, //是否允许背景交互
            path: '/mailList', //子系统指向的目标路由
            query: {}, //子系统指向的目标路由的传参
            callbackSystem: 'eum' //需要回调的自身子系统，不传关闭时无消息回调
          }
        };
        this.sendMessage('parent', JSON.stringify(_msg));
      }
    },
    handleOnDutyClose() {
      this.isRTCBox = false;
    },
    handleWeatherClose() {
      this.isShowWeather = false;
    },
    handleAddressBookClose() {
      this.isShowAddressBook = false;
    },
    handleMessageManageClose() {
      this.isShowMessageManage = false;
    },
    handleSubSystemClose() {
      this.isShowSubSystemManage = false;
    },
    closeCPW() {
      this.isShowChangepassword = false;
    },
    /** 拨号盘 */
    handleDial() {
      this.isShowDial = true;
    },
    sendMessage(frame, msg) {
      this.messenger.targets[frame].send(msg);
    }
  },
  beforeDestroy() {
    this.$bus.$off('rtcInvite');
    this.$bus.$off('meetingInvite');
    this.$bus.$off('uifSubSystemDialog');
    this.$bus.$off('uifMessageManageDialog');
    this.$bus.$on('logOut');
    this.$bus.$off('handleAddressBook');
    clearInterval(this.timmer);
    this.timmer = null;
    clearInterval(this.weather.timer);
    this.weather.timer = null;
  }
};
</script>
<style scoped lang="scss">
@import './../../static/style/css/topbar.scss';
</style>
