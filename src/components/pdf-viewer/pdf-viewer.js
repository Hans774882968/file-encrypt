import { computed, ref } from 'vue';

export const SHOW_PAGES_STATES = {
  SHOW_ALL: 10,
  SHOW_ONE_PAGE: 20,
  SHOW_SEARCH_RESULT: 30,
};

class ShowPagesStateManager {
  constructor(state, meta) {
    this.state = ref(state);
    this.meta = meta || {};
    this.shouldShowAllPages = computed(() => this.state.value === SHOW_PAGES_STATES.SHOW_ALL);
    this.shouldShowOnePage = computed(() => this.state.value === SHOW_PAGES_STATES.SHOW_ONE_PAGE);
    this.shouldShowSearchResultPages = computed(() => this.state.value === SHOW_PAGES_STATES.SHOW_SEARCH_RESULT);
  }

  setState(newState) {
    this.state.value = newState;
  }

  changeToShowSearchResultPagesState() {
    this.state.value = SHOW_PAGES_STATES.SHOW_SEARCH_RESULT;
  }

  changeToShowOnePageState() {
    this.state.value = SHOW_PAGES_STATES.SHOW_ONE_PAGE;
  }

  changeToShowAllPagesState() {
    this.state.value = SHOW_PAGES_STATES.SHOW_ALL;
  }
}

export const currentState = new ShowPagesStateManager(
  SHOW_PAGES_STATES.SHOW_ONE_PAGE,
  { lastPageNumber: 0 },
);

export const stateBeforeShowSearchResult = new ShowPagesStateManager(null);

export const PDF_PAGE_CONTAINER_CLASS_NAME = 'pdf-viewer-page';

export const getPDFPageSelector = (page) => `.pdf-viewer-content .${PDF_PAGE_CONTAINER_CLASS_NAME}-${page}`;
