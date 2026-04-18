/* ── Info Tooltip: mostra come è calcolato un KPI ── */

// Mappa dei KPI: label → { formula, breakdown, fields }
const INFO_KPI = {
  ricavi: {
    label: 'Ricavi Totali',
    formula: 'Σ consulenza',
    descrizione: 'Somma del campo "Importo Consulenza" (JSON: <code>consulenza</code>) di tutte le commesse filtrate.',
    field: 'consulenza',
    type: 'sum'
  },
  costi: {
    label: 'Costi Totali',
    formula: 'Σ costi',
    descrizione: 'Somma del campo "Totale Costi" (JSON: <code>costi</code>) di tutte le commesse filtrate.',
    field: 'costi',
    type: 'sum'
  },
  mol: {
    label: 'MOL (Margine Operativo Lordo)',
    formula: 'Σ mol = Σ (consulenza − costi)',
    descrizione: 'Somma del campo "MOL Effettivo" (JSON: <code>mol</code>). Dovrebbe coincidere con Ricavi − Costi.',
    field: 'mol',
    type: 'sum',
    check: f => f.reduce((s, c) => s + (c.consulenza || 0) - (c.costi || 0), 0)
  },
  margine: {
    label: 'Margine %',
    formula: 'MOL ÷ Ricavi × 100',
    descrizione: 'Rapporto tra MOL e Ricavi, espresso in percentuale.',
    type: 'calc',
    calc: f => {
      const r = f.reduce((s, c) => s + (c.consulenza || 0), 0);
      const m = f.reduce((s, c) => s + (c.mol || 0), 0);
      return { value: r ? (m / r * 100) : 0, parts: [{ label: 'MOL', val: fmtE(m) }, { label: 'Ricavi', val: fmtE(r) }, { label: 'Risultato', val: (r ? (m / r * 100) : 0).toFixed(2) + ' %' }] };
    }
  },
  ore: {
    label: 'Ore Totali',
    formula: 'Σ ore',
    descrizione: 'Somma del campo "Totale Ore" (JSON: <code>ore</code>) di tutte le commesse filtrate.',
    field: 'ore',
    type: 'sum-int'
  },
  ricavoOra: {
    label: 'Ricavo / Ora',
    formula: 'Ricavi ÷ Ore',
    descrizione: 'Ricavo medio per ora di lavoro: totale ricavi diviso totale ore.',
    type: 'calc',
    calc: f => {
      const r = f.reduce((s, c) => s + (c.consulenza || 0), 0);
      const o = f.reduce((s, c) => s + (c.ore || 0), 0);
      return { value: o ? (r / o) : 0, parts: [{ label: 'Ricavi', val: fmtE(r) }, { label: 'Ore', val: fmt(o) }, { label: 'Risultato', val: fmtE(o ? r / o : 0) }] };
    }
  },
  costoOra: {
    label: 'Costo / Ora',
    formula: 'Costi ÷ Ore',
    descrizione: 'Costo medio per ora di lavoro: totale costi diviso totale ore.',
    type: 'calc',
    calc: f => {
      const cc = f.reduce((s, c) => s + (c.costi || 0), 0);
      const o = f.reduce((s, c) => s + (c.ore || 0), 0);
      return { value: o ? (cc / o) : 0, parts: [{ label: 'Costi', val: fmtE(cc) }, { label: 'Ore', val: fmt(o) }, { label: 'Risultato', val: fmtE(o ? cc / o : 0) }] };
    }
  },
  giaIncassato: {
    label: 'Già Incassato',
    formula: 'Σ giaIncassato',
    descrizione: 'Somma del campo "Già Incassato" (JSON: <code>giaIncassato</code>). Rappresenta quanto è stato effettivamente ricevuto in cassa.',
    field: 'giaIncassato',
    type: 'sum'
  },
  daIncassare: {
    label: 'Da Incassare',
    formula: 'Σ daIncassare',
    descrizione: 'Somma del campo "Da Incassare" (JSON: <code>daIncassare</code>). Rappresenta il credito ancora aperto secondo l\'ERP.',
    field: 'daIncassare',
    type: 'sum'
  },
  anticipi: {
    label: 'Anticipi Ricevuti',
    formula: 'Σ anticipoImporto',
    descrizione: 'Somma del campo "Anticipo Importo" (JSON: <code>anticipoImporto</code>). Anticipi ricevuti prima del saldo.',
    field: 'anticipoImporto',
    type: 'sum'
  },
  saldi: {
    label: 'Saldi da Ricevere',
    formula: 'Σ saldoImporto',
    descrizione: 'Somma del campo "Saldo Importo" (JSON: <code>saldoImporto</code>). Saldo residuo dopo eventuali anticipi.',
    field: 'saldoImporto',
    type: 'sum'
  },
  ricevutoRegione: {
    label: 'Ricevuto da Regione',
    formula: 'Σ totRicevutoRegione',
    descrizione: 'Somma del campo "Totale Ricevuto Regione" (JSON: <code>totRicevutoRegione</code>). Contributi pubblici erogati.',
    field: 'totRicevutoRegione',
    type: 'sum'
  },
  esposizione: {
    label: 'Esposizione (Credito Aperto)',
    formula: 'Ricavi − Già Incassato',
    descrizione: 'Differenza tra totale ricavi e quanto già incassato. Rappresenta l\'esposizione finanziaria aperta verso i clienti.',
    type: 'calc',
    calc: f => {
      const r = f.reduce((s, c) => s + (c.consulenza || 0), 0);
      const i = f.reduce((s, c) => s + (c.giaIncassato || 0), 0);
      return { value: r - i, parts: [{ label: 'Ricavi', val: fmtE(r) }, { label: 'Già Incassato', val: fmtE(i) }, { label: 'Risultato', val: fmtE(r - i) }] };
    }
  }
};

function showInfo(key) {
  const cfg = INFO_KPI[key];
  if (!cfg) { alert('Info non disponibili per ' + key); return; }
  const f = filtered;

  let html = '<div style="padding:4px">';
  html += '<div style="background:rgba(59,130,246,.08);border-left:3px solid var(--accent);padding:10px 12px;border-radius:4px;margin-bottom:12px">';
  html += '<div style="font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px">Formula</div>';
  html += '<div style="font-family:monospace;font-size:13px;color:var(--accent);font-weight:600">' + cfg.formula + '</div>';
  html += '</div>';

  html += '<p style="color:var(--text2);font-size:12px;margin-bottom:14px;line-height:1.5">' + cfg.descrizione + '</p>';

  if (cfg.type === 'sum' || cfg.type === 'sum-int') {
    const field = cfg.field;
    const vals = f.map(c => ({ id: c.id, val: (c[field] || 0), cliente: (c.cliente || '').replace(/_FOR/g, '').trim(), corso: c.corso, societa: c.societa }));
    const tot = vals.reduce((s, v) => s + v.val, 0);
    const conVal = vals.filter(v => v.val !== 0).length;
    const zero = f.length - conVal;
    const top = vals.filter(v => v.val > 0).sort((a, b) => b.val - a.val).slice(0, 10);
    const neg = vals.filter(v => v.val < 0);

    html += '<div class="row3" style="margin-bottom:14px">';
    html += '<div class="card" style="padding:10px"><div style="font-size:10px;color:var(--text2)">RISULTATO</div><div style="font-size:18px;font-weight:700;color:var(--green)">' + (cfg.type === 'sum-int' ? fmt(tot) : fmtE(tot)) + '</div></div>';
    html += '<div class="card" style="padding:10px"><div style="font-size:10px;color:var(--text2)">COMMESSE CONTRIBUENTI</div><div style="font-size:18px;font-weight:700">' + fmt(conVal) + '</div><div style="font-size:10px;color:var(--text3)">di ' + fmt(f.length) + ' filtrate</div></div>';
    html += '<div class="card" style="padding:10px"><div style="font-size:10px;color:var(--text2)">COMMESSE A ZERO</div><div style="font-size:18px;font-weight:700;color:' + (zero > 0 ? 'var(--orange)' : 'var(--text2)') + '">' + fmt(zero) + '</div><div style="font-size:10px;color:var(--text3)">' + pct(zero, f.length) + '</div></div>';
    html += '</div>';

    if (cfg.check) {
      const checkVal = cfg.check(f);
      const diff = Math.abs(tot - checkVal);
      const ok = diff < 0.01;
      html += '<div style="padding:8px 12px;border-radius:4px;margin-bottom:12px;background:' + (ok ? 'rgba(16,185,129,.08)' : 'rgba(245,158,11,.08)') + ';border-left:3px solid ' + (ok ? 'var(--green)' : 'var(--orange)') + '">';
      html += '<strong style="font-size:12px">Verifica coerenza</strong><br>';
      html += '<span style="font-size:11px;color:var(--text2)">Σ mol = ' + fmtE(tot) + ' vs Σ (consulenza - costi) = ' + fmtE(checkVal) + ' &rarr; diff: ' + fmtE(diff) + ' ' + (ok ? '✓' : '⚠') + '</span>';
      html += '</div>';
    }

    if (neg.length > 0) {
      html += '<div style="padding:8px 12px;border-radius:4px;margin-bottom:12px;background:rgba(245,158,11,.08);border-left:3px solid var(--orange)">';
      html += '<strong style="font-size:12px">⚠ ' + neg.length + ' commesse con valore negativo</strong>';
      html += '</div>';
    }

    html += '<h4 style="font-size:12px;margin-bottom:8px;color:var(--text2)">Top 10 commesse contribuenti</h4>';
    html += '<div style="max-height:350px;overflow-y:auto"><table style="width:100%;font-size:11px"><thead><tr><th>ID</th><th>Società</th><th>Cliente</th><th>Corso</th><th class="text-right">Valore</th><th class="text-right">% sul tot</th></tr></thead><tbody>';
    top.forEach(v => {
      html += '<tr><td>#' + v.id + '</td><td>' + ((v.societa || '').substring(0, 30)) + '</td><td>' + ((v.cliente || '').substring(0, 25)) + '</td><td>' + ((v.corso || '').substring(0, 40)) + '</td><td class="text-right">' + (cfg.type === 'sum-int' ? fmt(v.val) : fmtE(v.val)) + '</td><td class="text-right" style="color:var(--text3)">' + pct(v.val, tot) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  } else if (cfg.type === 'calc') {
    const r = cfg.calc(f);
    html += '<div class="card" style="padding:10px;margin-bottom:12px"><div style="font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px">RISULTATO</div><div style="font-size:22px;font-weight:700;color:var(--green)">' + (typeof r.value === 'number' ? (key === 'margine' ? r.value.toFixed(2) + ' %' : fmtE(r.value)) : r.value) + '</div></div>';
    html += '<h4 style="font-size:12px;margin-bottom:8px;color:var(--text2)">Passaggi del calcolo</h4>';
    html += '<table style="width:100%;font-size:12px"><tbody>';
    r.parts.forEach((p, i) => {
      const isLast = i === r.parts.length - 1;
      html += '<tr style="' + (isLast ? 'border-top:1px solid var(--border);font-weight:700;color:var(--accent)' : '') + '"><td style="padding:6px 8px">' + p.label + '</td><td style="padding:6px 8px;text-align:right;font-family:monospace">' + p.val + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  html += '<div style="margin-top:14px;padding:10px;background:var(--card2);border-radius:4px;font-size:11px;color:var(--text2)">';
  html += '<strong>Filtri attualmente attivi:</strong> ' + fmt(f.length) + ' commesse su ' + fmt(D.length) + ' totali.</div>';

  html += '</div>';

  openModal('<span style="color:var(--accent);font-size:18px;margin-right:6px">&#9432;</span> ' + cfg.label, html);
}

function infoIcon(key) {
  return '<span onclick="event.stopPropagation();showInfo(\'' + key + '\')" title="Come è calcolato questo valore?" style="cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:rgba(59,130,246,.15);color:var(--accent);font-size:11px;margin-left:4px;font-weight:700;line-height:1;vertical-align:middle">i</span>';
}
