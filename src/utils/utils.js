export function downloadFile(resultBlob, fileName) {
  const elementA = document.createElement('a');
  elementA.setAttribute('href', URL.createObjectURL(resultBlob));
  elementA.setAttribute('download', fileName);
  elementA.style.display = 'none';
  document.body.appendChild(elementA);
  elementA.click();
  document.body.removeChild(elementA);
}

export function downloadEncryptFile(encryptResultBlob, fileName = 'test.hctf') {
  downloadFile(encryptResultBlob, fileName);
}

export function downloadDecryptFile(decryptResultBlob, fileName) {
  downloadFile(decryptResultBlob, fileName);
}

export function getLineMaxLength(s) {
  return s.split('\n').reduce((ans, text) => Math.max(ans, text.length), 0);
}
