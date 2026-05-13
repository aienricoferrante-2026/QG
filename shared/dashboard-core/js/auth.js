/* ── Auth lato client (multi-settore) ──
 *
 * Barriera client-side, non protezione "vera". Su sito statico GitHub Pages
 * non c'è server, quindi chi sa leggere il JS può aggirarla. Resta utile
 * contro accessi casuali.
 *
 * Credenziali accettate (entrambe valide su qualunque dashboard sul kit):
 *  1. MASTER: direzione@qualificagroup.it / Qualifica!26
 *     Sempre valida, indipendente dal settore. È l'account di Enrico
 *     (Direzione) che lo fa entrare ovunque, FOR incluso (vedi
 *     dashboard_FOR_CM/js/auth.js che ha lo stesso schema).
 *  2. SETTORE: <sigla>@qualificagroup.it / <password specifica>
 *     Letta da SECTOR_CONFIG.adminEmail + SECTOR_CONFIG.adminPassHash.
 *     Pensata per i responsabili che usano solo "la loro" dashboard.
 *     L'elenco completo vive in passwords.html (accesso Master).
 */

(function () {
  // MASTER (sempre valido, override globale)
  const MASTER_USER = 'direzione@qualificagroup.it';
  // SHA-256("Qualifica!26")
  const MASTER_PASS_HASH = '5bb40be187baff36150a637bacf46f1b6c75eb1e51efebf6f71d6ad5c92af43a';
  // SETTORE (specifico, fallback al master se la BU non ha config dedicata)
  const ADMIN_USER = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.adminEmail) || MASTER_USER;
  const ADMIN_PASS_HASH = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.adminPassHash) || MASTER_PASS_HASH;
  const STORAGE_KEY = 'qg_admin_authed_v1';
  const STORAGE_USER = 'qg_admin_user_v1';

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function isAuthed() { return localStorage.getItem(STORAGE_KEY) === '1'; }
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
    const brand = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.label) || 'Dashboard';
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
        .qg-pwd-wrap { position: relative; }
        .qg-pwd-eye {
          position: absolute; top: 50%; right: 8px; transform: translateY(-50%);
          background: transparent; border: 0; color: #94a3b8; cursor: pointer;
          padding: 4px 6px; font-size: 14px; line-height: 1;
        }
        .qg-pwd-eye:hover { color: #f8fafc; }
        .qg-login-btn {
          width: 100%; margin-top: 20px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: white; border: none; padding: 11px;
          border-radius: 6px; font-size: 13px; font-weight: 700;
          cursor: pointer; letter-spacing: .3px;
        }
        .qg-login-btn:hover { opacity: .92; }
        .qg-login-btn:disabled { opacity: .5; cursor: wait; }
        .qg-login-err { color: #f87171; font-size: 11px; margin-top: 12px; text-align: center; min-height: 14px; }
        .qg-login-hint { color: #64748b; font-size: 10px; margin-top: 18px; text-align: center; line-height: 1.5; }
      </style>
      <form class="qg-login-card" id="qg-login-form" autocomplete="on">
        <div class="qg-login-brand">
          <h2>Qualifica Group · ${brand}</h2>
          <p>Accesso riservato</p>
        </div>
        <label for="qg-user">Email</label>
        <input id="qg-user" name="username" type="email" autocomplete="username" required>
        <label for="qg-pass">Password</label>
        <div class="qg-pwd-wrap">
          <input id="qg-pass" name="password" type="password" autocomplete="current-password" required style="padding-right:36px">
          <button type="button" class="qg-pwd-eye" id="qg-pass-eye" title="Mostra/nascondi password" tabindex="-1">👁</button>
        </div>
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
      try {
        if (!window.isSecureContext || !window.crypto || !crypto.subtle) {
          throw new Error('Browser senza crypto.subtle: apri il sito via HTTPS.');
        }
        const hash = await sha256(p);
        const isMaster = (u === MASTER_USER && hash === MASTER_PASS_HASH);
        const isSector = (u === ADMIN_USER && hash === ADMIN_PASS_HASH);
        console.log('[auth] user=' + u + ' isMaster=' + isMaster + ' isSector=' + isSector);
        if (isMaster || isSector) {
          setAuthed(u);
          ov.style.transition = 'opacity .25s';
          ov.style.opacity = '0';
          setTimeout(() => { ov.remove(); installLogoutBtn(); }, 260);
          return;
        }
        errEl.textContent = 'Credenziali non valide. Email accettate: ' + MASTER_USER + (ADMIN_USER !== MASTER_USER ? ' o ' + ADMIN_USER : '');
        document.getElementById('qg-pass').select();
      } catch (ex) {
        console.error('[auth] login error', ex);
        errEl.textContent = 'Errore: ' + ex.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Entra';
      }
    });

    /* Toggle show/hide della password. */
    const eyeBtn = document.getElementById('qg-pass-eye');
    if (eyeBtn) {
      eyeBtn.addEventListener('click', () => {
        const p = document.getElementById('qg-pass');
        if (!p) return;
        const show = p.type === 'password';
        p.type = show ? 'text' : 'password';
        eyeBtn.textContent = show ? '🙈' : '👁';
        eyeBtn.title = show ? 'Nascondi password' : 'Mostra password';
      });
    }

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
    btn.innerHTML =
      '<span class="qg-user-email">👤 ' + userEmail + '</span>' +
      '<button onclick="window.qgLogout()">Esci</button>';
    /* Si integra dentro .header (in-flow), così rimane in cima alla pagina
       insieme al titolo invece di fluttuare sopra il contenuto. */
    const header = document.querySelector('.header');
    if (header) header.appendChild(btn);
    else document.body.appendChild(btn);
  }

  window.qgLogout = function () { clearAuth(); location.reload(); };
  window.qgIsAdmin = isAuthed;

  function boot() {
    if ((window.SECTOR_CONFIG && window.SECTOR_CONFIG.requireAuth === false)) return;
    if (isAuthed()) installLogoutBtn();
    else buildOverlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
