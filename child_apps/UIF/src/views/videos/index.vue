<template>
  <div class="videos" :class="[{'mini':mini},{'fullscreen':fullscreen}]">
    <videoBox v-show="!(mini && !isShowBox)" :mini="mini" @fs="fs" @mn="mn" @close="close"/>
    <videoList :data="data" />
    <div class="mini-videos" :class="{'hasclick':hasclick}" @click="handleMiniVideos">
      <i class="iconfont icon-videos-mini" />
      <span>00:00:00</span>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex';
import videoBox from './compts/videoBox.vue';
import videoList from './compts/videoList.vue';

export default {
  props:['data'],
  components:{
    videoBox,
    videoList,
  },
  data() {
    return {
      fullscreen:false,
      mini:false,
      isShowBox:false,
      hasclick:true,
    };
  },
  computed:{

  },
  created(){
  },
  mounted() {
  },
  methods: {
    fs(){
      this.fullscreen = !this.fullscreen
    },
    mn(){
      if(this.mini) this.isShowBox = false
      this.mini = !this.mini
    },
    handleMiniVideos(){
      this.isShowBox = !this.isShowBox
    },
    close(){
      this.$emit('close')
    }
  },
}
</script>
<style lang="scss" scoped>
.videos{
  position: absolute;
  left: 20px;
  right: 20px;
  top:70px;
  bottom:20px;
  @include mixin(background-color, ($white) ($dark-6));
  display: flex;
  overflow: visible;
  &.fullscreen{
    .video-list{
      display: none;
    }
  }
  &.mini{
    left: calc(100% - 100px);
    bottom: calc(100% - 150px);
    .mini-videos{
      width: 100%;
      height: 100%;
      display: block;
    }
    .video-list{
      display: none;
    }
    .video-box{
      position: absolute;
      left:-420px;
      top:0;
      width: 400px;
      height: 280px;
    }
  }
  .mini-videos{
    box-shadow: -1px 0px 8px 0px rgba(82,82,82,.25);
    display: none;
    width: 70px;
    height: 70px;
    padding: 10px;
    text-align: center;
    @include mixin(background-color, ($white) ($dark-6));
    @include mixin(color, ($primary) ($secondary-3));
    &.hasclick{
      cursor: pointer;
    }
    i{
        font-size: 32px;
    }
    span{
      line-height: 30px;
      font-size: 14px;
      display: block;
    }
  }
}
</style>
