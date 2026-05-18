/* Config dashboard ADMIN · Supabase qualifica-stw
   ATTENZIONE: la SERVICE_ROLE key è visibile nel sorgente lato client.
   Questa è una protezione "casual" (auth Master), non sicurezza vera.
   Per sicurezza reale serve un proxy server-side (Vercel function).
*/
window.STW_ADMIN = {
  supabaseUrl: 'https://odjwvqabxkkpyblghruv.supabase.co',
  // ANON key per le letture (RLS policy: SELECT libero)
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kand2cWFieGtrcHlibGdocnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTg3MzYsImV4cCI6MjA5NDYzNDczNn0.KGLBChnozVzuCSDtPYHVkVk7tPzBwMo6JudKDYxv8Ys',
  // SERVICE ROLE key per le scritture (esposta — protetta da auth Master)
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kand2cWFieGtrcHlibGdocnV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA1ODczNiwiZXhwIjoyMDk0NjM0NzM2fQ.haV4laiJDShga22OAshuRXcSxne1j9PO4gV8HpyHWlw',
  // Riusa l'hash Master di passwords.html
  masterUser: 'direzione@qualificagroup.it',
  masterHash: '5bb40be187baff36150a637bacf46f1b6c75eb1e51efebf6f71d6ad5c92af43a',

  // Mapping nome file Excel → tabella + BU
  // Pattern permissivi: cerca la BU come keyword OVUNQUE nel filename.
  // Es. "Export ISO 18-05.xlsx", "ISO commesse maggio.xlsx", "iso_2026.xlsx"
  // funzionano tutti. Se manca il match, l'utente può "Forza BU" manualmente.
  fileRouting: [
    // Pattern più specifici prima (per evitare falsi positivi)
    { match: /opportunit[aà][_\s-]*for/i,    table: 'opportunita_for', bu: null, label: 'Opportunità FOR' },
    { match: /\boff(erte)?\b/i,              table: 'offerte', bu: null, label: 'Offerte' },
    { match: /\bapl[_\s-]*pal\b|politiche[_\s-]*attive/i, table: 'commesse', bu: 'APL_PAL', label: 'APL_PAL' },
    { match: /\bapl[_\s-]*res\b|pal[_\s-]*risorse/i,      table: 'commesse', bu: 'APL_RES', label: 'APL_RES' },
    { match: /\biso\b|certificazion/i,       table: 'commesse', bu: 'ISO', label: 'ISO' },
    { match: /\bfor\b|formazion/i,           table: 'commesse', bu: 'FOR', label: 'FOR' },
    { match: /\bsic\b|sicurezza/i,           table: 'commesse', bu: 'SIC', label: 'SIC' },
    { match: /\bsoa\b|attestazion/i,         table: 'commesse', bu: 'SOA', label: 'SOA' },
    { match: /\bavv\b|avvaliment/i,          table: 'commesse', bu: 'AVV', label: 'AVV' },
    { match: /\bgar\b|gare/i,                table: 'commesse', bu: 'GAR', label: 'GAR' },
    { match: /\bfia\b|finanza[_\s-]*agev/i,  table: 'commesse', bu: 'FIA', label: 'FIA' },
    { match: /\bgdpr\b|privacy/i,            table: 'commesse', bu: 'GDPR', label: 'GDPR' },
    { match: /\bist\b|istitut/i,             table: 'commesse', bu: 'IST', label: 'IST' },
  ],

  // Opzioni per il selettore manuale "Forza BU" (fallback)
  manualForceOptions: [
    { table: 'commesse', bu: 'FOR',     label: 'FOR · Formazione' },
    { table: 'commesse', bu: 'ISO',     label: 'ISO · Certificazioni' },
    { table: 'commesse', bu: 'SIC',     label: 'SIC · Sicurezza' },
    { table: 'commesse', bu: 'APL_PAL', label: 'APL_PAL · Politiche Attive' },
    { table: 'commesse', bu: 'APL_RES', label: 'APL_RES · PAL Risorse' },
    { table: 'commesse', bu: 'GDPR',    label: 'GDPR · Privacy' },
    { table: 'commesse', bu: 'SOA',     label: 'SOA · Attestazioni' },
    { table: 'commesse', bu: 'AVV',     label: 'AVV · Avvalimenti' },
    { table: 'commesse', bu: 'GAR',     label: 'GAR · Gare' },
    { table: 'commesse', bu: 'FIA',     label: 'FIA · Finanza Agevolata' },
    { table: 'commesse', bu: 'IST',     label: 'IST · Istituti' },
    { table: 'offerte',          bu: null, label: 'Offerte' },
    { table: 'opportunita_for',  bu: null, label: 'Opportunità FOR' },
  ],

  // Colonne fisse per ogni tabella (le altre vanno in meta JSONB)
  fixedCols: {
    commesse: ['cliente','societa','sede','sedeNorm','sedeOp','citta','regione','indirizzo',
      'status','statoLav','avanzamento','avanzamentoRaw','statoPagamento',
      'consulenza','ricavi','mol','costi','ricaviDocum','costiDocum','molDocum',
      'ecRicaviCons','ecMolCons','ecCostiCons','giaIncassato','daIncassare',
      'finIncassiTot','finUsciteTot','finDeltaTot',
      'agente','responsabile','segnalatore','funzione','contatto',
      'dataInizio','dataPianInizio','dataFine','dataAssegnazione','dataUltimaNota',
      'contratto','idContratto','tipoCommessa','titolo','descrizione','note','ultimaNota',
      'erpLink','qnetLink'],
    offerte: ['cliente','societa','sede','sede_op','agente','segnalatore','categoria','tipo',
      'status','funzione','anno','data','data_full','totale'],
    opportunita_for: ['titolo','cliente','sede','sedeOp','operatore','rendicontazione','corso',
      'corsoInteresse','tipologiaCorso','cpi','provincia','status','statoPrev','fonte',
      'annualita','data','dataUltimaNota','ultimaNota','assegnatoA'],
  },

  dateCols: ['dataInizio','dataPianInizio','dataFine','dataAssegnazione','dataUltimaNota'],
};
