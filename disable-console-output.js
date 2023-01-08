(() => {
  Object.entries(window.console).forEach(([k, v]) => {
    if (typeof v === 'function') {
      window.console[k] = () => {};
    }
  });
})();
