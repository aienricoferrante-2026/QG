/* SECTOR_CONFIG — Settore AVV — Avvalimenti
 * Generato da tools/build_sector_dashboards.py.
 * Modifiche manuali fatte qui sopravvivono finché non si rigenera.
 */
window.SECTOR_CONFIG = {
  "code": "AVV",
  "label": "Avvalimenti",
  "icon": "🤝",
  "color": "#a78bfa",
  "dataFile": "data/commesse_avv.json",
  "adminEmail": "avv@qualificagroup.it",
  "adminPassHash": "ef8b41fbadc535e58755bee0db8857c3b35ef898a784065540a0822d906e06a5",
  "defaultSection": "executive",
  "partnersJsonUrl": "partners_avv/_links.json",
  "partnersBaseUrl": "partners_avv/view.html",
  "targetsFile": "data/targets.json",
  "filters": [
    {
      "id": "fStatus",
      "key": "status",
      "label": "Status",
      "ph": "Tutti"
    },
    {
      "id": "fStatoLav",
      "key": "statoLav",
      "label": "Stato Lavorazione",
      "ph": "Tutti"
    },
    {
      "id": "fAvvCategoria",
      "key": "avvCategoria",
      "label": "Categoria SOA",
      "ph": "Tutte",
      "splitBy": " + "
    },
    {
      "id": "fAvvTipo",
      "key": "avvTipo",
      "label": "Tipo Avvalimento",
      "ph": "Tutti"
    },
    {
      "id": "fAvvAnno",
      "key": "avvAnno",
      "label": "Anno",
      "ph": "Tutti"
    },
    {
      "id": "fCliente",
      "key": "cliente",
      "label": "Cliente",
      "ph": "Tutti"
    },
    {
      "id": "fSocieta",
      "key": "societa",
      "label": "Societa",
      "ph": "Tutte"
    },
    {
      "id": "fRegione",
      "key": "regione",
      "label": "Regione",
      "ph": "Tutte"
    },
    {
      "id": "fResp",
      "key": "responsabile",
      "label": "Responsabile",
      "ph": "Tutti"
    }
  ],
  "extraSections": [
    "avvalimenti"
  ]
};
