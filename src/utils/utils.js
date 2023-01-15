export function getLineMaxLength(s) {
  return s.split('\n').reduce((ans, text) => Math.max(ans, text.length), 0);
}
