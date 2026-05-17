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
  // Riconosce il prefisso/keyword del filename. Case insensitive.
  fileRouting: [
    { match: /commesse[_-]?for\b/i,     table: 'commesse', bu: 'FOR' },
    { match: /commesse[_-]?iso\b/i,     table: 'commesse', bu: 'ISO' },
    { match: /commesse[_-]?sic\b/i,     table: 'commesse', bu: 'SIC' },
    { match: /commesse[_-]?apl[_-]?pal\b/i, table: 'commesse', bu: 'APL_PAL' },
    { match: /commesse[_-]?apl[_-]?res\b/i, table: 'commesse', bu: 'APL_RES' },
    { match: /commesse[_-]?gdpr\b/i,    table: 'commesse', bu: 'GDPR' },
    { match: /commesse[_-]?soa\b/i,     table: 'commesse', bu: 'SOA' },
    { match: /commesse[_-]?avv\b/i,     table: 'commesse', bu: 'AVV' },
    { match: /commesse[_-]?gar\b/i,     table: 'commesse', bu: 'GAR' },
    { match: /commesse[_-]?fia\b/i,     table: 'commesse', bu: 'FIA' },
    { match: /commesse[_-]?ist\b/i,     table: 'commesse', bu: 'IST' },
    { match: /offerte/i,                table: 'offerte', bu: null },
    { match: /opportunit[aà][_-]?for\b/i, table: 'opportunita_for', bu: null },
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
