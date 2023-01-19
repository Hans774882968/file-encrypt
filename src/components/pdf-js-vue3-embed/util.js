export function releaseChildCanvases(el) {
  el.querySelectorAll('canvas').forEach((canvas) => {
    canvas.width = 1;
    canvas.height = 1;
    canvas.getContext('2d')?.clearRect(0, 0, 1, 1);
  });
}

let pdfDocument = null;

export async function loadPDF(PDFJS, pdfData, emit, cache = false) {
  if (pdfDocument && cache) {
    return pdfDocument;
  }
  if (!pdfData.value) {
    pdfDocument = null;
    return pdfDocument;
  }
  try {
    const documentLoadingTask = PDFJS.getDocument(pdfData.value);
    documentLoadingTask.onProgress = (progressParams) => {
      emit('progress', progressParams);
    };
    documentLoadingTask.onPassword = (callback, reason) => {
      const retry = reason === PDFJS.PasswordResponses.INCORRECT_PASSWORD;
      emit('password-requested', callback, retry);
    };
    pdfDocument = await documentLoadingTask.promise;
    return pdfDocument;
  } catch (e) {
    emit('load-failed', e);
    pdfDocument = null;
    return pdfDocument;
  }
}
