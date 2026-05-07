/* ── Auth lato client (barriera contro accessi casuali) ──
 *
 * NOTA: questa è una barriera client-side, NON una protezione "vera".
 * Su sito statico GitHub Pages non c'è server, quindi chi sa leggere il
 * codice JavaScript può aggirare il login. Resta utile per impedire
 * accessi casuali a chi capita sull'URL senza essere autorizzato.
 */

(function () {
  const ADMIN_USER = 'formazione@qualificagroup.it';
  // SHA-256("qualifica2026!")
  const ADMIN_PASS_HASH = '7ec091a1468dd7c2e54e7d042f24a5588f5fdecd8751502878fd15f53112f82e';
  const STORAGE_KEY = 'qg_admin_authed_v1';
  const STORAGE_USER = 'qg_admin_user_v1';

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function isAuthed() {
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  function setAuthed(user) {
    localStorage.setItem(STORAGE_KEY, '1');
    localStorage.setItem(STORAGE_USER, user || '');
  }

  function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER);
  }

  function buildOverlay() {
    if (document.getElementById('qg-login-overlay')) return;
    const ov = document.createElement('div');
    ov.id = 'qg-login-overlay';
    ov.innerHTML = `
      <style>
        #qg-login-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .qg-login-card {
          background: #1e293b; border: 1px solid #334155;
          border-radius: 12px; padding: 36px 40px; width: 360px;
          box-shadow: 0 24px 64px rgba(0,0,0,.45);
        }
        .qg-login-brand { text-align: center; margin-bottom: 22px; }
        .qg-login-brand h2 { color: #f8fafc; font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .qg-login-brand p { color: #94a3b8; font-size: 11px; }
        .qg-login-card label { color: #cbd5e1; font-size: 11px; font-weight: 600; display: block; margin-bottom: 5px; margin-top: 12px; text-transform: uppercase; letter-spacing: .3px; }
        .qg-login-card input {
          width: 100%; padding: 10px 12px;
          background: #0f172a; border: 1px solid #334155;
          color: #f8fafc; border-radius: 6px; font-size: 13px;
          outline: none; transition: border-color .15s;
        }
        .qg-login-card input:focus { border-color: #6366f1; }
        .qg-login-btn {
          width: 100%; margin-top: 20px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: white; border: none; padding: 11px;
          border-radius: 6px; font-size: 13px; font-weight: 700;
          cursor: pointer; letter-spacing: .3px;
        }
        .qg-login-btn:hover { opacity: .92; }
        .qg-login-btn:disabled { opacity: .5; cursor: wait; }
        .qg-login-err {
          color: #f87171; font-size: 11px; margin-top: 12px;
          text-align: center; min-height: 14px;
        }
        .qg-login-hint {
          color: #64748b; font-size: 10px; margin-top: 18px;
          text-align: center; line-height: 1.5;
        }
      </style>
      <form class="qg-login-card" id="qg-login-form" autocomplete="on">
        <div class="qg-login-brand">
          <h2>Qualifica Group · Dashboard Admin</h2>
          <p>Accesso riservato</p>
        </div>
        <label for="qg-user">Email</label>
        <input id="qg-user" name="username" type="email" autocomplete="username" required>
        <label for="qg-pass">Password</label>
        <input id="qg-pass" name="password" type="password" autocomplete="current-password" required>
        <button type="submit" class="qg-login-btn" id="qg-login-btn">Entra</button>
        <div class="qg-login-err" id="qg-login-err"></div>
        <div class="qg-login-hint">Sessione salvata su questo browser. Per uscire: pulsante "Esci" in alto.</div>
      </form>
    `;
    document.body.appendChild(ov);

    const form = document.getElementById('qg-login-form');
    const errEl = document.getElementById('qg-login-err');
    const btn = document.getElementById('qg-login-btn');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Verifico…';
      const u = (document.getElementById('qg-user').value || '').trim().toLowerCase();
      const p = document.getElementById('qg-pass').value || '';
      const hash = await sha256(p);
      if (u === ADMIN_USER && hash === ADMIN_PASS_HASH) {
        setAuthed(u);
        ov.style.transition = 'opacity .25s';
        ov.style.opacity = '0';
        setTimeout(() => {
          ov.remove();
          installLogoutBtn();
        }, 260);
      } else {
        errEl.textContent = 'Credenziali non valide.';
        btn.disabled = false;
        btn.textContent = 'Entra';
        document.getElementById('qg-pass').select();
      }
    });

    setTimeout(() => {
      const u = document.getElementById('qg-user');
      if (u) u.focus();
    }, 100);
  }

  function installLogoutBtn() {
    if (document.getElementById('qg-logout-btn')) return;
    const userEmail = localStorage.getItem(STORAGE_USER) || '';
    const btn = document.createElement('div');
    btn.id = 'qg-logout-btn';
    btn.innerHTML = `
      <style>
        #qg-logout-btn {
          position: fixed; top: 12px; right: 56px; z-index: 9999;
          display: flex; align-items: center; gap: 8px;
          background: rgba(15,23,42,.75); backdrop-filter: blur(8px);
          border: 1px solid rgba(99,102,241,.3);
          padding: 6px 10px; border-radius: 18px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          font-size: 11px; color: #cbd5e1;
        }
        /* Bottone Esci uguale in dark e light: l'header è sempre scuro */
        #qg-logout-btn .qg-user-email { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #qg-logout-btn button {
          background: transparent; border: 1px solid #475569;
          color: #cbd5e1; padding: 3px 9px; border-radius: 12px;
          cursor: pointer; font-size: 10px;
        }
        #qg-logout-btn button:hover { background: #ef4444; border-color: #ef4444; color: white; }
      </style>
      <span class="qg-user-email">👤 ${userEmail}</span>
      <button onclick="window.qgLogout()">Esci</button>
    `;
    document.body.appendChild(btn);
  }

  window.qgLogout = function () {
    clearAuth();
    location.reload();
  };

  // Boot: se non autenticato, mostra overlay e blocca interazione finché non logga
  function boot() {
    if (isAuthed()) {
      installLogoutBtn();
    } else {
      buildOverlay();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
