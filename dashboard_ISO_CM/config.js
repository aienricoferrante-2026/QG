/* SECTOR_CONFIG — Settore ISO — Certificazioni ISO
 * Generato da tools/build_sector_dashboards.py.
 * Modifiche manuali fatte qui sopravvivono finché non si rigenera.
 */
window.SECTOR_CONFIG = {
  "code": "ISO",
  "label": "Certificazioni ISO",
  "icon": "📜",
  "color": "#3b82f6",
  "dataFile": "data/commesse_iso.json",
  "adminEmail": "iso@qualificagroup.it",
  "adminPassHash": "82613189a48bbd580f43cda212078e94f328c8970b63bf9d766ff713dc2b6c51",
  "defaultSection": "executive",
  "partnersJsonUrl": "partners_iso/_links.json",
  "partnersBaseUrl": "partners_iso/view.html",
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
      "id": "fIsoStandard",
      "key": "isoStandard",
      "label": "Standard",
      "ph": "Tutti",
      "splitBy": " + "
    },
    {
      "id": "fIsoTipoAudit",
      "key": "isoTipoAudit",
      "label": "Tipo Audit",
      "ph": "Tutti",
      "splitBy": " + "
    },
    {
      "id": "fIsoEnte",
      "key": "isoEnte",
      "label": "Ente",
      "ph": "Tutti"
    },
    {
      "id": "fIsoStatoCert",
      "key": "isoStatoCert",
      "label": "Stato Certificato",
      "ph": "Tutti"
    },
    {
      "id": "fIsoStatoPag",
      "key": "isoStatoPagamentoTxt",
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
    "enti",
    "audit",
    "certificati",
    "pagamenti",
    "scopo"
  ]
};
