<template>
  <div id="app">
    <h3>我这里是vue2的子系统</h3>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  created() {
    var c = 2;
    window.a = 1;
    window.rawWindow.b = 2;
    console.log(window.a);
    console.log(window.rawWindow);
    console.log(window.c, window.rawWindow.c, c);
  },
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
