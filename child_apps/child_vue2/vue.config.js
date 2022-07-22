const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    host: "0.0.0.0",
    port: "10000",
  },
});
