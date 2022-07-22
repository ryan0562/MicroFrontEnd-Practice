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
    path: "/UIF/:page*",
    name: "UIF",
    component: () => import("@/components/ChildComponents.vue"),
    props: {
      url: "http://localhost:8888/",
      name: "UIF",
      baseroute: "/UIF/",
      disableSandbox: true,
      // shadowDOM: true,
      inline: true,
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
  {
    path: "/react17/:page*",
    name: "react17",
    component: () => import("@/components/ChildComponents.vue"),
    props() {
      return {
        url: "http://www.micro-zoe.com/child/react17/",
        name: "react17",
        baseroute: "/react17/",
      };
    },
  },
  {
    path: "/SDF/:page*",
    name: "SDF",
    component: () => import("@/components/ChildComponents.vue"),
    props() {
      return {
        url: "http://10.168.4.210/",
        name: "SDF",
        baseroute: "/SDF/",
        class: "child_SDF",
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
