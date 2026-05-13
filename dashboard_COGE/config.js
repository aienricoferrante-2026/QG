/* SECTOR_CONFIG — Dashboard COGE (Conto Economico Generale)
 * Strumento trasversale che aggrega dati delle 11 BU + costi dipendenti
 * (da WeA HR) + costi indiretti Sede (data-entry manuale).
 *
 * NON è una BU operativa: è la vista direzionale Società×Sede×BU per
 * calcolare il MOL operativo per Sede da inviare ai partner.
 */
window.SECTOR_CONFIG = {
  code: 'COGE',
  label: 'COGE — Conto Economico',
  icon: '📊',
  color: '#6366f1',
  adminEmail: 'coge@qualificagroup.it',
  /* Hash SHA-256 di "256COGE321!" — accesso Master + COGE specifico */
  adminPassHash: 'TBD_GENERATE_HASH',
  /* URL dei JSON di ogni BU. La dashboard COGE li scarica tutti
     all'avvio per costruire l'aggregato Società×Sede×BU. */
  buData: {
    FOR:     '../dashboard_FOR_CM/data/commesse_for.json',
    ISO:     '../dashboard_ISO_CM/data/commesse_iso.json',
    SIC:     '../dashboard_SIC_CM/data/commesse_sic.json',
    APL_PAL: '../dashboard_APL_PAL_CM/data/commesse_apl_pal.json',
    GDPR:    '../dashboard_GDPR_CM/data/commesse_gdpr.json',
    SOA:     '../dashboard_SOA_CM/data/commesse_soa.json',
    AVV:     '../dashboard_AVV_CM/data/commesse_avv.json',
    GAR:     '../dashboard_GAR_CM/data/commesse_gar.json',
    FIA:     '../dashboard_FIA_CM/data/commesse_fia.json',
    APL_RES: '../dashboard_APL_RES_CM/data/commesse_apl_res.json',
    IST:     '../dashboard_IST_CM/data/commesse_ist.json',
  },
  buMeta: {
    FOR:     { label: 'Formazione',          color: '#10b981', icon: '🎓' },
    ISO:     { label: 'Certificazioni ISO',  color: '#3b82f6', icon: '📜' },
    SIC:     { label: 'Sicurezza Lavoro',    color: '#06b6d4', icon: '🛡️' },
    APL_PAL: { label: 'Politiche Attive',    color: '#a78bfa', icon: '💼' },
    GDPR:    { label: 'Privacy / GDPR',      color: '#ec4899', icon: '🔒' },
    SOA:     { label: 'Attestazioni SOA',    color: '#f59e0b', icon: '🏗️' },
    AVV:     { label: 'Avvalimenti',         color: '#a78bfa', icon: '🤝' },
    GAR:     { label: "Gare d'appalto",      color: '#06b6d4', icon: '🎯' },
    FIA:     { label: 'Finanza Agevolata',   color: '#fbbf24', icon: '💰' },
    APL_RES: { label: 'PAL Risorse',         color: '#10b981', icon: '👥' },
    IST:     { label: 'Istituti',            color: '#34d399', icon: '🏛️' },
  },
  /* Anno corrente di analisi (default = anno attuale). */
  defaultYear: new Date().getFullYear(),
  /* Voci di costo indiretto fisse, ordinate (form editabile). */
  vociIndirette: [
    'Affitti & locazioni',
    'Utenze (luce, gas, acqua)',
    'Telefonia & internet',
    'Materiali di consumo',
    'Manutenzioni',
    'Software & licenze',
    'Pulizie',
    'Trasferte & rappresentanza',
    'Servizi professionali esterni',
    'Spese generali (varie)',
  ],
};
