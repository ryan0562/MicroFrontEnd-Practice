<template>
  <div class="iframe-title iconfont" v-drag="option.draggable" :class="{'hide':!title}">
    <span>{{ option.title }}</span>
    <i class="el-icon-close" @click.stop="$emit('close')"></i>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex"
export default {
  props:['option', 'title', 'draggable'],
  data() {
    return {
      isDrag:true
    }
  },
  filters: {


  },
  computed: {
    ...mapState({
      messenger:state => state.messenger.messenger,
    }),
  },
  created(){


  },
  methods:{


  },
  beforeDestroy(){

  }
};
</script>
<style lang="scss" scoped>
.iframe-title {
  position: absolute;
  left: 0;
  top:0;
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-indent: 20px;
  font-size: 18px;
  padding-right: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @include mixin(color, ($white) ($white));
  @include mixin(background-color, (#053040) ($primary-dark));
  z-index: 1;
  &.hide{
    height: 30px;
    position: absolute;
    overflow: visible;
    text-overflow:clip;
    white-space:normal;
    @include mixin(background-color, (rgba(0,0,0,0)) (rgba(0,0,0,0)));
    &:hover{
      @include mixin(background-color, (rgba(0,0,0,.1)) (rgba(0,0,0,.1)));
      &:before {
        position: absolute;
        left: 50%;
        top:-5px;
        margin-left: -9px;
        content: "\e6d6";
      }
    }
    i{
      width: 30px;
      height: 30px;
      display: block;
      line-height: 30px;
      right:-10px;
      top:-10px;
      border-radius: 50%;
      @include mixin(background-color, ($primary) ($primary-dark));
      &::before{
        position: absolute;
        left: -4px;
      }
    }
  }
  i{
    line-height: 50px;
    position: absolute;
    top: 0;
    right: 20px;
    cursor: pointer;
    @include mixin(color, ($white) ($white));
  }
}
</style>
