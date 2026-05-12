/* SECTOR_CONFIG — Settore GDPR — Privacy / GDPR
 * Generato da tools/build_sector_dashboards.py.
 * Modifiche manuali fatte qui sopravvivono finché non si rigenera.
 */
window.SECTOR_CONFIG = {
  "code": "GDPR",
  "label": "Privacy / GDPR",
  "icon": "🔒",
  "color": "#ec4899",
  "dataFile": "data/commesse_gdpr.json",
  "adminEmail": "formazione@qualificagroup.it",
  "defaultSection": "executive",
  "partnersJsonUrl": "partners_gdpr/_links.json",
  "partnersBaseUrl": "partners_gdpr/view.html",
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
      "id": "fGdprStatoPag",
      "key": "gdprStatoPag",
      "label": "Stato Pagamento",
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
      "id": "fSede",
      "key": "sedeNorm",
      "label": "Sede",
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
    },
    {
      "id": "fFunzione",
      "key": "funzione",
      "label": "Funzione",
      "ph": "Tutte"
    }
  ],
  "extraSections": [
    "pagamentiGdpr"
  ]
};
