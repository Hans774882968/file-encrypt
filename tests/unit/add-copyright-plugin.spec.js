import { getInsertIndexes } from '../../add-copyright-plugin';

function isSorted(a) {
  for (let i = 1; i < a.length; ++i) if (a[i] < a[i - 1]) return false;
  return true;
}

describe('add-copyright-plugin.js', () => {
  it('getInsertIndexes', () => {
    expect(getInsertIndexes(10, 9)).toStrictEqual(Array(10).fill(0).map((_, i) => i));
    expect(getInsertIndexes(100000, 99999)).toStrictEqual(Array(100000).fill(0).map((_, i) => i));

    console.log(getInsertIndexes(3, 19));
    const len = getInsertIndexes(300, 1900).filter((v) => v === 1900).length;
    console.log(len);
    expect(len).toBeLessThanOrEqual(2);
    console.log(getInsertIndexes(200000, 114514).pop());
  });

  it('getInsertIndexes: sorted', () => {
    expect(isSorted(getInsertIndexes(300, 1900))).toBeTruthy();
    expect(isSorted(getInsertIndexes(200000, 114514))).toBeTruthy();
  });
});
