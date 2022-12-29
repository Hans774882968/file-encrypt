<template>
  <div>
    <video
      ref="videoPlayer"
      class="video-js"
      muted
    />
  </div>
</template>

<script setup>
import videojs from 'video.js';
import {
  computed, onBeforeUnmount, onMounted, ref, toRefs,
} from 'vue';

const props = defineProps({
  videoData: {
    type: String,
    required: true,
  },
});
const { videoData } = toRefs(props);

const player = ref(null);
const videoPlayer = ref(null);

const options = computed(() => ({
  autoplay: true,
  controls: true,
  sources: [
    {
      src: videoData.value,
      type: 'video/mp4',
    },
  ],
}));

onMounted(() => {
  player.value = videojs(videoPlayer.value, options.value, () => {
    player.value.log('onPlayerReady', options.value);
  });
});

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose();
  }
});
</script>

<script>
export default {
  name: 'VideoPlayer',
};
</script>
