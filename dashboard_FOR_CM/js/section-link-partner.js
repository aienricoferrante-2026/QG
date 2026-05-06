/* ── Sezione Admin: Link Partner ── */

const LP_STORAGE_KEY = 'qg_partner_names_v1';

function _lpLoadLocalNames() {
  try {
    return JSON.parse(localStorage.getItem(LP_STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function _lpSaveLocalName(token, name) {
  const map = _lpLoadLocalNames();
  if (name) map[token] = name;
  else delete map[token];
  localStorage.setItem(LP_STORAGE_KEY, JSON.stringify(map));
}

function renderLinkPartner() {
  const el = document.getElementById('sec-linkPartner');
  if (!el) return;

  el.innerHTML =
    '<div class="sec"><h3 class="sec-title">Link Partner — uno per Sede</h3>' +
    '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
    'Ogni sede ha un suo URL univoco e non indovinabile. Mandalo al tuo partner: ' +
    'vedrà la dashboard identica alla tua, ma solo con i dati della sua sede. ' +
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
      const localNames = _lpLoadLocalNames();
      // Override dei nomi con quelli salvati localmente (se presenti)
      const partners = (data.partners || []).slice().map(p => {
        const local = localNames[p.token];
        return { ...p, partner: (local !== undefined && local !== '') ? local : (p.partner || '') };
      }).sort((a, b) =>
        String(a.sede || '').localeCompare(String(b.sede || ''), 'it')
      );

      let h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">';
      h += '<div style="color:var(--text2);font-size:11px">' +
           '💾 I nomi sono salvati nel tuo browser. ' +
           '<a href="javascript:void(0)" onclick="lpExportNames()" style="color:var(--accent)">Esporta come file</a> ' +
           'per condividerli su altri dispositivi (committalo poi su <code>partners/_links.json</code>).' +
           '</div>';
      h += '<button class="filter-reset" onclick="lpClearLocal()" title="Cancella tutti i nomi salvati nel browser">Reset nomi locali</button>';
      h += '</div>';

      h += '<div class="card"><div class="tbl-scroll">';
      h += '<table id="tblLinkPartner"><thead><tr>';
      h += '<th>Sede</th><th>Comm.</th><th>Partner</th><th style="min-width:280px">URL</th><th>Azioni</th>';
      h += '</tr></thead><tbody>';

      partners.forEach((p) => {
        const url = baseUrl + '?t=' + p.token;
        const sedeShort = (p.sede || '').length > 60 ? (p.sede.substring(0, 58) + '..') : p.sede;
        const partnerName = (p.partner || '').replace(/"/g, '&quot;');
        h += '<tr>';
        h += '<td title="' + p.sede.replace(/"/g, '&quot;') + '">' + sedeShort + '</td>';
        h += '<td class="text-right">' + (p.num || 0) + '</td>';
        h += '<td><input type="text" value="' + partnerName + '" placeholder="(nome partner)" ' +
             'data-token="' + p.token + '" class="lp-partner-input" ' +
             'style="width:160px;background:var(--bg2);color:var(--text);border:1px solid var(--border);padding:4px 6px;border-radius:4px;font-size:11px"></td>';
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
      h += '<li>Scrivi il <strong>nome del partner</strong> nel campo: si salva automaticamente nel tuo browser</li>';
      h += '<li>Clicca <strong>Copia</strong> e incolla il link su WhatsApp / email</li>';
      h += '<li>Il partner apre il link e vede la dashboard identica alla tua, ma solo con i dati della sua sede</li>';
      h += '<li>I nomi sono salvati nel tuo browser (localStorage). Per averli anche su altri PC, clicca "Esporta come file" e committa il JSON sul repo</li>';
      h += '<li>Quando ricarichi un nuovo Excel, ri-esegui <code style="color:var(--accent)">python3 partners/_generate.py</code>: i link rimangono uguali, si aggiornano solo i dati</li>';
      h += '</ol></div>';

      document.getElementById('lp-content').innerHTML = h;

      // Auto-save su ogni input (input event = real-time, change = blur/enter)
      document.querySelectorAll('.lp-partner-input').forEach(inp => {
        inp.addEventListener('input', () => {
          const t = inp.getAttribute('data-token');
          const newName = inp.value.trim();
          _lpSaveLocalName(t, newName);
          inp.style.borderColor = '#10b981';
          inp.title = '✓ Salvato in questo browser';
        });
        inp.addEventListener('blur', () => {
          setTimeout(() => { inp.style.borderColor = 'var(--border)'; }, 800);
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

/* Esporta _links.json con i nomi locali applicati. Scarica un file
   pronto da sostituire in partners/_links.json sul repo. */
function lpExportNames() {
  fetch('../partners/_links.json?_=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const localNames = _lpLoadLocalNames();
      const out = {
        ...data,
        partners: (data.partners || []).map(p => ({
          ...p,
          partner: (localNames[p.token] !== undefined && localNames[p.token] !== '')
            ? localNames[p.token]
            : (p.partner || '')
        }))
      };
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '_links.json';
      a.click();
      alert('Scaricato _links.json con i nomi aggiornati.\n\nPer renderli visibili a tutti, sostituisci il file nel repository:\npartners/_links.json');
    })
    .catch(err => alert('Errore export: ' + err));
}

function lpClearLocal() {
  if (!confirm('Cancellare tutti i nomi partner salvati in questo browser? I nomi del file _links.json restano.')) return;
  localStorage.removeItem(LP_STORAGE_KEY);
  renderLinkPartner();
}
