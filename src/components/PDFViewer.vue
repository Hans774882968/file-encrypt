<template>
  <div class="pdf-viewer-container">
    <div class="pdf-viewer-header">
      <template v-if="isLoading">
        <div class="loading" />
      </template>
      <template v-else>
        <span v-if="showAllPages">
          {{ pageCount }} 页
        </span>
        <span v-else>
          <button :disabled="currentPage <= 1" @click="currentPage--">❮</button>
          {{ currentPage }} / {{ pageCount }}
          <button :disabled="currentPage >= pageCount" @click="currentPage++">❯</button>
        </span>

        <label for="show-all-pages" class="show-all-pages">
          <input v-model="showAllPages" class="checkbox" type="checkbox">
          展示每一页
        </label>
      </template>
    </div>

    <div class="pdf-viewer-content">
      <pdf-js-embed
        :pdf-data="pdfData"
        :render-pages="currentRenderPage"
        :width="pdfWidth"
        :pdf-page-container-style="pdfPageContainerStyle"
        @progress="handleDocumentLoadStart"
        @load-failed="handleDocumentLoadFailed"
        @render-page-failed="handleDocumentRenderPageFailed"
        @rendered="handleDocumentRendered"
      />
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import {
  toRefs, ref, computed,
} from 'vue';
import PdfJsEmbed from './pdf-js-vue3-embed/PDFJSEmbed.vue';

const props = defineProps({
  pdfData: {
    type: String,
    required: true,
  },
});
const { pdfData } = toRefs(props);

const isLoading = ref(true);
const pageCount = ref(1);
const currentPage = ref(1);
const showAllPages = ref(false);
const pdfWidth = ref(1600);
const pdfPageContainerStyle = ref({
  marginBottom: '16px',
  boxShadow: '0 2px 8px 4px rgba(0, 0, 0, 0.1)',
});
const pdfStringsOfAllPages = ref([]);

const currentRenderPage = computed(() => (showAllPages.value ? null : currentPage.value));

function getPDFStringsOfAllPages(pdfDocument) {
  return Promise.all(Array(pdfDocument.numPages).fill(0).map(async (_, i) => {
    const page = await pdfDocument.getPage(i + 1);
    const { items = [] } = await page.getTextContent();
    return items.map((item) => item.str);
  }));
}

function pdfPagesThatHaveStr(str) {
  return Array(pageCount.value).fill(0).map((_, i) => i + 1).filter(
    (_, i) => pdfStringsOfAllPages.value[i].some((pdfOnePageStr) => pdfOnePageStr.includes(str)),
  );
}

function handleDocumentLoadStart() {
  isLoading.value = true;
}

function handleDocumentLoadFailed(e) {
  console.error('pdf加载失败', e);
  ElMessage.error('pdf加载失败');
}

function handleDocumentRenderPageFailed(e, pageNum) {
  console.error(`pdf第${pageNum}页加载失败`, e);
  ElMessage.error(`pdf第${pageNum}页加载失败`);
}

async function handleDocumentRendered(pdfDocument) {
  isLoading.value = false;
  pageCount.value = pdfDocument.numPages;
  pdfStringsOfAllPages.value = await getPDFStringsOfAllPages(pdfDocument);
  console.log(pdfPagesThatHaveStr('疼痛'));// dbg
}
</script>

<style lang="less" scoped>
.loading {
  background: url('../assets/icon-loading.svg') no-repeat 50% 50%;
  width: 30px;
  height: 30px;
  animation: rotate 2s linear infinite;
}

@pdf-viewer-padding-vertical: 16px;

.pdf-viewer-header {
  padding: @pdf-viewer-padding-vertical;
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
  background-color: #555;
  color: #ddd;
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .show-all-pages {
    cursor: pointer;

    .checkbox {
      cursor: pointer;
    }
  }
}
.pdf-viewer-content {
  padding: 24px @pdf-viewer-padding-vertical;
  background-color: #ccc;
}
</style>
