<template>
  <div ref="pdfViewerContainer" class="pdf-viewer-container">
    <div
      v-for="pageNum in pageNums"
      :key="pageNum"
      :class="`pdf-viewer-page ${pdfPageContainerClassName}-${pageNum}`"
      :style="pdfPageContainerStyle"
    >
      <canvas />
      <div class="textLayer" />
    </div>
  </div>
</template>

<script setup>
import { toRefs, ref, watch } from 'vue';
import * as PDFJS from 'pdfjs-dist';
import PDFJSWorker from 'pdfjs-dist/build/pdf.worker';
import { releaseChildCanvases, loadPDF } from './util';

PDFJS.GlobalWorkerOptions.workerPort = new PDFJSWorker();

const emit = defineEmits(['progress', 'password-requested', 'load-failed', 'render-page-failed', 'rendered']);

const props = defineProps({
  width: {
    type: [Number, String],
    default: 0,
  },
  height: {
    type: [Number, String],
    default: 0,
  },
  renderPages: {
    type: [Number, Array],
    default: null,
    validator(value) {
      if (!Array.isArray(value) && typeof value !== 'number' && value !== null) {
        throw new Error('renderPages must be number | number[] | null');
      }
      if (!Array.isArray(value)) return true;
      if (value.some((item) => typeof item !== 'number')) {
        throw new Error('renderPages must be number | number[] | null');
      }
      return true;
    },
  },
  pdfData: {
    type: [Object, Uint8Array, String],
    required: true,
  },
  rotation: {
    type: [Number, String],
    default: 0,
    validator(value) {
      if (value % 90 !== 0) {
        throw new Error('Rotation must be 0 or a multiple of 90.');
      }
      return true;
    },
  },
  pdfPageContainerStyle: {
    type: Object,
    default: () => ({}),
  },
  pdfPageContainerClassName: {
    type: String,
    default: 'pdf-viewer-page',
  },
});
const {
  width, height, renderPages, pdfData, rotation,
  pdfPageContainerStyle, pdfPageContainerClassName,
} = toRefs(props);

const pdfViewerContainer = ref(null);
const pageNums = ref([]);

async function renderOnePage(pdfOnePage, canvas, actualWidth) {
  const renderOnePageViewport = pdfOnePage.getViewport({
    scale: Math.ceil(actualWidth / pdfOnePage.view[2]) + 1,
    rotation: rotation.value,
  });
  canvas.width = renderOnePageViewport.width;
  canvas.height = renderOnePageViewport.height;
  await pdfOnePage.render({
    canvasContext: canvas.getContext('2d'),
    viewport: renderOnePageViewport,
  }).promise;
}

async function renderPageTextLayer(pdfOnePage, textLayerDiv, actualWidth) {
  while (textLayerDiv.firstChild) {
    textLayerDiv.removeChild(textLayerDiv.firstChild);
  }
  const textLayerScale = actualWidth / pdfOnePage.view[2];
  textLayerDiv.style.setProperty('--scale-factor', textLayerScale);
  const textLayerViewport = pdfOnePage.getViewport({
    scale: textLayerScale,
    rotation: rotation.value,
  });
  await PDFJS.renderTextLayer({
    container: textLayerDiv,
    textContentSource: await pdfOnePage.getTextContent(),
    viewport: textLayerViewport,
  }).promise;
}

function getPageDimensions(ratio) {
  let returnWidth;
  let returnHeight;
  if (height.value && !width.value) {
    returnHeight = height.value;
    returnWidth = returnHeight / ratio;
  } else {
    returnWidth = width.value || pdfViewerContainer.value.clientWidth;
    returnHeight = returnWidth * ratio;
  }
  return [returnWidth, returnHeight];
}

function getPageNums(numPages) {
  if (!renderPages.value) return Array(numPages).fill(0).map((_, i) => i + 1);
  if (typeof renderPages.value === 'number') return [renderPages.value];
  return renderPages.value;
}

async function renderPDFPages(pdfDocument) {
  if (!pdfDocument) return;
  pageNums.value = getPageNums(pdfDocument.numPages);

  await Promise.all(
    pageNums.value.map(
      async (pageNum, i) => {
        try {
          const pdfOnePage = await pdfDocument.getPage(pageNum);
          const [canvas, textLayerDiv] = pdfViewerContainer.value.children[i].children;
          const [actualWidth, actualHeight] = getPageDimensions(
            pdfOnePage.view[3] / pdfOnePage.view[2],
          );
          if ((rotation.value / 90) % 2) {
            canvas.style.width = `${Math.floor(actualHeight)}px`;
            canvas.style.height = `${Math.floor(actualWidth)}px`;
          } else {
            canvas.style.width = `${Math.floor(actualWidth)}px`;
            canvas.style.height = `${Math.floor(actualHeight)}px`;
          }

          await renderOnePage(pdfOnePage, canvas, actualWidth);
          await renderPageTextLayer(pdfOnePage, textLayerDiv, actualWidth);
        } catch (e) {
          emit('render-page-failed', e, pageNum, pdfDocument);
        }
      },
    ),
  );
  emit('rendered', pdfDocument);
}

async function pdfViewer() {
  const pdfDocument = await loadPDF(PDFJS, pdfData, emit, false);
  renderPDFPages(pdfDocument);
}
pdfViewer();

watch(() => [
  pdfData.value, width.value, height.value, renderPages.value, rotation.value,
], async ([newPDFData], [oldPDFData]) => {
  let pdfDocument;
  if (newPDFData !== oldPDFData) {
    releaseChildCanvases(pdfViewerContainer.value);
    pdfDocument = await loadPDF(PDFJS, newPDFData, emit, false);
  } else {
    pdfDocument = await loadPDF(PDFJS, null, emit, true);
  }
  renderPDFPages(pdfDocument);
});
</script>

<style lang="less" scoped>
@import './style/text-layer.css';

.pdf-viewer-container {
  .pdf-viewer-page {
    position: relative;
  }

  canvas {
    display: block;
  }
}
</style>
