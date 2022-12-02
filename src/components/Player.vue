<template>
  <div>
    <video ref="videoPlayer" class="video-js" muted></video>
  </div>
</template>

<script>
import videojs from 'video.js';

export default {
  name: 'Player',
  props: {
    videoData: {
      type: String,
    },
  },
  data() {
    return {
      player: null,
    };
  },
  computed: {
    options() {
      return {
        autoplay: true,
        controls: true,
        sources: [
          {
            src: this.videoData,
            type: 'video/mp4',
          },
        ],
      };
    },
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.options, () => {
      this.player.log('onPlayerReady', this);
    });
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>
