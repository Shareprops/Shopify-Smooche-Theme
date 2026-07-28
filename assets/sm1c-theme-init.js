(function () {
  try {
    var saved = localStorage.getItem('sm1c_theme');
    var theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-sm1c-theme', theme);
  } catch (e) {}
})();
