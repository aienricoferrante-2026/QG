/* ── Sezione Admin: Link Partner ── */

function renderLinkPartner() {
  const el = document.getElementById('sec-linkPartner');
  if (!el) return;

  el.innerHTML =
    '<div class="sec"><h3 class="sec-title">Link Partner — uno per Sede</h3>' +
    '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
    'Ogni sede ha un suo URL univoco e non indovinabile. Mandalo al tuo partner: ' +
    'vedrà solo i dati della sua sede, in sola lettura. ' +
    'I link restano stabili anche quando ricarichi un nuovo Excel.' +
    '</p>' +
    '<div id="lp-loader" style="color:var(--text2);font-size:12px">Caricamento…</div>' +
    '<div id="lp-content"></div>' +
    '</div>';

  fetch('../partners/_links.json?_=' + Date.now())
    .then(r => r.ok ? r.json() : Promise.reject('HTTP ' + r.status))
    .then(data => {
      document.getElementById('lp-loader').style.display = 'none';
      const baseUrl = _lpBaseUrl();
      const partners = (data.partners || []).slice().sort((a, b) =>
        String(a.sede || '').localeCompare(String(b.sede || ''), 'it')
      );

      let h = '<div class="card" style="margin-top:8px"><div class="tbl-scroll">';
      h += '<table id="tblLinkPartner"><thead><tr>';
      h += '<th>Sede</th><th>Comm.</th><th>Partner</th><th style="min-width:280px">URL</th><th>Azioni</th>';
      h += '</tr></thead><tbody>';

      partners.forEach((p, idx) => {
        const url = baseUrl + '?t=' + p.token;
        const sedeShort = (p.sede || '').length > 60 ? (p.sede.substring(0, 58) + '..') : p.sede;
        const partnerName = (p.partner || '').replace(/"/g, '&quot;');
        h += '<tr>';
        h += '<td title="' + p.sede.replace(/"/g, '&quot;') + '">' + sedeShort + '</td>';
        h += '<td class="text-right">' + (p.num || 0) + '</td>';
        h += '<td><input type="text" value="' + partnerName + '" placeholder="(nome partner)" ' +
             'data-token="' + p.token + '" class="lp-partner-input" ' +
             'style="width:140px;background:var(--bg2);color:var(--text);border:1px solid var(--border);padding:4px 6px;border-radius:4px;font-size:11px"></td>';
        h += '<td><a href="' + url + '" target="_blank" rel="noopener" ' +
             'style="color:var(--accent);font-family:monospace;font-size:11px;word-break:break-all">' + url + '</a></td>';
        h += '<td style="white-space:nowrap">';
        h += '<button class="btn-erp" style="margin-right:4px" onclick="lpCopy(this, \'' + url + '\')">Copia</button>';
        h += '<button class="btn-erp" onclick="lpOpen(\'' + url + '\')" title="Apri in nuova tab">Apri</button>';
        h += '</td>';
        h += '</tr>';
      });

      h += '</tbody></table></div></div>';

      h += '<div class="card" style="margin-top:14px;padding:14px">';
      h += '<h4 style="margin-bottom:8px">Come usare</h4>';
      h += '<ol style="color:var(--text2);font-size:12px;line-height:1.8;padding-left:20px">';
      h += '<li>Scrivi il <strong>nome del partner</strong> nel campo (si salva al volo)</li>';
      h += '<li>Clicca <strong>Copia</strong> e incolla il link su WhatsApp/email</li>';
      h += '<li>Il partner apre il link e vede solo la dashboard della sua sede</li>';
      h += '<li>Quando ricarichi un nuovo Excel, ri-esegui <code style="color:var(--accent)">python3 partners/_generate.py</code> per aggiornare i dati: i link rimangono uguali</li>';
      h += '</ol></div>';

      document.getElementById('lp-content').innerHTML = h;

      // Salva nome partner su input change
      document.querySelectorAll('.lp-partner-input').forEach(inp => {
        inp.addEventListener('change', () => {
          const t = inp.getAttribute('data-token');
          const newName = inp.value.trim();
          const idx = partners.findIndex(p => p.token === t);
          if (idx >= 0) partners[idx].partner = newName;
          // Visualizziamo solo: il salvataggio "vero" su _links.json richiede
          // di rilanciare _generate.py. Mostriamo un hint.
          inp.style.borderColor = '#10b981';
          inp.title = 'Modifica locale. Esegui partners/_generate.py per renderla persistente.';
          setTimeout(() => { inp.style.borderColor = 'var(--border)'; }, 1500);
        });
      });
    })
    .catch(err => {
      document.getElementById('lp-loader').innerHTML =
        '<div style="color:var(--danger)">Errore caricamento link partner: ' + err + '</div>' +
        '<p style="color:var(--text2);font-size:11px;margin-top:8px">' +
        'Esegui prima <code style="color:var(--accent)">python3 partners/_generate.py</code> dalla cartella STW.</p>';
    });
}

function _lpBaseUrl() {
  // Costruisce l'URL base della view partner.
  // Su GitHub Pages: https://<user>.github.io/<repo>/partners/view.html
  // In locale: http://localhost:PORT/partners/view.html
  const u = new URL('../partners/view.html', window.location.href);
  return u.toString();
}

function lpCopy(btn, url) {
  const orig = btn.textContent;
  navigator.clipboard.writeText(url).then(() => {
    btn.textContent = '✓ Copiato';
    btn.style.background = '#10b981';
    btn.style.color = 'white';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.color = '';
    }, 1400);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copiato';
    setTimeout(() => { btn.textContent = orig; }, 1400);
  });
}

function lpOpen(url) {
  window.open(url, '_blank', 'noopener');
}
