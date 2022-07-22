<template>
 <div class="dialog" v-drag>
    <div class="body">
      <i class="el-icon-close" @click="close"></i>
      <p class="ellipsis">
        <!-- {{numbers}} -->
        <el-input v-model="numbers" ref="dial" @keyup.native="check"></el-input>
      </p>
      <ul>
        <li v-for="(item,index) in list" @click="handleLi(item)" @mousedown.stop :key="index">{{item}}</li>
      </ul>
      <div class="option">
        <i class="iconfont icon-call" @click="handleCall" @mousedown.stop></i>
        <i class="iconfont icon-clear" v-if="numbers.length > 0" @click="handleClear" @mousedown.stop></i>
      </div>
    </div>
  </div>
</template>
<script>
import { mapMutations } from 'vuex'
import API from './package/api'
export default {
  data(){
    return{
      numbers: '',
      visible: true,
      soundPlayer: null,
      list: [7,8,9,4,5,6,1,2,3,'*',0,'#']
    }
  },
  directives: {
    drag(el) {
      el.onmousedown = function(e) {
        let elp = el
        var disy = e.pageY - elp.offsetTop
        var disx = e.pageX - elp.offsetLeft
        document.onmousemove = function(e) {
          elp.style.top = (e.pageY - disy) + 'px'
          elp.style.left = (e.pageX - disx) + 'px'
        }
        document.onmouseup = function() {
          document.onmousemove = document.onmouseup = null
        }
      }
    }
  },
  created(){},
  mounted(){
    this.$refs['dial'].focus();
    //创建Audio对象
		this.soundPlayer = new Audio();
		//设置音量
		this.soundPlayer.volume = 1;
  },
  methods:{
    ...mapMutations(['CALL']),
    handleLi(item){
      let soundFile = item;
      this.numbers = this.numbers + '' + item;
      if(item == '#') soundFile = "pound";
      if(item == '*') soundFile = "asterisk";
			//设置src文件路径
      this.soundPlayer.src = `/static/audio/dialpad/${soundFile}.ogg`; //默认声音文件
			this.soundPlayer.play();
      this.$refs['dial'].focus();
    },
    // 拨号
    handleCall(){
      /** 查询电话号码对应的人员 */
      API.getPersonByPhone({phones: [this.numbers]}).then(res => {
        let person = res[0] || {number: this.numbers, personName: this.numbers}
        person.type = 2
        this.CALL([person])
        this.close()
      })
    },
    // 清除
    handleClear(){
      let len = this.numbers.length
      this.numbers = this.numbers.substring(0, len-1)
      this.$refs['dial'].focus()
    },
    // 禁止输入中午和英文
    check(){
      this.numbers = this.numbers.replace(/[^\d]/g,'')
    },
    // 关闭
    close(){
      this.$emit('close', 'dial')
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog{
  width: 360px;
  position: absolute;
  top: 186px;
  left: 50%;
  z-index: 10000;
  transform: translate(-50%, -0%);
  @include mixin(background-image, ($page-bg) ($page-bg-dark));
  overflow: hidden;
  .body{
    width: 100%;
    padding: 20px;
    border: 1px solid;
    border-radius: 5px;
    @include mixin(border-color, ($color-d) ($dark-2));
    position: relative;
    i{
      font-size: 24px;
      cursor: pointer;
      @include mixin(color, ($color-3) ($white));
      position: absolute;
      top: 5px;
      right: 5px;
    }
    p{
      width: 100%;
      height: 50px;
      font-size: 28px;
      line-height: 50px;
      text-align: center;
      @include mixin(color, ($color-3) ($white));
      margin-top: 5px;
       .el-input__inner {
        color: #333;
        text-align: center;
        font-size: 28px !important;
      }
    }
    ul{
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      overflow: hidden;
      li{
        width: 60px;
        height: 60px;
        display: flex;
        font-size: 28px;
        margin: 10px 15px;
        border-radius: 50%;
        align-items: center;
        justify-content: center;
        @include mixin(color, ($color-3) ($white));
        @include mixin(background-color, ($color-e) ($dark-5));
        cursor: pointer;
        &:hover{
          @include mixin(border-color, ($color-d) ($dark-2));
        }
      }
    }
    .option{
      width: 100%;
      height: 58px;
      margin-top: 20px;
      line-height: 58px;
      text-align: center;
      position: relative;
      i{
        font-size: 55px;
        vertical-align: middle;
        @include mixin(color, ($primary) ($dark-1));
        position: static;
        &.icon-clear{
          font-size: 42px;
          margin-left: 15px;
          @include mixin(color, ($color-c) ($dark-2));
          position: absolute;
          width: 50px;
          top: 0px;
          left: 60%;
          transform: translate(-10%);
        }
        &.icon-hangup{
          @include mixin(color, ($danger) ($danger));
        }
      }
    }
  }
}
</style>