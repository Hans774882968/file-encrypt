import { isLegalHCTFFile } from './fileJudge';

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

export function getEncryptedU8Array(ab, encryptKey) {
  const u8Array = new Uint8Array(ab);
  const encryptedData = u8Array.map((b, i) => b ^ encryptKey[i % encryptKey.length]);
  return new Uint8Array([...fileHeader, ...uint32ToUint8Array(encryptKey.length), ...encryptKey, ...encryptedData]);
}

export function enc(ab, _encryptKey = fileHeader, encryptRoundCount = 1) {
  let encryptKey = _encryptKey || fileHeader;
  if (typeof encryptKey === 'string') {
    encryptKey = new TextEncoder().encode(encryptKey);
  }
  let encryptedData = ab;
  for (let i = 0; i < encryptRoundCount; ++i) {
    encryptedData = getEncryptedU8Array(encryptedData, encryptKey);
  }
  return new Blob([encryptedData]);
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

export function dec(ab, decryptRoundCount = 1) {
  let decryptedDataArrayBuffer = ab;
  for (let i = 0; i < decryptRoundCount; ++i) {
    if (!isLegalHCTFFile(decryptedDataArrayBuffer)) break;
    decryptedDataArrayBuffer = getDecryptedU8Array(decryptedDataArrayBuffer).buffer;
  }
  const decryptedData = new Uint8Array(decryptedDataArrayBuffer);
  return {
    decryptResultData: decryptedData,
    decryptResultBlob: new Blob([decryptedData]),
  };
}
