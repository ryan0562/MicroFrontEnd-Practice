const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  devServer: {
    // headers: {
    //   "X-Frame-Options": "ALLOWALL",
    // },
    host: "0.0.0.0",
    // host: "local.mti-sh.cn",
    port: 9000,
  },
});
