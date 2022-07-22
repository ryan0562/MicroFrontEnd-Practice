<template>
  <div class="video-list">
    <div class="header">
      <span class="line"></span>
      <label>视频人员列表</label>
      <!-- <i class="iconfont" :class="show ? 'icon-turnoff':' el-icon-close'" @click="handleClose"></i> -->
    </div>
    <ul class="list">
      <li v-for="(item,index) in data" :key="index">
        <span class="iconfont icon-person"></span>
        <span class="name">{{item.name}}{{item.dutyName ? `（${item.dutyName}）` : ''}}</span>
        <span class="part ellipsis">{{item.department}}</span>
        <i class="el-icon-remove" @click="handleDel(index)" v-if="!show"></i>
        <i class="iconfont icon-voice" v-if="show"></i>
        <i class="iconfont icon-meike" v-if="show"></i>
      </li>
    </ul>
    <!-- <div class="option" v-if="!show">
      <i class="iconfont icon-playvideo" @click="handlePlay"></i>
      <p>发起视频会议</p>
    </div> -->
  </div>
</template>
<script>
export default {
  props: ['data','show'],
  data(){
    return{
      isPlay: false,
    }
  },
  created(){

  },
  methods:{
    // 发起视频
    handlePlay(){
      this.$parent.showVideo = true;
    },
    // 删除
    handleDel(index){
      this.$emit('del', index);
    },
  }
}
</script>
<style lang="scss" scoped>
.video-list{
  width: 510px;
  height: 100%;
  display: flex;
  border: 1px solid;
  border-left: none;
  flex-direction: column;
  @include mixin(border-color, ($color-d) ($dark-2));
  .header{
    width: 100%;
    padding: 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid;
    @include mixin(color, ($color-3) ($secondary-3));
    @include mixin(border-color, ($color-d) ($dark-2));
    position: relative;
    .line{
      width: 4px;
      height: 20px;
      margin-right: 10px;
      @include mixin(background-color, ($primary) ($secondary-3));
    }
    label{
      font-size: 20px;
      font-weight: 500;
      line-height: 20px;
    }
    i{
      font-size: 20px;
      @include mixin(color, ($color-3) ($white));
      position: absolute;
      right: 20px;
      cursor: pointer;
      &.icon-turnoff{
        @include mixin(color, ($danger) ($danger));
      }
    }
  }
  .list{
    flex: 1;
    width: 100%;
    padding: 10px;
    overflow: hidden;
    overflow-y: auto;
    li{
      height: 36px;
      display: flex;
      padding: 0px 10px;
      align-items: center;
      @include mixin(color, ($color-3) ($white));
      position: relative;
      overflow: hidden;
      span{
        line-height: 18px;
        &.part{
          max-width: 50%;
        }
        &.iconfont{
          font-size: 22px;
          margin-right: 8px;
          @include mixin(color, ($primary) ($dark-1));
        }
      }
      i{
        font-size: 20px;
        @include mixin(color, ($color-6) ($dark-2));
        position: absolute;
        top: 6px;
        right: 8px;
        cursor: pointer;
        &.icon-voice{
          right: 35px;
        }
        &.icon-meike{
          font-size: 22px;
        }
        &.el-icon-remove{
          top: 6px;
          font-size: 24px;
          @include mixin(color, ($danger) ($danger));
          display: none;
        }
      }
      &:hover{
        @include mixin(background-color, ($color-e) ($dark-5));
        i.el-icon-remove{
          display: block;
        }
      }
    }
  }
  .option{
    text-align: center;
    padding: 30px 20px;
    p{
      font-size: 14px;
      margin-top: 10px;
      @include mixin(color, ($color-9) ($color-db));
    }
    i{
      font-size: 55px;
      @include mixin(color, ($primary) ($dark-1));
      &.icon-hangUp{
        @include mixin(color, ($danger) ($danger));
      }
    }
  }
}
</style>
