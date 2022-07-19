<template>
  <micro-app :name="name" :url="url" v-bind="$attrs"></micro-app>
</template>

<script>
export default {
  name: "ChildComponents",
  props: {
    // name(必传)：应用名称
    name: {
      type: String,
      required: true,
    },
    // url(必传)：应用地址，会被自动补全为http://localhost:3000/index.html
    url: {
      type: String,
      required: true,
    },
  },
};
</script>

<style></style>
