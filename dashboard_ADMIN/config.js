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
  masterHash: '5d0c7eb2cd5d037414c60dd85ebecf987d74953c6fec5e724191b91117171329',

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

  /* Mappa header XLSX umano (italiano, come Qnet esporta in Excel) → chiave
     camelCase usata dal DB / dalle dashboard. Senza questa mappa, un Excel
     "vero" finisce tutto nel meta JSONB e le colonne fisse del DB restano
     vuote → le dashboard non vedono i dati. I JSON Qnet hanno già chiavi
     camelCase e bypassano.

     Struttura:
       columnAliases       → mapping comune a TUTTE le BU
       columnAliasesByBu   → override BU-specifici (es. 'Data Inizio Lavorazione'
                             è 'isoDataInizioLav' per ISO ma 'aplDataInizioLav'
                             per APL_RES). I per-BU vincono sui comuni. */
  columnAliases: {
    // === Anagrafica / identificativi ===
    'ID': 'id',
    'Titolo': 'titolo',
    'Contratto': 'contratto',
    'ID Contratto': 'idContratto',
    'Tipo Commessa': 'tipoCommessa',
    'Cliente': 'cliente',
    'Società / Sedi': 'societa',
    'Società Aziendale': 'societa',
    'Sede': 'sede',
    'Sede Operativa': 'sedeOp',
    'Città': 'citta',
    'Regione': 'regione',
    'Indirizzo': 'indirizzo',
    'Funzione aziendale': 'funzione',
    'Funzione': 'funzione',
    // === Status e workflow ===
    'Status': 'status',
    'Stato Lavorazione': 'statoLav',
    'Stato Corso': 'statoCorso',
    'Stato Classe': 'statoClasse',
    'Stato Pagamento': 'statoPagamento',
    'Avanzamento': 'avanzamento',
    // === Economici fissi (colonne DB) ===
    'Importo Consulenza': 'consulenza',
    'Totale Ricavi': 'ricavi',
    'Totale Ricavo': 'ricavi',
    'Totale Costi': 'costi',
    'MOL Effettivo': 'mol',
    'Ricavi Documentali': 'ricaviDocum',
    'Costi Documentali': 'costiDocum',
    'MOL Documentale': 'molDocum',
    'Ec. Ricavi Cons.': 'ecRicaviCons',
    'Ec. Costi Cons.': 'ecCostiCons',
    'Ec. MOL Cons.': 'ecMolCons',
    'Già Incassato': 'giaIncassato',
    'Da Incassare': 'daIncassare',
    'Fin. Incassi Tot.': 'finIncassiTot',
    'Fin. Uscite Tot.': 'finUsciteTot',
    'Fin. Delta Tot.': 'finDeltaTot',
    // === Economici meta (% Ec.) — vanno in meta JSONB ===
    '% Avanzamento Ec.': 'pctAvanzEc',
    '% Ricavi Economici': 'pctRicaviEc',
    '% Costi Economici': 'pctCostiEc',
    '% MOL Economico':   'pctMolEc',
    'Importo Ente':      'ente',
    // === Persone ===
    'Agente': 'agente',
    'Responsabile': 'responsabile',
    'Segnalatore': 'segnalatore',
    'Contatto': 'contatto',
    // === Date ===
    'Data Inizio': 'dataInizio',
    'Data Pian. Inizio': 'dataPianInizio',
    'Data Fine': 'dataFine',
    'Data Assegnazione': 'dataAssegnazione',
    'Data Ultima Nota': 'dataUltimaNota',
    'Ultima Nota': 'ultimaNota',
    // === Free text / link ===
    'Descrizione': 'descrizione',
    'Note': 'note',
    'Link Commessa': 'qnetLink',
    // === FOR-specifici (in meta) ===
    'Corso': 'corso',
    'Codice Classe': 'codClasse',
    'Totale Ore': 'ore',
    'ED': 'ed',
    'Data Esame': 'dataEsame',
    'Euro Residuo Effettivo': 'euroResiduo',
    'Num. Discenti': 'numDiscenti',
    'Totale Ricevuto Regione': 'totRicevutoRegione',
    'Anticipo Importo': 'anticipoImporto',
    'Anticipo Id. Richiesta': 'anticipoIdRichiesta',
    'Anticipo Data Richiesta': 'anticipoDataRichiesta',
    'Anticipo € da Decreto': 'anticipoDecreto',
    'Anticipo Data Accredito': 'anticipoDataAccredito',
    'Anticipo Decreto Numero e Data': 'anticipoDecretoNum',
    'Saldo Importo': 'saldoImporto',
    'Saldo Id Richiesta': 'saldoIdRichiesta',
    'Saldo Data Richiesta': 'saldoDataRichiesta',
    'Saldo € da Decreto': 'saldoDecreto',
    'Saldo Data Accredito': 'saldoDataAccredito',
    'Saldo Decreto Numero e Data': 'saldoDecretoNum',
    // === OFFERTE ===
    'Opportunità': 'opportunita',
    'Categoria': 'categoria',
    'Tipo': 'tipo',
    'Anno': 'anno',
    'Data': 'data',
    'Data Contratto': 'dataContratto',
    'Totale': 'totale',
    'Rifiuto': 'rifiuto',
    // === OPP_FOR (opportunità formazione GOL) ===
    'Operatore': 'operatore',
    'CPI': 'cpi',
    'Provincia': 'provincia',
    'Corso di interesse': 'corsoInteresse',
    'Tipologia Corso': 'tipologiaCorso',
    'Fonte': 'fonte',
    'Stato Preventivo': 'statoPrev',
    'Stato': 'status',
    'Rendicontazione': 'rendicontazione',
    'Annualità': 'annualita',
    'Nome': 'nome',
    'Cognome': 'cognome',
    'Telefono': 'telefono',
    'Email': 'email',
    'Codice Fiscale': 'codiceFiscale',
    'Codice fiscale': 'codiceFiscale',
  },

  /* Override per BU. Per le colonne con nome italiano identico ma mapping
     diverso a seconda della BU (es. "Data Inizio Lavorazione" diventa
     isoDataInizioLav per ISO ma aplDataInizioLav per APL_RES).
     Le voci qui dentro vincono su columnAliases. */
  columnAliasesByBu: {
    ISO: {
      'Ente di Riferimento': 'isoEnte',
      'Scopo proposto': 'isoScopoProposto',
      'Scopo in uscita': 'isoScopoUscita',
      'Stato del Certificato': 'isoStatoCert',
      'Urgenza emissione': 'isoUrgenza',
      'Settore': 'isoSettore',
      'Intervista in sede': 'isoIntervistaSede',
      'Ore Lavorazione': 'isoOreLav',
      'Data Inizio Lavorazione': 'isoDataInizioLav',
      'Data Fine Lavorazione': 'isoDataFineLav',
      'Data Verifica': 'isoDataVerifica',
      'Data Ultima Chiamata': 'isoDataUltimaChiamata',
      'Accordo sui Pagamenti': 'isoAccordoPagamenti',
    },
    APL_RES: {
      'Data Inizio Lavorazione': 'aplDataInizioLav',
      'Data Fine Lavorazione': 'aplDataFineLav',
      'Numero Risorse': 'aplNumeroRisorse',
      'Profilo Risorse': 'aplProfilo',
    },
    SOA: {
      'Soa Attestante': 'soaAttestante',
      'SOA Attestante': 'soaAttestante',
      'Appartenenza Consorzio': 'consorzioFlag',
      'Nome del Consorzio': 'consorzio',
      "Nome dell'Ente di Certiifcazione 9001": 'enteCert9001',
      'Scadenza Ente di Certiifcazione 9001': 'scadenzaCert',
    },
    GAR: {
      'Protocollo': 'garProtocollo',
      'Data Inserimento': 'garDataInserimento',
      'Importo Gara': 'garImporto',
      'CIG': 'garCIG',
      'Data scadenza': 'garDataScadenza',
      'Ente Appaltante': 'garEnte',
      'Esito': 'garEsito',
      'Note Esito': 'garNoteEsito',
      'Oggetto': 'garOggetto',
      'Categoria e Classe Servizi': 'garCategoria',
    },
    FIA: {
      // FIA usa gli stessi campi gara di GAR
      'Protocollo': 'garProtocollo',
      'Data Inserimento': 'garDataInserimento',
      'Importo Gara': 'garImporto',
      'CIG': 'garCIG',
      'Data scadenza': 'garDataScadenza',
      'Ente Appaltante': 'garEnte',
      'Esito': 'garEsito',
      'Note Esito': 'garNoteEsito',
    },
    AVV: {
      'CIG': 'avvCIG',
      'Categoria': 'avvCategoria',
      'Classifica': 'avvClassifica',
      'Tipo': 'avvTipo',
      'Anno': 'avvAnno',
      'Esito': 'avvEsito',
    },
    GDPR: {
      'Accordo sui Pagamenti': 'gdprAccordo',
      'Insoluti': 'gdprInsoluti',
    },
    SIC: {
      'Ente di Riferimento': 'ente',
    },
  },
};
