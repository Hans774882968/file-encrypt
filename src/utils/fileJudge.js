import { fileHeader, isUint8ArrayEqual } from './bin';

export function isLegalHCTFFile(ab) {
  const u8Array = new Uint8Array(ab);
  if (u8Array.length < 8) return false;
  const dv = new DataView(ab);
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

// eslint-disable-next-line no-unused-vars
export function isMP4(ab) {
  return true;
}
