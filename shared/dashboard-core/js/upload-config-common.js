/* ── Upload Excel · config generico per le BU sul kit ──
   Definisce window.UPLOAD_CONFIG con il fieldMap dei 45 campi standard
   prodotti da tools/convert_sectors.py. Le BU possono estendere via
   SECTOR_CONFIG:
     uploadExtraFieldMap     → mappature extra Excel→json (es. SOA)
     uploadExtraNumericFields → campi extra numerici
     uploadGithubDataPath     → percorso JSON per il download
   Questo file va incluso DOPO config.js della BU e PRIMA di shared/upload.js. */

(function () {
  const sectorCfg = window.SECTOR_CONFIG || {};
  const code = (sectorCfg.code || 'GEN').toLowerCase();
  const label = sectorCfg.label || 'Commesse';

  /* Mappa base Excel→JSON, allineata ai campi del kit (45 comuni). */
  const baseFieldMap = {
    'ID': 'id',
    'Id Commessa': 'id',
    'ID Contratto': 'idContratto',
    'Id Contratto': 'idContratto',
    'Contratto': 'contratto',
    'Societa Aziendale': 'societa',
    'Società Aziendale': 'societa',
    'Societa / Sedi': 'sede',
    'Società / Sedi': 'sede',
    'Sede Operativa': 'sedeOp',
    'Sede': 'sede',
    'Funzione aziendale': 'funzione',
    'Funzione Aziendale': 'funzione',
    'Cliente': 'cliente',
    'Regione': 'regione',
    'Responsabile': 'responsabile',
    'Contatto': 'contatto',
    'Titolo': 'titolo',
    'Descrizione': 'descrizione',
    'Indirizzo': 'indirizzo',
    'Note': 'note',
    'Città': 'citta',
    'Citta': 'citta',
    'Status': 'status',
    'Stato Lavorazione': 'statoLav',
    'Tipo Commessa': 'tipoCommessa',
    'Agente': 'agente',
    'Segnalatore': 'segnalatore',
    'Data Inizio': 'dataInizio',
    'Data Fine': 'dataFine',
    'Data Pian. Inizio': 'dataPianInizio',
    'Data Pianificata Inizio': 'dataPianInizio',
    'Data Assegnazione': 'dataAssegnazione',
    'Ultima Nota': 'ultimaNota',
    'Data Ultima Nota': 'dataUltimaNota',
    'Importo Consulenza': 'consulenza',
    'Consulenza': 'consulenza',
    'Ricavi': 'ricavi',
    'Totale Ricavi': 'ricavi',
    'Costi': 'costi',
    'Totale Costi': 'costi',
    'MOL': 'mol',
    'MOL Effettivo': 'mol',
    'Importo Ente': 'ente',
    'Ente': 'ente',
    'Avanzamento': 'avanzamentoRaw',
    'Discenti': 'discenti',
    'Num. Discenti': 'discenti',
    'Ore': 'ore',
    'Ore Formazione': 'ore',
    'Totale Ore': 'ore',
    'Anticipo Importo': 'anticipoImporto',
    'Saldo Importo': 'saldoImporto',
    'Totale Ricavo': 'totRicavo',
    'Totale Ricevuto Regione': 'totRicevutoRegione',
    'Già Incassato': 'giaIncassato',
    'Da Incassare': 'daIncassare',
    'Euro Residuo': 'euroResiduo',
    'Stato Pagamento': 'statoPagamento',
    '€': 'statoPagamento',
    'Link ERP': 'erpLink',
    'Link Commessa': 'qnetLink',
    /* Budget Commessa (Cons / Doc / Fin) — uguali a FOR */
    'Ec. Ricavi Cons.': 'ecRicaviCons',
    'Ec. Costi Cons.': 'ecCostiCons',
    'Ec. MOL Cons.': 'ecMolCons',
    'Ricavi Documentali': 'ricaviDocum',
    'Costi Documentali': 'costiDocum',
    'MOL Documentale': 'molDocum',
    '% Avanzamento Ec.': 'pctAvanzEc',
    '% Ricavi Economici': 'pctRicaviEc',
    '% Costi Economici': 'pctCostiEc',
    '% MOL Economico': 'pctMolEc',
    'Fin. Incassi Tot.': 'finIncassiTot',
    'Fin. Uscite Tot.': 'finUsciteTot',
    'Fin. Delta Tot.': 'finDeltaTot'
  };

  const baseNumericFields = [
    'consulenza', 'ricavi', 'costi', 'mol', 'ente', 'ore',
    'avanzamento', 'discenti', 'anticipoImporto', 'saldoImporto',
    'totRicavo', 'totRicevutoRegione', 'giaIncassato', 'daIncassare', 'euroResiduo',
    'ecRicaviCons', 'ecCostiCons', 'ecMolCons',
    'ricaviDocum', 'costiDocum', 'molDocum',
    'pctAvanzEc', 'pctRicaviEc', 'pctCostiEc', 'pctMolEc',
    'finIncassiTot', 'finUsciteTot', 'finDeltaTot'
  ];

  /* Merge con extra dalla BU. */
  const fieldMap = Object.assign({}, baseFieldMap, sectorCfg.uploadExtraFieldMap || {});
  const numericFields = baseNumericFields.concat(sectorCfg.uploadExtraNumericFields || []);

  function normalizeSede(sedeOp, citta) {
    if (!sedeOp) return '';
    const txt = String(sedeOp).trim();
    let cit = (citta || '').trim();
    if (!cit) {
      const m = txt.match(/[-–]\s*([^-–]+?)\s*$/);
      if (m) cit = m[1].trim().replace(/^\d+\s*-?\s*/, '').trim();
    }
    if (!cit) return txt;
    if (cit === cit.toUpperCase() || cit === cit.toLowerCase()) {
      cit = cit.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());
    }
    return cit + ' - ' + txt;
  }

  window.UPLOAD_CONFIG = {
    label: label,
    dataKey: null,
    githubDataPath: sectorCfg.uploadGithubDataPath ||
      ('dashboard_' + (sectorCfg.code || 'GEN') + '_CM/data/commesse_' + code + '.json'),
    numericFields: numericFields,
    fieldMap: fieldMap,
    buildData: function (records) {
      records.forEach(r => {
        /* Avanzamento numerico da "XX%". */
        if (r.avanzamentoRaw && !r.avanzamento) {
          const m = String(r.avanzamentoRaw).match(/(\d+)%/);
          r.avanzamento = m ? parseInt(m[1]) : 0;
        }
        /* sedeNorm = "Città - Sede Operativa" (stesso pattern di FOR). */
        r.sedeNorm = normalizeSede(r.sedeOp, r.citta);
        /* Alias erpLink ↔ qnetLink. */
        if (r.qnetLink && !r.erpLink) r.erpLink = r.qnetLink;
        if (r.erpLink && !r.qnetLink) r.qnetLink = r.erpLink;
        /* Fallback finIncassiTot da Totale Ricevuto Regione. */
        if (!r.finIncassiTot && r.totRicevutoRegione) r.finIncassiTot = r.totRicevutoRegione;
        /* Hook per estensioni BU (es. ISO parsing Titolo, SOA scadenze). */
        if (typeof sectorCfg.uploadRecordHook === 'function') sectorCfg.uploadRecordHook(r);
      });
      return records;
    }
  };
})();
