<template>
  <div class="text-viewer-container">
    <code-viewer :text-data="textData" :sub-element-count="subElementCount" />
    <markdown-container v-if="markdownHTMLCode" :html-code="markdownHTMLCode" :sub-element-count="subElementCount" />
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue';
import { marked } from 'marked';
import * as DOMPurify from 'dompurify';
import CodeViewer from './CodeViewer.vue';
import MarkdownContainer from './MarkdownContainer.vue';

const props = defineProps({
  textData: {
    type: String,
    required: true,
  },
});
const { textData } = toRefs(props);
const markdownHTMLCode = ref('');
const subElementCount = ref(1);

function parseMarkdown() {
  try {
    const unsafeMarkdownHTMLCode = marked.parse(textData.value);
    return DOMPurify.sanitize(unsafeMarkdownHTMLCode);
  } catch (e) {
    return '';
  }
}
markdownHTMLCode.value = parseMarkdown();
subElementCount.value = markdownHTMLCode.value ? 2 : 1;
</script>

<style lang="less" scoped>
.text-viewer-container {
  width: 100%;
  display: flex;
  column-gap: 30px;
}
</style>
