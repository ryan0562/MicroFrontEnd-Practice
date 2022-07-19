import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    // 👇 非严格匹配，/child-vue/* 都指向 MyPage 页面
    path: "/child-vue/:page*", // vue-router@4.x path的写法为：'/child-vue/:page*'
    name: "child-vue",
    component: () => import("@/components/ChildComponents.vue"),
    props() {
      return {
        url: "http://localhost:10001/",
        name: "child-vue",
        baseroute: "/child-vue/",
      };
    },
  },
  {
    path: "/yjzch/:page*",
    name: "yjzch",
    component: () => import("@/components/ChildComponents.vue"),
    props: {
      url: "http://yjzch.mti-sh.cn/",
      name: "yjzch",
      baseroute: "/yjzch/",
    },
  },
  {
    path: "/baidu/:page*",
    name: "baidu",
    component: () => import("@/components/ChildComponents.vue"),
    props() {
      return {
        url: "http://www.baidu.com/",
        name: "baidu",
        baseroute: "/baidu/",
      };
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
