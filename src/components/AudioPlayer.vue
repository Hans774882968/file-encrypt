<template>
  <div>
    <audio controls muted>
      <source :src="audioData">
    </audio>
  </div>
</template>

<script>
export default {
  name: 'AudioPlayer',
  props: {
    audioData: {
      type: String,
      required: true,
    },
  },
};
</script>
