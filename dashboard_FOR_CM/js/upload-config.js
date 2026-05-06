/* Upload config — Dashboard Commesse Formazione (V7) */
window.UPLOAD_CONFIG = {
  label: 'Commesse Formazione',
  dataKey: null,
  githubDataPath: 'dashboard_FOR_CM/data/commesse_for.json',
  numericFields: ['consulenza', 'ricavi', 'costi', 'mol', 'ente', 'ore',
    'avanzamento', 'discenti', 'anticipoImporto', 'saldoImporto',
    'totRicavo', 'totRicevutoRegione', 'giaIncassato', 'daIncassare', 'euroResiduo',
    'ed', 'anticipoDecreto', 'saldoDecreto',
    'ecRicaviCons', 'ecCostiCons', 'ecMolCons',
    'ricaviDocum', 'costiDocum', 'molDocum',
    'pctAvanzEc', 'pctRicaviEc', 'pctCostiEc', 'pctMolEc',
    'finIncassiTot', 'finUsciteTot', 'finDeltaTot'],
  fieldMap: {
    'ID': 'id',
    'ID Contratto': 'idContratto',
    'Contratto': 'contratto',
    'Societa Aziendale': 'societa',
    'Società Aziendale': 'societa',
    'Societa / Sedi': 'sede',
    'Società / Sedi': 'sede',
    'Sede Operativa': 'sedeOp',
    'Funzione aziendale': 'funzione',
    'Cliente': 'cliente',
    'Regione': 'regione',
    'Responsabile': 'responsabile',
    'Corso': 'corso',
    'Titolo': 'titolo',
    'Città': 'citta',
    'Citta': 'citta',
    'Codice Classe': 'codClasse',
    'Stato Classe': 'statoClasse',
    'Status': 'status',
    'Stato corso di formazione': 'statoCorso',
    'Stato Lavorazione': 'statoLav',
    'Data Inizio': 'dataInizio',
    'Data Fine': 'dataFine',
    'Data Pian. Inizio': 'dataPianInizio',
    'Data Esame': 'dataEsame',
    'Data Assegnazione': 'dataAssegnazione',
    'Importo Consulenza': 'consulenza',
    'Ricavi': 'ricavi',
    'Costi': 'costi',
    'MOL': 'mol',
    'Importo Ente': 'ente',
    'Ore Formazione': 'ore',
    'Ore': 'ore',
    'Avanzamento': 'avanzamentoRaw',
    'Discenti': 'discenti',
    'Anticipo Importo': 'anticipoImporto',
    'Saldo Importo': 'saldoImporto',
    'Totale Ricavo': 'totRicavo',
    'Totale Ricavi': 'ricavi',
    'Totale Costi': 'costi',
    'MOL Effettivo': 'mol',
    'Totale Ore': 'ore',
    'Num. Discenti': 'discenti',
    'Totale Ricevuto Regione': 'totRicevutoRegione',
    'Già Incassato': 'giaIncassato',
    'Da Incassare': 'daIncassare',
    'Euro Residuo': 'euroResiduo',
    'Euro Residuo Effettivo': 'euroResiduo',
    'Ultima Nota': 'ultimaNota',
    'Data Ultima Nota': 'dataUltimaNota',
    'Link ERP': 'erpLink',
    /* ── Campi V6 ── */
    'Tipo Commessa': 'tipoCommessa',
    'Stato Corso': 'statoCorso',
    'Agente': 'agente',
    'Segnalatore': 'segnalatore',
    'Contatto': 'contatto',
    'Descrizione': 'descrizione',
    'Indirizzo': 'indirizzo',
    'Note': 'note',
    '€': 'statoPagamento',
    'ED': 'ed',
    'Anticipo Id. Richiesta': 'anticipoIdRichiesta',
    'Anticipo Data Richiesta': 'anticipoDataRichiesta',
    'Anticipo € da Decreto': 'anticipoDecreto',
    'Anticipo Data Accredito': 'anticipoDataAccredito',
    'Anticipo Decreto Numero e Data': 'anticipoDecretoNum',
    'Saldo Id Richiesta': 'saldoIdRichiesta',
    'Saldo Data Richiesta': 'saldoDataRichiesta',
    'Saldo € da Decreto': 'saldoDecreto',
    'Saldo Data Accredito': 'saldoDataAccredito',
    'Saldo Decreto Numero e Data': 'saldoDecretoNum',
    /* ── Nuovi campi V7 (Budget Commessa) ── */
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
    'Fin. Delta Tot.': 'finDeltaTot',
    'Link Commessa': 'qnetLink'
  },
  buildData: function(records) {
    records.forEach(r => {
      // Avanzamento numerico da "XX%"
      if (r.avanzamentoRaw && !r.avanzamento) {
        const m = String(r.avanzamentoRaw).match(/(\d+)%/);
        r.avanzamento = m ? parseInt(m[1]) : 0;
      }
      // Sede normalizzata: "Città - Indirizzo"
      r.sedeNorm = window.UPLOAD_CONFIG._normalizeSede(r.sedeOp, r.citta);
      // Fin. Incassi Tot. → fallback su Totale Ricevuto Regione
      if (!r.finIncassiTot && r.totRicevutoRegione) {
        r.finIncassiTot = r.totRicevutoRegione;
      }
      // Alias erpLink ↔ qnetLink
      if (r.qnetLink && !r.erpLink) r.erpLink = r.qnetLink;
      if (r.erpLink && !r.qnetLink) r.qnetLink = r.erpLink;
    });
    return records;
  },
  _normalizeSede: function(sedeOp, citta) {
    if (!sedeOp) return '';
    const txt = String(sedeOp).trim();
    let cit = (citta || '').trim();
    if (!cit) {
      const m = txt.match(/[-–]\s*([^-–]+?)\s*$/);
      if (m) {
        cit = m[1].trim().replace(/^\d+\s*-?\s*/, '').trim();
      }
    }
    if (!cit) return txt;
    if (cit === cit.toUpperCase() || cit === cit.toLowerCase()) {
      cit = cit.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());
    }
    return cit + ' - ' + txt;
  }
};
