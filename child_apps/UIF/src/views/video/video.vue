<template>
  <div class="container">
    <LivePlayer
      :video-url="videoUrl"
      :video-title="videoTitle"
      loading
      live
      autoplay
      fluent
      stretch
      alt="暂无信号"
    ></LivePlayer>
  </div>
</template>

<script>
import LivePlayer from "@liveqing/liveplayer";
export default {
  components: {
    LivePlayer,
  },
  data() {
    return {
      videoUrl: "",
      videoTitle: "",
    };
  },
  created() {
    let { httpUrl, name } = this.$route.query;
    this.videoUrl = httpUrl;
    this.videoTitle = name;
  },
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
