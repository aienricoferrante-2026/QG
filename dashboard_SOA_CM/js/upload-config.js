/* Upload config — Dashboard Commesse SOA */
window.UPLOAD_CONFIG = {
  label: 'Commesse SOA',
  dataKey: null,
  numericFields: ['importoEnte', 'consulenza', 'avanzamento'],
  fieldMap: {
    'ID': 'id',
    'ID Contratto': 'idContratto',
    'Cliente': 'cliente',
    'Titolo': 'titolo',
    'Indirizzo': 'indirizzo',
    'Status': 'status',
    'Stato Lavorazione': 'statoLav',
    'Data Assegnazione': 'dataAssegnazione',
    'Data Pian. Inizio': 'dataPianInizio',
    'Data Chiusura': 'dataChiusura',
    'Data Fine Presentazione': 'dataFinePres',
    'Data Fine': 'dataFine',
    'Importo Ente': 'importoEnte',
    'Importo Consulenza': 'consulenza',
    'Responsabile': 'responsabile',
    'Commerciale': 'agente',
    'Città': 'citta',
    'Citta': 'citta',
    'Avanzamento': 'avanzamentoRaw',
    'SOA Attestante': 'soaAttestante',
    'Ente Certificazione 9001': 'enteCert9001',
    'Scadenza Certificazione': 'scadenzaCert',
    'Contratto': 'contratto',
    'Societa Aziendale': 'societa',
    'Società Aziendale': 'societa',
    'Societa / Sedi': 'sede',
    'Società / Sedi': 'sede',
    'Sede Operativa': 'sedeOp',
    'Segnalatore': 'segnalatore',
    'Consorzio': 'consorzio',
    'Data Firma': 'dataFirma',
    'Ultima Nota': 'ultimaNota',
    'Data Ultima Nota': 'dataUltimaNota'
  },
  buildData: function(records) {
    records.forEach(r => {
      if (r.avanzamentoRaw && typeof r.avanzamento !== 'number') {
        const m = String(r.avanzamentoRaw).match(/(\d+)%/);
        r.avanzamento = m ? parseInt(m[1]) : 0;
      }
    });
    return records;
  }
};
