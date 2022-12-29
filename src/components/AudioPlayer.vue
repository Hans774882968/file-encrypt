<template>
  <div>
    <audio controls muted>
      <source :src="audioData">
    </audio>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';

const props = defineProps({
  audioData: {
    type: String,
    required: true,
  },
});
const { audioData } = toRefs(props);
</script>

<script>
export default {
  name: 'AudioPlayer',
};
</script>
