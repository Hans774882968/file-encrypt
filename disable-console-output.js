/* eslint-disable no-proto */
(() => {
  Object.entries(console).forEach(([k, originalFunction]) => {
    if (typeof originalFunction !== 'function') return;
    const emptyFunc = function () {};
    if (emptyFunc.__proto__) {
      emptyFunc.__proto__ = originalFunction.bind(originalFunction);
    } else {
      Object.setPrototypeOf(emptyFunc, originalFunction.bind(originalFunction));
    }
    emptyFunc.toString = originalFunction.toString.bind(originalFunction);
    console[k] = emptyFunc;
  });
})();
