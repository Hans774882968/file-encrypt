import { computed, ref } from 'vue';

export const SHOW_PAGES_STATES = {
  SHOW_ALL: 10,
  SHOW_ONE_PAGE: 20,
  SHOW_SEARCH_RESULT: 30,
};
export const showPagesState = ref(SHOW_PAGES_STATES.SHOW_ONE_PAGE);
export const showOnePageStateMeta = {
  lastPageNumber: 0,
};
export const showPagesStateBeforeShowSearchResult = ref(null);

export const shouldShowAllPages = computed(() => showPagesState.value === SHOW_PAGES_STATES.SHOW_ALL);
export const shouldShowOnePage = computed(() => showPagesState.value === SHOW_PAGES_STATES.SHOW_ONE_PAGE);
export const shouldShowSearchResultPages = computed(() => showPagesState.value === SHOW_PAGES_STATES.SHOW_SEARCH_RESULT);
export const showPagesStateBeforeShowSearchResultIsShowAll = computed(
  () => showPagesStateBeforeShowSearchResult.value === SHOW_PAGES_STATES.SHOW_ALL,
);
export const showPagesStateBeforeShowSearchResultIsShowOne = computed(
  () => showPagesStateBeforeShowSearchResult.value === SHOW_PAGES_STATES.SHOW_ONE_PAGE,
);

export function changeToShowSearchResultPagesState() {
  showPagesState.value = SHOW_PAGES_STATES.SHOW_SEARCH_RESULT;
}

export function changeToShowOnePageState() {
  showPagesState.value = SHOW_PAGES_STATES.SHOW_ONE_PAGE;
}

export function changeToShowAllPagesState() {
  showPagesState.value = SHOW_PAGES_STATES.SHOW_ALL;
}

export const PDF_PAGE_CONTAINER_CLASS_NAME = 'pdf-viewer-page';

export const getPDFPageSelector = (page) => `.pdf-viewer-content .${PDF_PAGE_CONTAINER_CLASS_NAME}-${page}`;
