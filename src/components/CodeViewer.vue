<template>
  <div :style="codeViewerStyle" class="code-viewer-container">
    <p class="possible-language">
      {{ possibleLanguage }}
    </p>
    <pre class="pre">
      <code ref="codeBlock" class="code">{{ textData }}</code>
      <el-icon
        ref="iconCopy"
        size="1.5em"
        class="icon-copy"
        title="点击复制"
        :data-clipboard-text="textData"
      >
        <document-copy />
      </el-icon>
    </pre>
  </div>
</template>

<script setup>
import {
  computed, getCurrentInstance, nextTick, onMounted, ref, toRefs, watchEffect,
} from 'vue';
import { ElIcon, ElMessage } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue';
import Clipboard from 'clipboard';

const props = defineProps({
  textData: {
    type: String,
    required: true,
  },
  subElementCount: {
    type: Number,
    required: true,
  },
});
const { textData, subElementCount } = toRefs(props);
const codeBlock = ref(null);
const iconCopy = ref(null);

const codeViewerStyle = computed(() => ({
  ...(subElementCount.value === 1 ? { maxWidth: '100%' } : {}),
  ...(subElementCount.value > 1 ? { overflowX: 'scroll' } : {}),
}));

const { proxy } = getCurrentInstance();
const possibleLanguage = computed(() => {
  const { language } = proxy.$hljs.highlightAuto(textData.value);
  return `最可能的编程语言：${language}`;
});

watchEffect(() => {
  nextTick(() => proxy.$hljs.highlightElement(codeBlock.value));
});

onMounted(() => {
  const clipboard = new Clipboard(iconCopy.value.$el);
  clipboard.on('success', () => {
    ElMessage.success(`复制成功。文本长度：${textData.value.length}`);
  });
  clipboard.on('error', (e) => {
    ElMessage.error('该浏览器不支持自动复制');
    console.error('该浏览器不支持自动复制', e);
  });
});
</script>

<style lang="less" scoped>
.code-viewer-container {
  flex: 1;

  .pre {
    position: relative;

    @code-padding: 16px;
    @copy-distance-to-right: 8px;
    @copy-distance-to-top: @code-padding + @copy-distance-to-right;
    .code {
      font-family: Consolas, Monaco, monospace;
    }
    .icon-copy {
      position: absolute;
      top: @copy-distance-to-top;
      right: @copy-distance-to-right;
      background-color: wheat;
      cursor: pointer;
    }
  }
}
</style>
