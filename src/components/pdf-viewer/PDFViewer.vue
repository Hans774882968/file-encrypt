<template>
  <div class="pdf-viewer-container">
    <div class="pdf-viewer-header">
      <template v-if="isLoading">
        <div class="loading" />
      </template>
      <template v-else>
        <el-row class="pdf-viewer-header-basic">
          <span v-if="shouldShowAllPages">
            共 {{ pageCount }} 页
          </span>
          <span v-if="shouldShowOnePage">
            <button class="last-page-btn" :disabled="currentPage <= 1" @click="currentPage--">❮</button>
            <span class="current-page">
              {{ currentPage }}
            </span>
            /
            <span class="page-count">
              {{ pageCount }}
            </span>
            <button class="next-page-btn" :disabled="currentPage >= pageCount" @click="currentPage++">❯</button>
          </span>

          <el-input-number
            v-if="shouldShowOnePage"
            v-model="currentInputPageNumber"
            :min="1"
            :max="pageCount"
            :step="1"
            :precision="0"
            @keyup.enter="changeCurrentPage"
          />

          <label v-if="!shouldShowSearchResultPages" for="show-all-pages" class="show-all-pages">
            <input
              v-model="shouldShowAllPagesModel"
              class="checkbox"
              type="checkbox"
            >
            展示每一页
          </label>
        </el-row>

        <el-row class="pdf-viewer-header-search">
          <el-input
            v-model="currentSearchKeyword"
            class="keyword-input"
            placeholder="搜索"
            :clearable="true"
            @keyup.enter="searchTextInPDF"
          />
          <el-tooltip
            class="item"
            effect="dark"
            placement="top"
          >
            <template #content>
              后续会支持多个关键字查询
            </template>
            <el-icon :size="20">
              <question-filled />
            </el-icon>
          </el-tooltip>
          <el-icon :size="20">
            <plus />
          </el-icon>
          <el-icon :size="20">
            <delete-filled />
          </el-icon>
        </el-row>

        <el-row v-if="shouldShowSearchResultPages">
          在以下页码中找到：<span class="search-result">{{ currentSearchResultPages }}</span>
        </el-row>
      </template>
    </div>

    <div class="pdf-viewer-content">
      <div v-show="isLoading" class="loading" />
      <pdf-js-embed
        v-show="!isLoading"
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
import { Plus, DeleteFilled, QuestionFilled } from '@element-plus/icons-vue';
import {
  toRefs, ref, computed,
} from 'vue';
import PdfJsEmbed from '../pdf-js-vue3-embed/PDFJSEmbed.vue';
import {
  changeToShowOnePageState, changeToShowSearchResultPagesState, shouldShowAllPages,
  shouldShowOnePage, showOnePageStateMeta, changeToShowAllPagesState,
  shouldShowSearchResultPages, showPagesStateBeforeShowSearchResultIsShowAll, showPagesStateBeforeShowSearchResultIsShowOne,
  showPagesStateBeforeShowSearchResult, showPagesState,
} from './pdf-viewer';
import { loadPDFStringsOfAllPagesLazily, pdfPagesThatHaveStr } from './pdf-viewer-search';

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
const currentSearchResultPages = ref([]);
const currentInputPageNumber = ref(1);
const currentSearchKeyword = ref('');
const pdfWidth = ref(1600);
const pdfPageContainerStyle = ref({
  marginBottom: '16px',
  boxShadow: '0 2px 8px 4px rgba(0, 0, 0, 0.1)',
});

const currentRenderPage = computed(() => {
  if (shouldShowAllPages.value) return null;
  if (shouldShowOnePage.value) return currentPage.value;
  return currentSearchResultPages.value;
});

function changeCurrentPage() {
  if (!currentInputPageNumber.value || Number.isNaN(currentInputPageNumber.value)) {
    ElMessage.warning('请输入合法的页码');
    return;
  }
  currentPage.value = currentInputPageNumber.value;
}

function searchTextInPDF() {
  // 每次使用搜索功能都需要记录 currentPage showPagesStateBeforeShowSearchResult
  showOnePageStateMeta.lastPageNumber = currentPage.value;
  if (!shouldShowSearchResultPages.value) {
    showPagesStateBeforeShowSearchResult.value = showPagesState.value;
  }

  const gotoLastState = () => {
    if (showPagesStateBeforeShowSearchResultIsShowAll.value) {
      changeToShowAllPagesState();
    }
    if (showPagesStateBeforeShowSearchResultIsShowOne.value) {
      changeToShowOnePageState();
      currentPage.value = showOnePageStateMeta.lastPageNumber;
    }
  };

  if (!currentSearchKeyword.value) {
    gotoLastState();
    return;
  }

  const pageNums = pdfPagesThatHaveStr(currentSearchKeyword.value, pageCount);
  if (!pageNums.length) {
    ElMessage.success('未找到结果');
    gotoLastState();
    return;
  }

  changeToShowSearchResultPagesState();
  currentSearchResultPages.value = pageNums;
}

const shouldShowAllPagesModel = computed({
  get() {
    return shouldShowAllPages.value;
  },
  set(value) {
    if (!value) changeToShowOnePageState();
    else changeToShowAllPagesState();
  },
});

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

function handleDocumentRendered(pdfDocument) {
  isLoading.value = false;
  pageCount.value = pdfDocument.numPages;
  loadPDFStringsOfAllPagesLazily(pdfDocument);
}
</script>

<style lang="less" scoped>
.loading {
  background: url('../../assets/icon-loading.svg') no-repeat 50% 50%;
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

  .el-row {
    margin-bottom: 20px;
  }
  .el-row:last-child {
    margin-bottom: 0;
  }

  .pdf-viewer-header-basic {
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

  .pdf-viewer-header-search {
    display: flex;
    gap: 20px;
    align-items: center;

    .keyword-input {
      flex: 1;
    }

    .el-icon {
      cursor: pointer;
    }
  }
}
.pdf-viewer-content {
  padding: 24px @pdf-viewer-padding-vertical;
  background-color: #ccc;
}
</style>
