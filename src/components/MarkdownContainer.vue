<template>
  <div
    ref="markdownContainer"
    :style="markdownContainerStyle"
    class="markdown-container"
    v-html="htmlCode"
  />
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  ref, toRefs,
} from 'vue';

const props = defineProps({
  htmlCode: {
    type: String,
    required: true,
  },
  subElementCount: {
    type: Number,
    required: true,
  },
});
const { htmlCode, subElementCount } = toRefs(props);
const markdownContainer = ref(null);

const markdownContainerStyle = computed(() => ({
  ...(subElementCount.value === 1 ? { maxWidth: '100%' } : {}),
  ...(subElementCount.value > 1 ? { overflowX: 'scroll' } : {}),
}));

const { proxy } = getCurrentInstance();
nextTick(() => {
  const codeElements = markdownContainer.value.querySelectorAll('pre code');
  codeElements.forEach((codeElement) => proxy.$hljs.highlightElement(codeElement));
});
</script>

<style lang="less" scoped>
.markdown-container {
  flex: 1;
}
:deep(pre code) {
  font-family: Consolas, Monaco, monospace;
}
</style>
