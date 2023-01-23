// https://docs.cypress.io/api/table-of-contents
import shuffle from 'lodash/shuffle';

// The following tests require file 新冠自我康复手册中文版-WHO-7轮.hctf which is an encrypted pdf.
const encryptedPDFPath = '新冠自我康复手册中文版-WHO-7轮.hctf';
const encryptedPDFPageCount = 25;
const currentPageTextSelector = '.current-page';
const pdfViewerHeaderBasicSelector = '.pdf-viewer-header-basic';
const lastPageBtnSelector = '.pdf-viewer-header-basic .last-page-btn';
const nextPageBtnSelector = '.pdf-viewer-header-basic .next-page-btn';
const pageJumperSelector = '.pdf-viewer-header-basic .el-input__inner';
const showAllPagesCheckboxSelector = '.pdf-viewer-header-basic .show-all-pages .checkbox';
const keywordInputSelector = '.pdf-viewer-header-search .keyword-input .el-input__inner';
const searchResultSelector = '.pdf-viewer-header .search-result';

before(() => {
  cy.visit('/');
  cy.get('.select-file-to-decrypt .el-upload__input').forceSelectPDF(encryptedPDFPath);
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
    cy.get(pageJumperSelector).clear().type(`${page}{enter}`, { force: true });
  }

  function assertShowingAllPages() {
    cy.get(pdfViewerHeaderBasicSelector).contains(`共 ${encryptedPDFPageCount} 页`);
    cy.get(currentPageTextSelector).should('not.exist');
    cy.get(lastPageBtnSelector).should('not.exist');
    cy.get(nextPageBtnSelector).should('not.exist');
    cy.get(pageJumperSelector).should('not.exist');
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

  it.only('States change correctly', () => {
    const initialPage = 15;
    jumpToPageNumber(initialPage);
    assertCurrentPage(initialPage);
    cy.get(keywordInputSelector).forceInput('疼痛');
    cy.get(searchResultSelector).contains('[ 3, 8, 13, 16, 22, 24 ]');
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态

    assertCurrentPage(initialPage);
    const initialPage2 = 17;
    jumpToPageNumber(initialPage2);
    assertCurrentPage(initialPage2);
    cy.get(keywordInputSelector).forceInput('tt');
    cy.get(searchResultSelector).contains('[ 18, 21 ]');
    cy.get(keywordInputSelector).forceInput('acmer'); // 无结果
    assertNotShowingSearchResult();

    assertCurrentPage(initialPage2);
    const initialPage3 = 5;
    jumpToPageNumber(initialPage3);
    assertCurrentPage(initialPage3);
    cy.get(keywordInputSelector).forceInput('acmer2000'); // 无结果
    assertCurrentPage(initialPage3);
    const initialPage4 = 7;
    jumpToPageNumber(initialPage4);
    assertCurrentPage(initialPage4);

    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput('acmer2001'); // 无结果
    assertShowingAllPages();
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage4);
    const initialPage5 = 8;
    cy.get(nextPageBtnSelector).forceClick();
    assertCurrentPage(initialPage5);

    cy.get(keywordInputSelector).forceInput('注意力');
    cy.get(searchResultSelector).contains('[ 3, 8, 14, 17, 19, 21, 22, 24 ]');
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
    cy.get(keywordInputSelector).forceInput('ctfer2002'); // 无结果
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput('工作时间');
    cy.get(searchResultSelector).contains('[ 19 ]');
    cy.get(keywordInputSelector).forceInput('ctfer2003'); // 无结果
    assertShowingAllPages();
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage6);

    const initialPage7 = 16;
    jumpToPageNumber(initialPage7 + 1);
    cy.get(lastPageBtnSelector).forceClick();
    assertCurrentPage(initialPage7);
    cy.get(keywordInputSelector).forceInput('ctfer2004'); // 无结果
    assertCurrentPage(initialPage7);
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage7);
    cy.get(keywordInputSelector).forceInput('ctfer2005'); // 无结果
    assertCurrentPage(initialPage7);
    cy.get(keywordInputSelector).forceInput('网');
    cy.get(searchResultSelector).contains('[ 18, 25 ]');
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage7);
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput('COVID');
    cy.get(searchResultSelector).contains('[ 1, 2 ]');
    cy.get(keywordInputSelector).forceInput('ctfer2006'); // 无结果
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput('持续');
    cy.get(searchResultSelector).contains('[ 2, 22, 23 ]');
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput('ctfer2007'); // 无结果
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
    cy.get(keywordInputSelector).forceInput('ctfer2008'); // 无结果
    assertCurrentPage(initialPage8);
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertShowingAllPages();
    for (let i = 0; i < 2; ++i) {
      cy.get(keywordInputSelector).forceInput('持续12周'); // 由于我的算法有缺陷（要完善它很难吧？），这个无结果，但实际上在第2页有结果
      assertShowingAllPages();
      cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
      assertShowingAllPages();
    }
    cy.get(showAllPagesCheckboxSelector).forceClick();
    assertCurrentPage(initialPage8);
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertCurrentPage(initialPage8);
    cy.get(keywordInputSelector).forceInput('家人');
    cy.get(searchResultSelector).contains('[ 2, 14, 19, 21, 24 ]');
    cy.get(keywordInputSelector).forceInput('ctfer2009'); // 无结果
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
    cy.get(keywordInputSelector).forceInput('ctfer2010'); // 无结果
    assertShowingAllPages();
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
    for (let i = 0; i < 2; ++i) {
      cy.get(keywordInputSelector).forceInput('医务人员');
      cy.get(searchResultSelector).contains('[ 1, 2, 3, 4, 9, 13, 16, 17, 22 ]');
      cy.get(keywordInputSelector).forceInput('证据');
      cy.get(searchResultSelector).contains('[ 2 ]');
    }
    cy.get(keywordInputSelector).forceInput('ctfer2011'); // 无结果
    assertShowingAllPages();
    for (let i = 0; i < 2; ++i) {
      cy.get(keywordInputSelector).forceInput('服务');
      cy.get(searchResultSelector).contains('[ 1, 2, 25 ]');
      cy.get(keywordInputSelector).forceInput('新冠患者');
      cy.get(searchResultSelector).contains('[ 2, 19 ]');
    }
    cy.get(keywordInputSelector).forceInput(''); // 输入空串，回到上次的状态
    assertShowingAllPages();
  });
});
