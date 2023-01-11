import { dec, enc, getDecryptedU8Array } from '@/utils/bin';
import { isLegalHCTFFile } from '@/utils/fileJudge';

describe('bin.js', () => {
  it('bin/dec()', () => {
    const u8Array1 = new Uint8Array([0x68, 0x63, 0x74, 0x66, 0x04, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 0x68, 0x63, 0x74, 0x66]);
    const decryptedData1 = getDecryptedU8Array(u8Array1.buffer);
    expect(decryptedData1).toEqual(new Uint8Array([0, 0, 0, 0]));

    const u8Array2 = new Uint8Array([0x68, 0x63, 0x74, 0x66, 0x04, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 1, 2, 3]);
    const decryptedData2 = getDecryptedU8Array(u8Array2.buffer);
    expect(decryptedData2).toEqual(new Uint8Array([0x68 ^ 1, 0x63 ^ 2, 0x74 ^ 3]));

    const u8Array3 = new Uint8Array([0x68, 0x63, 0x74, 0x66, 0x05, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 0x03]);
    const decryptedData3 = getDecryptedU8Array(u8Array3.buffer);
    expect(decryptedData3).toEqual(new Uint8Array([]));
  });

  it('fileJudge/isLegalHCTFFile()', () => {
    const arr = [
      [0x68, 0x63, 0x74],
      [0x68, 0x63, 0x74, 0x05],
      [0x68, 0x63, 0x74, 0x66, 0x05],
      [0x68, 0x63, 0x74, 0x66, 0x05, 0x00, 0x00, 0x00, 0x00],
    ];
    arr.forEach((a) => {
      const u8Array = new Uint8Array(a);
      const fl = isLegalHCTFFile(u8Array.buffer);
      expect(fl).toBeFalsy();
    });
    const brr = [
      [0x68, 0x63, 0x74, 0x66, 0x04, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 0x68, 0x63, 0x74, 0x66],
      [0x68, 0x63, 0x74, 0x66, 0x04, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 1, 2, 3],
      [0x68, 0x63, 0x74, 0x66, 0x05, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 0x03],
    ];
    brr.forEach((a) => {
      const u8Array = new Uint8Array(a);
      const fl = isLegalHCTFFile(u8Array.buffer);
      expect(fl).toBeTruthy();
    });
  });

  it('bin/dec() base', async () => {
    const ab = new Uint8Array([0x68, 0x63, 0x74, 0x66, 0x05, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 0x03, 0x1, 0x2, 0x3]).buffer;
    const { decryptResultData } = dec(ab);
    expect(decryptResultData).toEqual(new Uint8Array([0x1 ^ 0x68, 0x2 ^ 0x63, 0x3 ^ 0x74]));
  });

  it('enc() and dec()', async () => {
    const u8Array = new Uint8Array([0x68, 0x63, 0x74, 0x66, 0x05, 0, 0, 0, 0x68, 0x63, 0x74, 0x66, 0x03, 0x11, 0x45, 0x14, 0x19, 0x19, 0x81, 0]);
    const ab = u8Array.buffer;
    const { encryptResultData } = enc(ab, Buffer.from('这是一个密钥key'), 10);
    const encArrayBuffer = encryptResultData.buffer;
    const { decryptResultData: decryptResultData1 } = dec(encArrayBuffer, 10);
    expect(decryptResultData1).toEqual(u8Array);
    const { decryptResultData: decryptResultData2 } = dec(decryptResultData1.buffer, 1);
    expect(decryptResultData2).toEqual(new Uint8Array([0x11 ^ 0x68, 0x45 ^ 0x63, 0x14 ^ 0x74, 0x19 ^ 0x66, 0x19 ^ 0x03, 0x81 ^ 0x68, 0x63]));
  });
});
