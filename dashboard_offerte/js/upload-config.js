/* Upload config — Dashboard Offerte */
window.UPLOAD_CONFIG = {
  label: 'Offerte',
  dataKey: null, // D is a flat array
  numericFields: ['totale', 'anno'],
  fieldMap: {
    'ID': 'id',
    'Data': 'data',
    'Anno': 'anno',
    'Cliente': 'cliente',
    'Commerciale': 'agente',
    'Tipo': 'tipo',
    'Totale': 'totale',
    'Status': 'status',
    'Categoria': 'categoria',
    'Societa Aziendale': 'societa',
    'Società Aziendale': 'societa',
    'Societa / Sedi': 'sede',
    'Società / Sedi': 'sede',
    'Sede Operativa': 'sede_op',
    'Funzione aziendale': 'funzione',
    'Segnalatore': 'segnalatore'
  },
  buildData: function(records) {
    records.forEach(r => {
      if (!r.anno && r.data) {
        const m = String(r.data).match(/(\d{4})/);
        if (m) r.anno = parseInt(m[1]);
      }
      if (!r.data_full && r.data) r.data_full = r.data;
    });
    return records;
  }
};
