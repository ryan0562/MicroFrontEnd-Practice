<template>
  <div class="video-box" >
    <div class="body" :class="{'has': hasPadding}">
      <div class="header">
        <span class="title">
          <i class="iconfont icon-video"></i>
          视频会议
        </span>
        <span class="right-icon">
          <i class="iconfont icon-videos-narrow" :class="{'reset':mini}" @click="handleNarrow" title="最小化"></i>
          <i v-if="!mini"  class="iconfont icon-videos-fullscreen" @click="handleFullscreen" title="全屏"></i>
        </span>
      </div>
      <div class="content">
        <ul class="windows">
          <li v-for="(item,index) in videoList" :key="index">
            <div class="tips">
              <span class="name">{{item.name}}</span>
              <p>
                {{item.department}}
                <span class="icons">
                  <i class="iconfont icon-voice"></i>
                  <i class="iconfont icon-meike"></i>
                </span>
              </p>
            </div>
          </li>
        </ul>
        <div v-if="!mini" class="option">
          <span @click="handleMeike">
            <i class="iconfont icon-meike">麦克风</i>
          </span>
          <span @click="handleVoice">
            <i class="iconfont icon-voice">声音</i>
          </span>
          <span @click="invitation">
            <i class="iconfont icon-addperson">邀请</i>
          </span>
          <span class="set-out" @click="tipDialog = true">退出会议</span>
        </div>
      </div>
    </div>

    <!-- 邀请加入弹框 -->
    <el-dialog
      top="0"
      width="450px"
      title="邀请加入"
      custom-class="addDialog"
      :visible.sync="addDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div class="dialog-body">
        <div class="content">
          <el-input size="small" v-model.trim="keyword" placeholder="请输入搜索内容" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
          <ul class="list">
            <li></li>
          </ul>
        </div>
        <div class="footer">
          <span @click="addDialog = false">关闭</span>
        </div>
      </div>
    </el-dialog>

    <!-- 提示弹框 -->
    <el-dialog
      top="0"
      title="提示"
      width="400px"
      custom-class="tipDialog"
      :visible.sync="tipDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div class="dialog-body">
        <div class="content">请确认您的操作</div>
        <div class="footer">
          <span @click="tipDialog = false">取消</span>
          <span class="close" @click="handleClose">结束会议</span>
          <!-- <span class="out" @click="handleOut">离开会议</span> -->
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
  props:{
    mini:{
      type: Boolean,
      default: false,
    },
    scene:{
      type: Number,
      default: 1,
    },
    hasPadding:{
      type: Boolean,
      default: false,
    }
  },
  data(){
    return{
      times: '',
      keyword: '',
      addDialog: false,
      tipDialog: false,
      videoList: [
        {
          id: 1,
          name: '管理员（局长）',
          department: '武汉市应急值班员-13819005860'
        },
        {
          id: 2,
          name: '杨仲（局长）',
          department: '武汉市应急值班员-13819005860'
        },
        {
          id: 3,
          name: '测试（局长）',
          department: '武汉市应急值班员-13819005860'
        },
        {
          id: 4,
          name: '许向祁（局长）',
          department: '武汉市应急值班员-13819005860'
        }
      ]
    }
  },
  methods:{
    ...mapMutations(['setShowVTip']),
    // 最小化
    handleNarrow(){
      this.$emit('mn')
    },
    // 最大化
    handleFullscreen(){
      this.$emit('fs')
    },
    // 点击-麦克风
    handleMeike(){

    },
    // 点击声音
    handleVoice(){

    },
    // 邀请
    invitation(){
      this.addDialog = true;
    },
    // 结束会议
    handleClose(){
      this.$emit('close');
    },
    // 离开会议
    handleOut(){

    }
  }
}
</script>
<style lang="scss" scoped>
.video-box{
  flex: 1;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  .body{
    width: 100%;
    height: 100%;
    &.has{
      padding: 10px;
      padding-top: 70px;
    }
    .header{
      width: 100%;
      height: 52px;
      font-size: 20px;
      padding: 0px 20px;
      line-height: 52px;
      @include mixin(color, ($color-3) ($white));
      @include mixin(background-color, ($color-d) ($dark-2));
      i{
        font-size: 18px;
        margin-right: 10px;
        @include mixin(color, ($primary) ($secondary-3));
      }
      .right-icon{
        float: right;
        i{
          cursor: pointer;
          display: inline-block;
          font-size: 20px;
          &.reset{
            transform: rotateX(180deg);
          }
        }
      }
    }
    .content{
      width: 100%;
      padding: 20px;
      padding-bottom: 0px;
      height: calc(100% - 52px);
      @include mixin(background-color, ($color-db) ($dark-5));
      .windows{
        width: 100%;
        display: grid;
        height: calc(100% - 60px);
        grid-template-rows: repeat(2, 1fr);
        grid-template-columns: repeat(2, 1fr);
        grid-auto-flow: row;
        grid-gap: 5px;
        li{
          @include mixin(background-color, ($black) ($black));
          position: relative;
          .tips{
            width: 100%;
            height: 40px;
            display: none;
            padding: 0px 15px;
            background-color: rgba(255,255,255, 0);
            position: absolute;
            left: 0px;
            bottom: 0px;
            span.name{
              font-size: 12px;
              line-height: 18px;
              @include mixin(color, ($white) ($black));
            }
            p{
              font-size: 12px;
              @include mixin(color, ($white) ($white));
              .icons{
                float: right;
                i{
                  @include mixin(color, ($color-d) ($color-d));
                }
              }
            }
          }
          &:hover .tips{
            display: block;
          }
        }
      }
      .option{
        width: 100%;
        height: 60px;
        line-height: 60px;
        text-align: center;
        position: relative;
        span{
          width: 100px;
          height: 32px;
          margin: 0px 10px;
          line-height: 32px;
          border-radius: 18px;
          display: inline-block;
          @include mixin(background-color, ($color-d) ($dark-2));
          cursor: pointer;
          &.set-out{
            @include mixin(color, ($white) ($white));
            @include mixin(background-color, ($danger) ($danger));
            position: absolute;
            top: 12px;
            right: 0px;
          }
          i{
            @include mixin(color, ($color-3) ($white));
          }
        }
      }
    }
  }
}
.addDialog{
  overflow: hidden;
  .content{
    width: 100%;
    height: 330px;
    .list{
      width: 100%;
      margin: 20px 0px;
      height: calc(100% - 80px);
      li{
        width: 100%;
        height: 36px;
        font-size: 16px;
        line-height: 36px;
        padding: 0px 10px;
        @include mixin(color, ($color-3) ($white));
      }
    }
  }
  .footer{
    width: 100%;
    text-align: center;
    span{
      width: 90px;
      height: 36px;
      font-size: 15px;
      margin: 0px 10px;
      line-height: 36px;
      border-radius: 3px;
      display: inline-block;
      @include mixin(color, ($color-3) ($white));
      @include mixin(background-color, ($color-d) ($dark-2));
      cursor: pointer;
    }
  }
}
.tipDialog{
  overflow: hidden;
  .content{
    font-size: 20px;
    font-weight: 500;
    margin: 30px 0px;
    text-align: center;
    @include mixin(color, ($color-3) ($white));
  }
  .footer{
    width: 100%;
    text-align: center;
    span{
      width: 90px;
      height: 36px;
      font-size: 15px;
      margin: 0px 10px;
      line-height: 36px;
      border-radius: 3px;
      display: inline-block;
      @include mixin(color, ($color-3) ($white));
      @include mixin(background-color, ($color-d) ($dark-2));
      cursor: pointer;
      &.close{
        @include mixin(color, ($white) ($white));
        @include mixin(background-color, ($danger) ($danger));
      }
      &.out{
        @include mixin(color, ($white) ($white));
        @include mixin(background-color, ($primary) ($dark-1));
      }
    }
  }
}
</style>
