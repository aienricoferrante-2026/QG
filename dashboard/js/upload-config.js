/* Upload config — Dashboard Commesse ISO */
window.UPLOAD_CONFIG = {
  label: 'Commesse ISO',
  dataKey: 'commesse',
  githubDataPath: 'dashboard/data/commesse.json',
  numericFields: ['co', 'en', 'an', 'me'],
  fieldMap: {
    'ID': 'id', 'Tipo Commessa': 'ti', 'Contratto': 'ct', 'Cliente': 'cl',
    'Responsabile': 'rp', 'Città': 'ci', 'Citta': 'ci',
    'Stato Lavorazione': 'sl', 'Commerciale': 'ag', 'Agente': 'ag', 'Status': 'st',
    'Stato Pagamento': 'sp', 'Importo Ente': 'en', 'Importo Consulenza': 'co',
    'Stato del Certificato': 'sc', 'Provincia': 'pv', 'Regione': 'rg',
    'Data Assegnazione': '_dataAss'
  },
  buildData: function(records) {
    /* Parse date → anno/mese if present */
    records.forEach(r => {
      if (r._dataAss && (!r.an || r.an === 0)) {
        const d = String(r._dataAss);
        /* DD-MM-YYYY or DD/MM/YYYY */
        let m = d.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
        if (m) { r.an = parseInt(m[3]); r.me = parseInt(m[2]); }
        else {
          /* YYYY-MM-DD */
          m = d.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
          if (m) { r.an = parseInt(m[1]); r.me = parseInt(m[2]); }
        }
        /* JS Date object from SheetJS */
        if ((!r.an || r.an === 0) && r._dataAss instanceof Date) {
          r.an = r._dataAss.getFullYear();
          r.me = r._dataAss.getMonth() + 1;
        }
      }
      delete r._dataAss;
      if (!r.sps) r.sps = _shortPag(r.sp || '');
    });
    return _buildISO(records);
  }
};

function _shortPag(sp) {
  if (!sp) return '';
  if (sp.includes('Saldato')) return 'Saldato';
  if (sp.includes('Omaggio')) return 'Omaggio';
  if (sp.includes('Iniziare')) return 'Attesa Lav.';
  if (sp.includes('Accordi')) return 'Accordi';
  if (sp.includes('Insoluto')) return 'Insoluto Prec.';
  if (sp.includes('Acconto')) return 'Acconto';
  return sp.replace(/ \(.*\)/, '');
}

function _buildISO(records) {
  const R = {};
  /* ── KPIs ── */
  const cliSet = new Set(records.map(c => c.cl));
  const cons = records.reduce((s, c) => s + c.co, 0);
  const ente = records.reduce((s, c) => s + c.en, 0);
  const eseg = records.filter(c => c.st === 'Eseguito').length;
  const annul = records.filter(c => c.st === 'Annullato').length;
  R.kpis = {
    totale_commesse: records.length, clienti_unici: cliSet.size,
    fatt_consulenza: cons, fatt_ente: ente, fatt_totale: cons + ente,
    tasso_esecuzione: records.length ? +(eseg / records.length * 100).toFixed(1) : 0,
    tasso_annullamento: records.length ? +(annul / records.length * 100).toFixed(1) : 0,
    proforma_emesse: 0, commesse_attive: records.filter(c => c.st !== 'Eseguito' && c.st !== 'Annullato').length
  };

  /* ── Status ── */
  R.status = _groupCount(records, 'st');

  /* ── Stato Pagamento ── */
  R.stato_pagamento = _groupCount(records, 'sp');

  /* ── Trend ── */
  R.trend = _buildTrend(records);

  /* ── Agenti ── */
  R.agenti = _buildGroup(records, 'ag');
  R.responsabili = _buildGroup(records, 'rp');

  /* ── ag_trend ── */
  R.ag_trend = _buildAgTrend(records);

  /* ── Contratti ── */
  R.contratti = _buildContratti(records);

  /* ── Citta ── */
  R.citta = _buildCitta(records);

  /* ── Stati lavorazione ── */
  R.stati_lavorazione = _buildStatiLav(records);

  /* ── Stato certificato ── */
  R.stato_certificato = _groupCount(records, 'sc');

  /* ── Enti (placeholder) ── */
  R.enti = {};

  /* ── Cross-sell ── */
  const csRes = _buildCrossSell(records);
  R.cross_sell = csRes.list;
  R.cross_sell_stats = csRes.stats;

  /* ── Retention ── */
  const retRes = _buildRetention(records);
  R.retention = retRes.counts;
  R.top_returning = retRes.top;

  /* ── Aging (placeholder) ── */
  R.aging = { '0-30gg': 0, '31-90gg': 0, '91-180gg': 0, '181-365gg': 0, oltre_1anno: 0 };
  R.scadenzario = {};

  /* ── Focus 2026 ── */
  R.focus_2026 = _buildFocus2026(records);
  R.mesi_2026 = _buildMesi2026(records);
  R.yoy_q1 = _buildYoyQ1(records);

  /* ── Alert ── */
  R.alert = _buildAlert(records);

  R.cross_status_pag = {};
  R.anomalie_status_pag = [];
  R.commesse = records;
  return R;
}
