/* Upload config — Dashboard Commesse Formazione */
window.UPLOAD_CONFIG = {
  label: 'Commesse Formazione',
  dataKey: null,
  numericFields: ['consulenza', 'ricavi', 'costi', 'mol', 'ente', 'ore',
    'avanzamento', 'discenti', 'anticipoImporto', 'saldoImporto',
    'totRicavo', 'totRicevutoRegione', 'giaIncassato', 'daIncassare', 'euroResiduo'],
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
    'Totale Ricevuto Regione': 'totRicevutoRegione',
    'Già Incassato': 'giaIncassato',
    'Da Incassare': 'daIncassare',
    'Euro Residuo': 'euroResiduo',
    'Ultima Nota': 'ultimaNota',
    'Data Ultima Nota': 'dataUltimaNota',
    'Link ERP': 'erpLink'
  },
  buildData: function(records) {
    records.forEach(r => {
      if (r.avanzamentoRaw && !r.avanzamento) {
        const m = String(r.avanzamentoRaw).match(/(\d+)%/);
        r.avanzamento = m ? parseInt(m[1]) : 0;
      }
    });
    return records;
  }
};
