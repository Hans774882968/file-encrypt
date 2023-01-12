<template>
  <div class="code-block-container">
    <p class="possible-language">
      {{ possibleLanguage }}
    </p>
    <pre class="pre">
      <code ref="codeBlock" class="code">{{ textData }}</code>
      <el-icon size="1.5em" class="copy" title="点击复制"><document-copy /></el-icon>
    </pre>
  </div>
</template>

<script setup>
import {
  computed,
  getCurrentInstance, nextTick, ref, toRefs, watchEffect,
} from 'vue';
import { ElIcon } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue';

const props = defineProps({
  textData: {
    type: String,
    required: true,
  },
});
const { textData } = toRefs(props);
const codeBlock = ref(null);

const { proxy } = getCurrentInstance();
const possibleLanguage = computed(() => {
  const { language } = proxy.$hljs.highlightAuto(textData.value);
  return `最可能的编程语言：${language}`;
});

watchEffect(() => {
  nextTick(() => proxy.$hljs.highlightElement(codeBlock.value));
});
</script>

<style lang="less" scoped>
.code-block-container {
  width: 100%;

  .pre {
    position: relative;

    @code-padding: 16px;
    @copy-distance-to-right: 8px;
    @copy-distance-to-top: @code-padding + @copy-distance-to-right;
    .code {
      font-family: Consolas, Monaco, monospace;
    }
    .copy {
      position: absolute;
      top: @copy-distance-to-top;
      right: @copy-distance-to-right;
      background-color: wheat;
      cursor: pointer;
    }
  }
}
</style>
