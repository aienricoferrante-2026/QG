/* ── Helper "Audit Stato Classificazione" del kit ──────────────
 * Riusabile da tutte le sezioni Caso 2 con parser titolo.
 * Aggiunge una card "🔍 Stato classificazione" che mostra:
 *   1. % copertura: quanti titoli sono classificati / totale
 *   2. Top 20 titoli "Altro" (non riconosciuti) con count
 *   3. Lista sigle attualmente riconosciute
 *   4. Suggerimento "aggiungi questa sigla al parser"
 *
 * USO (in section-XXX.js del Caso 2 BU):
 *   buildParserAuditCard({
 *     containerId: 'sec-sicurezza',
 *     classify: c => _sicClassify(c.titolo),  // ritorna { tipi[], aree[] }
 *     filtered: filtered,
 *     buLabel: 'SIC',
 *     knownSigle: SIC_TIPI.map(t => t.id),
 *     paramName: 'Tipologia',
 *     hint: 'Aggiungi la sigla in SIC_TIPI dentro section-sicurezza.js',
 *   });
 *
 * Il "classify" è la funzione che dato un record ritorna tipi[] e aree[].
 * Se tipi.length === 0 → è in "Altro" (non classificato).
 */

function buildParserAuditCard(opts) {
  const {
    containerId, classify, filtered: f, buLabel,
    knownSigle, paramName = 'Tipologia', hint = '', extraTokens = null,
  } = opts;

  const root = document.getElementById(containerId);
  if (!root) return;

  // Conta classificate vs non classificate + raccogli titoli "Altro"
  let classified = 0;
  const altroByTitle = {};
  const altroByToken = {};
  f.forEach(c => {
    const cl = classify(c);
    if (cl.tipi && cl.tipi.length > 0) {
      classified++;
    } else {
      // Normalizza il titolo per il count (rimuove _N finale e numeri di duplicato)
      const baseT = String(c.titolo || '(vuoto)').replace(/_\d+$/, '').trim() || '(vuoto)';
      altroByTitle[baseT] = (altroByTitle[baseT] || 0) + 1;
      // Estrai token unici nei titoli non classificati (per suggerire nuove sigle)
      const toks = String(c.titolo || '').split(/[_+\s.,;:/]+/).filter(Boolean);
      toks.forEach(t => {
        const up = t.toUpperCase().replace(/^\d+/, '');
        if (up && up.length >= 2 && !/^\d+$/.test(up) && up !== 'SIC' && up !== 'COM' && up !== 'BU') {
          altroByToken[up] = (altroByToken[up] || 0) + 1;
        }
      });
    }
  });
  const tot = f.length;
  const pct = tot ? (classified / tot * 100) : 0;
  const altroCnt = tot - classified;

  const topTitles = Object.entries(altroByTitle).sort((a, b) => b[1] - a[1]).slice(0, 20);
  // Token candidati per nuove sigle: esclude quelli già conosciuti
  const knownSet = new Set((knownSigle || []).map(s => s.toUpperCase()));
  const candidateTokens = Object.entries(altroByToken)
    .filter(([t]) => !knownSet.has(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const auditId = 'parserAudit-' + buLabel;
  // Rimuovi card esistente se già renderizzata
  const old = document.getElementById(auditId);
  if (old) old.remove();

  const card = document.createElement('div');
  card.id = auditId;
  card.className = 'card';
  card.style.cssText = 'margin-top:14px;border-left:3px solid ' + (pct >= 90 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#dc2626');

  const color = pct >= 90 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#dc2626';
  let h = '<h4 style="color:' + color + '">🔍 Stato classificazione · ' + buLabel + '</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:10px">' +
       'La classificazione per ' + paramName + ' è generata <b>al volo dal codice</b> (parser regex sul titolo), ' +
       'NON è un campo di Qnet. Più alta è la copertura, più affidabili sono i numeri.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 12px 0">';
  h += '<div class="kpi green"><div class="kpi-label">Classificate</div><div class="kpi-value">' + fmt(classified) + '</div><div class="kpi-sub">' + pct.toFixed(1) + '% del totale</div></div>';
  const cls2 = altroCnt > 0 ? 'red' : 'green';
  h += '<div class="kpi ' + cls2 + '"><div class="kpi-label">In "Altro"</div><div class="kpi-value">' + fmt(altroCnt) + '</div><div class="kpi-sub">non riconosciute dal parser</div></div>';
  h += '<div class="kpi blue"><div class="kpi-label">Sigle note</div><div class="kpi-value">' + fmt((knownSigle || []).length) + '</div><div class="kpi-sub">in parser</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Sigle candidate</div><div class="kpi-value">' + fmt(candidateTokens.length) + '</div><div class="kpi-sub">da valutare aggiunta</div></div>';
  h += '</div>';

  if (topTitles.length) {
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';
    h += '<div><h5 style="color:var(--text2);font-size:11px;margin-bottom:8px">📝 Top titoli "Altro" (non classificati)</h5>';
    h += '<table class="audit-tbl" style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>' +
         '<th style="text-align:left;padding:6px;border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">Titolo</th>' +
         '<th style="text-align:right;padding:6px;border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">N</th>' +
         '</tr></thead><tbody>';
    topTitles.forEach(([t, n]) => {
      h += '<tr><td style="padding:5px;border-bottom:1px solid var(--border);color:var(--text)">' +
           t.substring(0, 70) + '</td><td style="text-align:right;padding:5px;border-bottom:1px solid var(--border);color:var(--text2);font-weight:600">' + n + '</td></tr>';
    });
    h += '</tbody></table></div>';

    h += '<div><h5 style="color:var(--text2);font-size:11px;margin-bottom:8px">🔧 Sigle candidate da aggiungere al parser</h5>';
    if (candidateTokens.length) {
      h += '<table class="audit-tbl" style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>' +
           '<th style="text-align:left;padding:6px;border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">Token</th>' +
           '<th style="text-align:right;padding:6px;border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">Occorrenze</th>' +
           '</tr></thead><tbody>';
      candidateTokens.forEach(([t, n]) => {
        h += '<tr><td style="padding:5px;border-bottom:1px solid var(--border);color:var(--text)"><code style="background:rgba(99,102,241,.08);padding:1px 5px;border-radius:3px">' +
             t + '</code></td><td style="text-align:right;padding:5px;border-bottom:1px solid var(--border);color:var(--text2);font-weight:600">' + n + '</td></tr>';
      });
      h += '</tbody></table>';
      if (hint) {
        h += '<p style="color:var(--text3);font-size:10px;margin-top:8px;font-style:italic">💡 ' + hint + '</p>';
      }
    } else {
      h += '<p style="color:var(--text3);font-size:11px;padding:14px;background:rgba(16,185,129,.05);border-radius:4px">' +
           '✓ Nessun nuovo token candidato. Le sigle conosciute coprono tutti i titoli non-Altro.</p>';
    }
    h += '</div></div>';
  } else {
    h += '<p style="color:#10b981;text-align:center;padding:20px;background:rgba(16,185,129,.05);border-radius:5px">' +
         '✓ <b>Copertura 100%</b>: tutti i titoli sono classificati.</p>';
  }

  h += '<p style="color:var(--text3);font-size:10px;margin-top:12px;padding:8px 10px;background:rgba(99,102,241,.04);border-radius:4px;line-height:1.5">' +
       '<b>Come migliorare la copertura:</b> 1) Identifica nei token candidati le sigle ricorrenti che dovrebbero essere classificate. ' +
       '2) Aggiungi la sigla nel file <code>section-' + buLabel.toLowerCase() + '*.js</code> dentro l\'array delle regex. ' +
       '3) Indica la macro-area di appartenenza. 4) Push e la dashboard ricalcolerà automaticamente.</p>';

  card.innerHTML = h;
  root.querySelector('.sec').appendChild(card);
}
