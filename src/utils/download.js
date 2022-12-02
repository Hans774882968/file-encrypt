export function downloadFile(encryptResultBlob) {
  const elementA = document.createElement('a');
  elementA.setAttribute('href', URL.createObjectURL(encryptResultBlob));
  elementA.setAttribute('download', 'test.hctf');
  elementA.style.display = 'none';
  document.body.appendChild(elementA);
  elementA.click();
  document.body.removeChild(elementA);
}
