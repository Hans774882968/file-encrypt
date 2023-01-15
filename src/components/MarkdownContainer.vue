<template>
  <div
    ref="markdownContainer"
    class="markdown-container"
    v-html="htmlCode"
  />
</template>

<script setup>
import {
  getCurrentInstance,
  nextTick,
  ref, toRefs,
} from 'vue';

const props = defineProps({
  htmlCode: {
    type: String,
    required: true,
  },
});
const { htmlCode } = toRefs(props);

const markdownContainer = ref(null);

const { proxy } = getCurrentInstance();
nextTick(() => {
  const codeElements = [];
  function dfs(element) {
    if (element.tagName.toLowerCase() === 'pre'
      && element.children.length
      && element.children[0].tagName.toLowerCase() === 'code') {
      codeElements.push(element.children[0]);
      return;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const ch of element.children) {
      dfs(ch);
    }
  }
  dfs(markdownContainer.value);
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
