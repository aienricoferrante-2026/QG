/* ── Sezione: Link Partner (admin) — versione core ──
 * Mostra la lista dei link delle mini-dashboard partner per ogni Sede.
 * Sorgente: SECTOR_CONFIG.partnersJsonUrl (default 'partners/_links.json').
 * Se il file non esiste, mostra placeholder "non ancora generati".
 */

function renderLinkPartner() {
  const el = document.getElementById('sec-linkPartner');
  if (!el) return;
  const cfg = window.SECTOR_CONFIG || {};
  const url = cfg.partnersJsonUrl || 'partners/_links.json';

  let h = '<div class="sec"><h3 class="sec-title">Link Partner — Mini-dashboard per Sede</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Pagina riservata admin. Ogni sede ha una mini-dashboard accessibile via token URL.</p>';
  h += '<div id="lp-content"><p style="color:var(--text2);font-size:11px">Caricamento…</p></div>';
  h += '</div>';
  el.innerHTML = h;

  const cont = document.getElementById('lp-content');
  fetch(url)
    .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(data => {
      const entries = Object.entries(data || {});
      if (!entries.length) {
        cont.innerHTML = '<p style="color:var(--text2);padding:14px">Nessun partner generato ancora per questo settore.</p>';
        return;
      }
      let html = '<div class="card"><div class="tbl-scroll"><table id="tblPartners"><thead><tr>';
      html += '<th>Token</th><th>Sede</th><th>Partner</th><th>Comm.</th><th>Link</th></tr></thead><tbody>';
      entries.sort((a, b) => (a[1].sede || '').localeCompare(b[1].sede || ''));
      entries.forEach(([token, info]) => {
        const link = (cfg.partnersBaseUrl || 'partners/view.html') + '?t=' + encodeURIComponent(token);
        const partnerName = localStorage.getItem('qg_partner_name_' + token) || (info.partner || '');
        html += '<tr>';
        html += '<td><code style="font-size:10px">' + token + '</code></td>';
        html += '<td>' + (info.sede || '') + '</td>';
        html += '<td><input type="text" value="' + (partnerName || '').replace(/"/g, '&quot;') + '" style="width:160px;padding:4px;background:var(--bg);border:1px solid var(--border);color:var(--text);font-size:11px;border-radius:4px" oninput="window.qgPartnerSave(\'' + token + '\', this.value)"></td>';
        html += '<td>' + (info.num || 0) + '</td>';
        html += '<td><a class="btn-erp" href="' + link + '" target="_blank">Apri &#8599;</a> ';
        html += '<button class="btn-erp" onclick="window.qgCopy(\'' + location.origin + location.pathname.replace(/[^/]+$/, '') + link + '\', this)">Copia URL</button></td>';
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
      cont.innerHTML = html;
    })
    .catch(() => {
      cont.innerHTML = '<div class="card"><p style="color:var(--text2);padding:20px;text-align:center">Mini-dashboard partner non ancora generate per questo settore.<br><span style="color:var(--text3);font-size:11px">Eseguire <code>python3 partners/_generate.py --sector ' + (cfg.code || 'XXX') + '</code> per crearle.</span></p></div>';
    });
}

window.qgPartnerSave = function (token, name) {
  if (name && name.trim()) localStorage.setItem('qg_partner_name_' + token, name.trim());
  else localStorage.removeItem('qg_partner_name_' + token);
};
window.qgCopy = function (text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const old = btn.textContent;
    btn.textContent = 'Copiato ✓';
    setTimeout(() => { btn.textContent = old; }, 1500);
  });
};
