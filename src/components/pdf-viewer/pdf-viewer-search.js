import { ref } from 'vue';

export const headerSearchContainerClassName = (index) => `pdf-viewer-header-search pdf-viewer-header-search-${index}`;

export class SearchKeywordRef {
  static key = 1

  constructor() {
    this.text = '';
    this.key = ++SearchKeywordRef.key;
  }
}

export const SEARCH_OPERATORS = {
  INTERSECTION: 11,
  UNION: 21,
};

export const supportedOperators = [
  { value: SEARCH_OPERATORS.INTERSECTION, label: '交集' },
  { value: SEARCH_OPERATORS.UNION, label: '并集' },
];

const pdfStringsOfAllPages = ref([]);
let lastPDFDocument = null;

function getPDFStringsOfAllPages(pdfDocument) {
  return Promise.all(Array(pdfDocument.numPages).fill(0).map(async (_, i) => {
    const page = await pdfDocument.getPage(i + 1);
    const { items = [] } = await page.getTextContent();
    return items.map((item) => item.str);
  }));
}

export async function loadPDFStringsOfAllPagesLazily(pdfDocument) {
  if (lastPDFDocument === pdfDocument) return;
  pdfStringsOfAllPages.value = await getPDFStringsOfAllPages(pdfDocument);
  lastPDFDocument = pdfDocument;
}

export function pdfPagesThatHaveStr(str, pageCount) {
  return Array(pageCount.value).fill(0).map((_, i) => i + 1).filter(
    (_, i) => pdfStringsOfAllPages.value[i].some((pdfOnePageStr) => pdfOnePageStr.includes(str)),
  );
}
