<template>
  <div class="pdf-viewer-container">
    <div class="pdf-viewer-header">
      <template v-if="isLoading">
        <div class="loading" />
      </template>
      <template v-else>
        <el-row class="pdf-viewer-header-basic">
          <span v-if="currentState.shouldShowAllPages.value">
            共 {{ pageCount }} 页
          </span>
          <div v-if="currentState.shouldShowOnePage.value" class="page-change-btn-container">
            <button class="last-page-btn" :disabled="currentPage <= 1" @click="currentPage--">❮</button>
            <span class="current-page">
              {{ currentPage }}
            </span>
            /
            <span class="page-count">
              {{ pageCount }}
            </span>
            <button class="next-page-btn" :disabled="currentPage >= pageCount" @click="currentPage++">❯</button>
          </div>

          <!-- 目前每次状态变化输入框页码初值都是1，是否需要缓存功能？ -->
          <page-jumper
            v-if="currentState.shouldShowOnePage.value"
            class="one-page-jumper-container"
            :page-count="pageCount"
            @change-page="changeCurrentPage"
          />

          <page-jumper
            v-if="currentState.shouldShowAllPages.value"
            class="all-pages-jumper-container"
            :page-count="pageCount"
            @change-page="scrollToPage"
          />

          <el-checkbox v-if="!currentState.shouldShowSearchResultPages.value" v-model="shouldShowAllPagesModel" class="show-all-pages">
            展示每一页
          </el-checkbox>
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
              1. 搜索框按回车触发搜索动作。<br>2. 后续会支持多个关键字查询，在任意搜索框按回车即可触发搜索动作，所有搜索框内容均为空即可跳出搜索状态。
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

        <el-row v-if="currentState.shouldShowSearchResultPages.value" class="search-result">
          在以下页码中找到：
          <el-button
            v-for="searchResultPage in currentSearchResultPages"
            :key="searchResultPage"
            class="search-result-link"
            type="primary"
            link
            @click="scrollToSearchResultPage(searchResultPage)"
          >
            {{ searchResultPage }}
          </el-button>
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
  currentState, stateBeforeShowSearchResult, getPDFPageSelector,
} from './pdf-viewer';
import { loadPDFStringsOfAllPagesLazily, pdfPagesThatHaveStr } from './pdf-viewer-search';
import PageJumper from './PageJumper.vue';

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
const currentSearchKeyword = ref('');
const pdfWidth = ref(1600);
const pdfPageContainerStyle = ref({
  marginBottom: '16px',
  boxShadow: '0 2px 8px 4px rgba(0, 0, 0, 0.1)',
});

const currentRenderPage = computed(() => {
  if (currentState.shouldShowAllPages.value) return null;
  if (currentState.shouldShowOnePage.value) return currentPage.value;
  return currentSearchResultPages.value;
});

function changeCurrentPage(currentInputPageNumber) {
  currentPage.value = currentInputPageNumber;
}

function scrollToPage(page) {
  const selector = getPDFPageSelector(page);
  const ele = document.querySelector(selector);
  if (!ele) return;
  ele.scrollIntoView({ behavior: 'smooth' });
}

function scrollToSearchResultPage(searchResultPage) {
  scrollToPage(searchResultPage);
}

function searchTextInPDF() {
  // 每次使用搜索功能都需要记录 currentPage showPagesStateBeforeShowSearchResult
  currentState.meta.lastPageNumber = currentPage.value;
  if (!currentState.shouldShowSearchResultPages.value) {
    stateBeforeShowSearchResult.setState(currentState.state.value);
  }

  const gotoLastState = () => {
    if (stateBeforeShowSearchResult.shouldShowAllPages.value) {
      currentState.changeToShowAllPagesState();
    }
    if (stateBeforeShowSearchResult.shouldShowOnePage.value) {
      currentState.changeToShowOnePageState();
      currentPage.value = currentState.meta.lastPageNumber;
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

  currentState.changeToShowSearchResultPagesState();
  currentSearchResultPages.value = pageNums;
}

const shouldShowAllPagesModel = computed({
  get() {
    return currentState.shouldShowAllPages.value;
  },
  set(value) {
    if (!value) currentState.changeToShowOnePageState();
    else currentState.changeToShowAllPagesState();
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

    .page-change-btn-container {
      display: flex;
      font-size: 18px;

      .current-page, .page-count {
        margin: 0 16px;
      }
    }

    // 未选中时重写，选中时保持原有样式
    :deep(.el-checkbox__label) {
      color: #ddd;
    }
    :deep(.el-checkbox__input.is-checked+.el-checkbox__label) {
      color: #409eff;
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
