import Vue from 'vue';
import bus from '@/bus';
import store from '@/store';
import Router from 'vue-router';

Vue.use(Router)

//主界面
const Home = r => require(['@/views/home/home'], r)
//视频
const Video = r => require(['@/views/video/video'], r)

// 常量路由
export const constantRoutes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name:'home',
    component: Home
  },
  {
    path: '/video',
    name:'video',
    component: Video
  }
]
// 动态路由
const router = new Router({
  scrollBehavior:()=>({y:0}),
  routes:constantRoutes
})

Vue.mixin({
  beforeRouteEnter(to, from, next){
    next(vm => {
      bus.$on(`${to.path}pageRefresh`,() => {
        vm.refresh && vm.refresh()
      })
    })
  },
  beforeRouteLeave(to, from, next){
    bus.$off(`${from.path}pageRefresh`)
    next();
  }
})

// 路由监听
router.beforeEach((to, from, next) =>{
  let _theme =  to.query.theme;
  if (typeof(_wh) != "undefined"){
    if(store.state.ui.themes != _theme) store.commit('setThemes', _theme);
  }
  let _wh = to.query.wh;
  if (typeof(_wh) != "undefined"){
    if(store.state.ui.withHeader != _wh) store.commit('setWithHeader', _wh);
  }
  next()
})

export default router;