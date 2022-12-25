export function fileToArrayBuffer(file) {
  return new Promise((resolve) => {
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.addEventListener('loadend', (e) => {
      resolve(e.target.result);
    });
  });
}

export const fileHeader = new Uint8Array([0x68, 0x63, 0x74, 0x66]);

function uint32ToUint8Array(n) {
  const a = Array(4).fill(0).map((_, i) => n >> (i << 3) & 0xff);
  return new Uint8Array(a);
}

export function isUint8ArrayEqual(a1, a2) {
  return a1.length === a2.length && a1.every((v, i) => v === a2[i]);
}

export function enc(ab, _encryptKey = fileHeader) {
  let encryptKey = _encryptKey || fileHeader;
  if (typeof encryptKey === 'string') {
    encryptKey = new TextEncoder().encode(encryptKey);
  }
  const u8Array = new Uint8Array(ab);
  const encryptedData = u8Array.map((b, i) => b ^ encryptKey[i % encryptKey.length]);
  return new Blob([fileHeader, uint32ToUint8Array(encryptKey.length), encryptKey, encryptedData]);
}

export function getDecryptedU8Array(ab) {
  const u8Array = new Uint8Array(ab);
  const dv = new DataView(ab);
  const keyLength = dv.getUint32(4, true);
  const fileOffset = 8 + keyLength;
  const encryptKey = u8Array.slice(8, fileOffset);
  const decryptedData = u8Array.slice(fileOffset).map((b, i) => b ^ encryptKey[i % encryptKey.length]);
  return decryptedData;
}

export function dec(ab) {
  const decryptedData = getDecryptedU8Array(ab);
  return new Blob([decryptedData]);
}
