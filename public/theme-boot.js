// Applies the saved theme and text size to <html> before the first paint,
// so a dark-theme user never sees a light flash. Mirrors src/app/useAppearance.ts.
(function () {
  try {
    var raw = localStorage.getItem('qareeb:settings:v1');
    if (!raw) return;
    var s = JSON.parse(raw).state || {};
    if (s.theme === 'light' || s.theme === 'dark') document.documentElement.setAttribute('data-theme', s.theme);
    if (typeof s.fontScale === 'number' && s.fontScale >= 14 && s.fontScale <= 24) document.documentElement.style.fontSize = s.fontScale + 'px';
  } catch (e) {}
})();
