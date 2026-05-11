/* ── Theme Toggle (scuro / chiaro) ──
 * Persiste in localStorage 'qg_theme'. Default: dark.
 */
(function () {
  const KEY = 'qg_theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
    const btn = document.getElementById('qg-theme-toggle');
    if (btn) {
      // Mostro l'icona del tema OPPOSTO (cosa diventerà cliccando)
      btn.textContent = theme === 'light' ? '🌙' : '☀️';
      btn.title = theme === 'light' ? 'Passa al tema scuro' : 'Passa al tema chiaro';
    }
  }

  window.qgToggleTheme = function () {
    const cur = localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
    const next = cur === 'light' ? 'dark' : 'light';
    localStorage.setItem(KEY, next);
    applyTheme(next);
    // Ricalcola charts (alcuni colori delle scale dipendono dal tema)
    if (typeof renderCurrentSection === 'function') {
      setTimeout(renderCurrentSection, 50);
    }
  };

  function installToggle() {
    if (document.getElementById('qg-theme-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'qg-theme-toggle';
    btn.className = 'qg-theme-btn';
    btn.onclick = window.qgToggleTheme;
    document.body.appendChild(btn);
    const cur = localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
    applyTheme(cur);
  }

  // Applica subito il tema salvato (anche prima del DOM ready)
  const saved = localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  if (saved === 'light') {
    // Body potrebbe non esistere ancora: gestisco entrambi i casi
    if (document.body) document.body.classList.add('theme-light');
    else document.addEventListener('DOMContentLoaded', () => document.body.classList.add('theme-light'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installToggle);
  } else {
    installToggle();
  }
})();
