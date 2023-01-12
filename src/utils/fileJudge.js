import { fileTypeFromBuffer } from 'file-type';
import isEqual from 'lodash/isEqual';
import { fileHeader } from './bin';

export function isLegalHCTFFile(ab) {
  const u8Array = new Uint8Array(ab);
  if (u8Array.length < 8) return false;
  const dv = new DataView(ab instanceof Uint8Array ? ab.buffer : ab);
  if (!isEqual(u8Array.slice(0, 4), fileHeader)) return false;
  const keyLength = dv.getUint32(4, true);
  if (u8Array.length - 8 < keyLength) return false;
  return true;
}

export function isPNG(ab) {
  const u8Array = new Uint8Array(ab);
  if (u8Array.length < 4) return false;
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47]);
  if (!isEqual(u8Array.slice(0, 4), pngHeader)) return false;
  return true;
}

export function isJPG(ab) {
  const u8Array = new Uint8Array(ab);
  if (u8Array.length < 2) return false;
  const jpgHeader = new Uint8Array([0xFF, 0xD8]);
  if (!isEqual(u8Array.slice(0, 2), jpgHeader)) return false;
  return true;
}

export async function isVideo(ab) {
  if (!ab) return false;
  if (ab.ext && typeof ab.ext === 'string') {
    return ['mp4', 'flv', 'avi', 'mov'].includes(ab.ext);
  }
  const fileTypeResult = await fileTypeFromBuffer(ab);
  return fileTypeResult && ['mp4', 'flv', 'avi', 'mov'].includes(fileTypeResult.ext);
}

export async function isSpecificExt(ab, ext) {
  if (!ab) return false;
  if (ab.ext && typeof ab.ext === 'string') {
    return ab.ext === ext;
  }
  const fileTypeResult = await fileTypeFromBuffer(ab);
  return fileTypeResult && fileTypeResult.ext === ext;
}

export function isMP3(ab) {
  return isSpecificExt(ab, 'mp3');
}

export function isPDF(ab) {
  return isSpecificExt(ab, 'pdf');
}

export function isGif(ab) {
  return isSpecificExt(ab, 'gif');
}

export function isWebp(ab) {
  return isSpecificExt(ab, 'webp');
}

export async function isExcel(ab) {
  if (!ab) return false;
  if (ab.ext && typeof ab.ext === 'string') {
    return ['xlsx', 'xls'].includes(ab.ext);
  }
  const fileTypeResult = await fileTypeFromBuffer(ab);
  return fileTypeResult && ['xlsx', 'xls'].includes(fileTypeResult.ext);
}

export async function getBufferExt(ab) {
  if (isLegalHCTFFile(ab)) return '.hctf';
  const fileTypeResult = await fileTypeFromBuffer(ab);
  if (!fileTypeResult || !fileTypeResult.ext) return '';
  return `.${fileTypeResult.ext}`;
}

export function mayBeMeaningfulText(data) {
  // eslint-disable-next-line no-restricted-syntax
  for (const v of data) {
    if (!(v >= 32 && v < 127) && ![9, 10, 13].includes(v)) return false;
  }
  return true;
}
