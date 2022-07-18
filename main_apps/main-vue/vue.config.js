const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  devServer:{
    host: '0.0.0.0',
    port: 9000,
    hot:'only',
  }
});
