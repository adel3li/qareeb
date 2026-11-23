// Applies the saved appearance before the first paint, so the page does not flash
// in the wrong theme or text size. The app applies the same settings afterwards
// (src/app/theme.ts). Reads qareeb:settings:v1 only; writes nothing.
(function () {
  try {
    var raw = localStorage.getItem('qareeb:settings:v1');
    if (!raw) return;
    var s = (JSON.parse(raw) || {}).state || {};
    var root = document.documentElement;
    if (s.theme === 'light' || s.theme === 'dark') root.setAttribute('data-theme', s.theme);
    if (typeof s.fontScale === 'number' && s.fontScale >= 14 && s.fontScale <= 24) root.style.fontSize = s.fontScale + 'px';
  } catch (e) {
    /* storage unavailable: defaults apply */
  }
})();
