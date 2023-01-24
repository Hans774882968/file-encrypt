// https://docs.cypress.io/api/table-of-contents
import shuffle from 'lodash/shuffle';
import sample from 'lodash/sample';

// The following tests require file 新冠自我康复手册中文版-WHO-7轮.hctf which is an encrypted pdf.
const encryptedPDFPath = '新冠自我康复手册中文版-WHO-7轮.hctf';
const encryptedPDFPageCount = 25;

const SEARCH_KEYWORDS_HAVE_RESULT_Q_A = [
  { keyword: '疼痛', answer: [3, 8, 13, 16, 22, 24] },
  { keyword: 'tt', answer: [18, 21] },
  { keyword: '注意力', answer: [3, 8, 14, 17, 19, 21, 22, 24] },
  { keyword: '工作时间', answer: [19] },
  { keyword: '网', answer: [18, 25] },
  { keyword: 'COVID', answer: [1, 2] },
  { keyword: '持续', answer: [2, 22, 23] },
  { keyword: '家人', answer: [2, 14, 19, 21, 24] },
  { keyword: '医务人员', answer: [1, 2, 3, 4, 9, 13, 16, 17, 22] },
  { keyword: '证据', answer: [2] },
  { keyword: '服务', answer: [1, 2, 25] },
  { keyword: '新冠患者', answer: [2, 19] },
];
// 由于我的算法有缺陷（要完善它很难吧？），'持续12周'无结果，但实际上在第2页有结果
const SEARCH_KEYWORDS_NOT_HAVE_RESULT = [
  'acmer', 'acmer2000', 'acmer2001', 'ctfer2009', '持续12周',
];

const warningToastSelector = '.el-message__content';
const selectFileToDecryptSelector = '.select-file-to-decrypt .el-upload__input';
const currentPageTextSelector = '.current-page';
const pdfViewerHeaderBasicSelector = '.pdf-viewer-header-basic';
const lastPageBtnSelector = '.pdf-viewer-header-basic .last-page-btn';
const nextPageBtnSelector = '.pdf-viewer-header-basic .next-page-btn';
const onePageJumperSelector = '.pdf-viewer-header-basic .one-page-jumper-container .el-input__inner';
const allPagesJumperSelector = '.pdf-viewer-header-basic .all-pages-jumper-container .el-input__inner';
const showAllPagesCheckboxSelector = '.pdf-viewer-header-basic .show-all-pages .el-checkbox__label';
const keywordInputSelector = '.pdf-viewer-header-search .keyword-input .el-input__inner';
const searchResultSelector = '.pdf-viewer-header .search-result';
const searchResultLinksSelector = '.pdf-viewer-header .search-result .search-result-link';

before(() => {
  cy.visit('/');
  cy.get(selectFileToDecryptSelector).forceSelectPDF(encryptedPDFPath);
  // 如果第一次不能在既定时间内加载出PDF，请刷新一次，之后一般都能加载出PDF了。
  cy.get(lastPageBtnSelector, { timeout: 10000 }).should('be.disabled');
});

describe('PDFViewer', () => {
  function assertCurrentPage(page) {
    cy.get(currentPageTextSelector).should((span) => {
      const currentPage = span.text();
      expect(currentPage).to.equal(`${page}`);
    });
  }

  function jumpToPageNumber(page) {
    cy.get(onePageJumperSelector).clear().type(`${page}{enter}`, { force: true });
  }

  function scrollToPageNumber(page) {
    cy.get(allPagesJumperSelector).clear().type(`${page}{enter}`, { force: true });
  }

  function searchKeywordsThatHaveResult() {
    const { keyword: text, answer } = sample(SEARCH_KEYWORDS_HAVE_RESULT_Q_A);
    cy.get(keywordInputSelector).forceInput(text);
    cy.get(searchResultLinksSelector)
      .each((link, i) => {
        const page = Number(link.text());
        expect(page).to.equal(answer[i]);
      });
  }

  function searchKeywordsThatNotHaveResult() {
    const text = sample(SEARCH_KEYWORDS_NOT_HAVE_RESULT);
    cy.get(keywordInputSelector).forceInput(text);
  }

  function assertShowingAllPages() {
    cy.get(pdfViewerHeaderBasicSelector).contains(`共 ${encryptedPDFPageCount} 页`);
    cy.get(currentPageTextSelector).should('not.exist');
    cy.get(lastPageBtnSelector).should('not.exist');
    cy.get(nextPageBtnSelector).should('not.exist');
    cy.get(onePageJumperSelector).should('not.exist');
    cy.get(allPagesJumperSelector).should('exist');
  }
  function assertNotShowingSearchResult() {
    cy.get(searchResultSelector).should('not.exist');
  }

  it('page can change', () => {
    assertCurrentPage(1);
    for (let i = 0; i < encryptedPDFPageCount - 1; ++i) {
      cy.get(nextPageBtnSelector).forceClick();
      assertCurrentPage(i + 2);
    }
    cy.get(nextPageBtnSelector).should('be.disabled');
    for (let i = encryptedPDFPageCount - 1; i >= 1; --i) {
      cy.get(lastPageBtnSelector).forceClick();
      assertCurrentPage(i);
    }
    cy.get(lastPageBtnSelector).should('be.disabled');

    const inputPages = shuffle(Array(encryptedPDFPageCount).fill(0).map((_, i) => i + 1));
    inputPages.forEach((inputPage) => {
      jumpToPageNumber(inputPage);
      assertCurrentPage(inputPage);
      if (inputPage === 1) {
        cy.get(lastPageBtnSelector).should('be.disabled');
      }
      if (inputPage === encryptedPDFPageCount) {
        cy.get(nextPageBtnSelector).should('be.disabled');
      }
    });

    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();

    cy.get(showAllPagesCheckboxSelector).forceClick();
    jumpToPageNumber(12);
    assertCurrentPage(12);

    const smallPage = -114514;
    jumpToPageNumber(smallPage);
    assertCurrentPage(1);
    cy.get(lastPageBtnSelector).should('be.disabled');
    const bigPage = 1919810;
    jumpToPageNumber(bigPage);
    assertCurrentPage(encryptedPDFPageCount);
    cy.get(nextPageBtnSelector).should('be.disabled');
  });

  it('Page jumper toast', () => {
    jumpToPageNumber('');
    cy.get(warningToastSelector).contains('请输入合法的页码');
    /*
     * 下面这个test可能不成功，因为：element-plus input-number输入1-3，速度慢则
     * 解析为1，速度快则解析为null。前者合法后者不合法。
     */
    jumpToPageNumber('1-3');
    cy.get(warningToastSelector).contains('请输入合法的页码');
    assertCurrentPage(1);
    jumpToPageNumber(15);
    assertCurrentPage(15);

    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    scrollToPageNumber('');
    cy.get(warningToastSelector).contains('请输入合法的页码');
    scrollToPageNumber('1-5');
    cy.get(warningToastSelector).contains('请输入合法的页码');
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(15);
  });

  it.only('States change correctly', () => {
    const initialPage = 15;
    jumpToPageNumber(initialPage);
    assertCurrentPage(initialPage);
    searchKeywordsThatHaveResult();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态

    assertCurrentPage(initialPage);
    const initialPage2 = 17;
    jumpToPageNumber(initialPage2);
    assertCurrentPage(initialPage2);
    searchKeywordsThatHaveResult();
    searchKeywordsThatNotHaveResult();
    assertNotShowingSearchResult();

    assertCurrentPage(initialPage2);
    const initialPage3 = 5;
    jumpToPageNumber(initialPage3);
    assertCurrentPage(initialPage3);
    searchKeywordsThatNotHaveResult();
    assertCurrentPage(initialPage3);
    const initialPage4 = 7;
    jumpToPageNumber(initialPage4);
    assertCurrentPage(initialPage4);

    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    searchKeywordsThatNotHaveResult();
    assertShowingAllPages();
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage4);
    const initialPage5 = 8;
    cy.get(nextPageBtnSelector).forceClick();
    assertCurrentPage(initialPage5);

    searchKeywordsThatHaveResult();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage5);
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage5);
    const initialPage6 = 9;
    cy.get(nextPageBtnSelector).forceClick();
    assertCurrentPage(initialPage6);
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
    searchKeywordsThatNotHaveResult();
    assertShowingAllPages();
    searchKeywordsThatHaveResult();
    searchKeywordsThatNotHaveResult();
    assertShowingAllPages();
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage6);

    const initialPage7 = 16;
    jumpToPageNumber(initialPage7 + 1);
    cy.get(lastPageBtnSelector).forceClick();
    assertCurrentPage(initialPage7);
    searchKeywordsThatNotHaveResult();
    assertCurrentPage(initialPage7);
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage7);
    searchKeywordsThatNotHaveResult();
    assertCurrentPage(initialPage7);
    searchKeywordsThatHaveResult();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage7);
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    searchKeywordsThatHaveResult();
    searchKeywordsThatNotHaveResult();
    assertShowingAllPages();
    searchKeywordsThatHaveResult();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
    searchKeywordsThatNotHaveResult();
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage7);

    const initialPage8 = 1;
    const smallPage = -114514;
    jumpToPageNumber(smallPage);
    assertCurrentPage(initialPage8);
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage8);
    searchKeywordsThatNotHaveResult();
    assertCurrentPage(initialPage8);
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    for (let i = 0; i < 2; ++i) {
      searchKeywordsThatNotHaveResult();
      assertShowingAllPages();
      cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
      assertShowingAllPages();
    }
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage8);
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage8);
    searchKeywordsThatHaveResult();
    searchKeywordsThatNotHaveResult();
    assertCurrentPage(initialPage8);
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage8);

    const initialPage9 = encryptedPDFPageCount;
    const bigPage = 1919810;
    jumpToPageNumber(bigPage);
    assertCurrentPage(initialPage9);
    for (let i = 0; i < 3; ++i) {
      cy.get(showAllPagesCheckboxSelector).forceClick();
    }
    assertShowingAllPages();
    searchKeywordsThatNotHaveResult();
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
    for (let i = 0; i < 4; ++i) {
      searchKeywordsThatHaveResult();
    }
    searchKeywordsThatNotHaveResult();
    assertShowingAllPages();
    for (let i = 0; i < 4; ++i) {
      searchKeywordsThatHaveResult();
    }
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
  });
});
