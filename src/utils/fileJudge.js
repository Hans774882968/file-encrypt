import { fileTypeFromBuffer } from 'file-type';
import { fileHeader, isUint8ArrayEqual } from './bin';

export function isLegalHCTFFile(ab) {
  const u8Array = new Uint8Array(ab);
  if (u8Array.length < 8) return false;
  const dv = new DataView(ab instanceof Uint8Array ? ab.buffer : ab);
  if (!isUint8ArrayEqual(u8Array.slice(0, 4), fileHeader)) return false;
  const keyLength = dv.getUint32(4, true);
  if (u8Array.length - 8 < keyLength) return false;
  return true;
}

export function isPNG(ab) {
  const u8Array = new Uint8Array(ab);
  if (u8Array.length < 4) return false;
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47]);
  if (!isUint8ArrayEqual(u8Array.slice(0, 4), pngHeader)) return false;
  return true;
}

export function isJPG(ab) {
  const u8Array = new Uint8Array(ab);
  if (u8Array.length < 2) return false;
  const jpgHeader = new Uint8Array([0xFF, 0xD8]);
  if (!isUint8ArrayEqual(u8Array.slice(0, 2), jpgHeader)) return false;
  return true;
}

export async function isVideo(ab) {
  const fileTypeResult = await fileTypeFromBuffer(ab);
  return fileTypeResult && ['mp4', 'flv', 'avi', 'mov'].includes(fileTypeResult.ext);
}

export async function isMP3(ab) {
  const fileTypeResult = await fileTypeFromBuffer(ab);
  return fileTypeResult && fileTypeResult.ext === 'mp3';
}

export async function isPDF(ab) {
  const fileTypeResult = await fileTypeFromBuffer(ab);
  return fileTypeResult && fileTypeResult.ext === 'pdf';
}

export async function getBufferExt(ab) {
  if (isLegalHCTFFile(ab)) return '.hctf';
  const fileTypeResult = await fileTypeFromBuffer(ab);
  if (!fileTypeResult || !fileTypeResult.ext) return '';
  return `.${fileTypeResult.ext}`;
}
