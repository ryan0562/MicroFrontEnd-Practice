
<template>
  <ul class="nav-menu">
    <li v-for="(item,index) in data" :key="index" :class="{'cur':cur.indexOf(item.id) != -1}" @click.stop="handleSelect(item)">
      <span>{{ item.name }}</span>
      <nav-menu v-if="item.children && item.children.length > 0" :data="item.children" :cur="cur" @select="handleSelect"></nav-menu>
    </li>
  </ul>
</template>
<script>
// import navMenu from './navMenu'
export default {
  name:'navMenu',
	props:['data', 'cur'],
  data () {
    return {

    }
  },
  computed: {

  },
  filters:{

  },
  watch:{
    // cur:{
    //   handler(newVal,oldVal){
    //
    //     console.log(newVal)
    //     }
    // },
  },
  created(){

  },
  mounted() {

  },
  methods: {
    handleSelect(item){
      this.$emit('select', item)
    }
  },
}
</script>
<style lang="scss" scoped>
ul{
  position: absolute;
  left:120px;
  top:0;
  display: none;
  z-index:99999;
  padding-left:10px;
  li{
    box-shadow: 0px 10px 10px 0px rgba(123,123,123,0.3);
    position: relative;
    text-align: left;
    width: 120px;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    border-right: 1px;
    border-left: 1px;
    border-left-style: solid;
    border-right-style: solid;
    // @include mixin(background-color, ($white) ($nav-bg-dark));
    // @include mixin(color, ($text-primary) ($white));
    @include mixin(background-color, ($state-9) ($bg-highlight-dark));
    @include mixin(color, ($state-7) ($text-primary));
    @include mixin(border-color, ($transparent) ($nav-br-dark));
    text-indent: 14px;
    &.cur{
      @include mixin(background-color, ($bg-highlight) ($bg-highlight-dark));
      @include mixin(color, ($white) ($white));
    }
    &:first-child{
      border-radius: 3px 3px 0 0;
      border-top: 1px;
      border-top-style: solid;
      @include mixin(border-color, ($transparent) ($nav-br-dark));
    }
    &:last-child{
      border-radius: 0 0 3px 3px;
      border-bottom: 1px;
      border-bottom-style: solid;
      @include mixin(border-color, ($transparent) ($nav-br-dark));
      background-color: none;
    }
    &:hover{
      // @include mixin(background-color, ($bg-highlight) ($bg-highlight-dark));
      @include mixin(background-color, ($state-8) ($bg-highlight-dark));
      @include mixin(color, ($white) ($white));
      > ul{
        display: block;
      }
    }
    span{
      display: block;
      width: 100%;
      height: 100%;
      font-size:16px;
      overflow: hidden;
    }
  }
}
</style>
