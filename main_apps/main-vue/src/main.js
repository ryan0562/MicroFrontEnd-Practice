import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

import microApp from "@micro-zoe/micro-app";
microApp.start({
  plugins: {
    modules: {
      "child-vue": [
        {
          loader(code, url) {
            code = code.replace("var xx_dll=", "window.xx_dll=");
            return code;
          },
        },
      ],
    },
  },
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
