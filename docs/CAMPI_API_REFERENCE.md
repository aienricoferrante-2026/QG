# Dizionario Campi API — Dashboard STW Qualifica
_Auto-generato da `tools/generate_api_fields_doc.py` il 2026-05-25 23:21._
Fonte: `dashboard_ADMIN/config.js` (alias map) + JSON `dashboard_*/data/*.json` (chiavi reali + sample).

## Indice
- [APL_PAL](#apl_pal)
- [APL_RES](#apl_res)
- [AVV](#avv)
- [FIA](#fia)
- [FOR](#for)
- [GAR](#gar)
- [GDPR](#gdpr)
- [ISO](#iso)
- [IST](#ist)
- [SIC](#sic)
- [SOA](#soa)
- [OFFERTE](#offerte)
- [OPP_FOR](#opp_for)
- [Header Italiano → camelCase (mappa completa)](#mappa-alias)
- [Endpoint API suggeriti](#endpoint-api-suggeriti)

## APL_PAL
**File:** `dashboard_APL_PAL_CM/data/commesse_apl_pal.json` · **Record:** 1415

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 351/1415 | `"D'ambra Elio"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 1415/1415 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 1415/1415 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 18/1415 | `"Roma"` | Città cliente |
| `cliente` | string | Cliente | 1415/1415 | `"** QUALIFICA GROUP S.r.l."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 1415/1415 | `0.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/1415 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 1415/1415 | `"prova pal 04/01"` | Codice contratto |
| `costi` | number | Totale Costi | 1415/1415 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 1415/1415 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 1415/1415 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 1337/1415 | `"04-01-2024"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 375/1415 | `"09-01-2024"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 1415/1415 | `"05-01-2024"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 1415/1415 | `"05-01-2024"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 350/1415 | `"04-01-2024"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/1415 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 1415/1415 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 1415/1415 | `0.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 1415/1415 | `0.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(non in mappa)_ | 1415/1415 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 1415/1415 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 1415/1415 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 1415/1415 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 1334/1415 | `"APL"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 1415/1415 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 1415/1415 | `"4739"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 1415/1415 | `"5161"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 18/1415 | `"via zoe fontana 220"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 1415/1415 | `0.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 1415/1415 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 18/1415 | `"PRIMA FINESTRA DI RENDICONTAZIONE GOL..."` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 1124/1415 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 1/1415 | `1600.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 1004/1415 | `1627.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 1004/1415 | `1627.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 1415/1415 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 1414/1415 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 1337/1415 | `"Cangiano Flavia"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 1415/1415 | `0.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 1415/1415 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 1415/1415 | `"APL_PAL"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 1414/1415 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 1415/1415 | `"Roma - Via Sepano, lotto 28 -  FRATTA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 1415/1415 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 9/1415 | `"Gallo  Michele"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 1414/1415 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 1265/1415 | `"Controllo saldo pagamento"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 424/1415 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 1415/1415 | `"Annullato"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 1415/1415 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 1415/1415 | `"p prova pal 04/01"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/1415 | `` | Testo ultima nota |

## APL_RES
**File:** `dashboard_APL_RES_CM/data/commesse_apl_res.json` · **Record:** 154

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 23/154 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `aplDataFineLav` | date (dd-mm-yyyy) | Data Fine Lavorazione | 1/154 | `"28-07-2025"` | Data fine lavorazione (APL) |
| `aplDataInizioLav` | date (dd-mm-yyyy) | Data Inizio Lavorazione | 2/154 | `"23-05-2023"` | Data inizio lavorazione (APL) |
| `aplNumeroRisorse` | number | Numero Risorse | 1/154 | `1.0` | Numero risorse richieste (APL_RES) |
| `aplProfilo` | string | Profilo Risorse | 1/154 | `"Impiegato contabile"` | Profilo risorse richieste (APL_RES) |
| `avanzamento` | integer | Avanzamento | 154/154 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 154/154 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 135/154 | `"Roma"` | Città cliente |
| `cliente` | string | Cliente | 153/154 | `"QUALIFICA GROUP FORMAZIONE E LAVORO-I..."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 154/154 | `0.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/154 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 154/154 | `"APL_RS_PROVA"` | Codice contratto |
| `costi` | number | Totale Costi | 154/154 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 154/154 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 154/154 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 106/154 | `"07-01-2025"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 18/154 | `"09-01-2024"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 154/154 | `"16-09-2025"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 154/154 | `"16-09-2025"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 46/154 | `"07-01-2025"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/154 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 154/154 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 154/154 | `0.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 154/154 | `0.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(non in mappa)_ | 154/154 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 154/154 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 154/154 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 154/154 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 5/154 | `"ISO"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 154/154 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 154/154 | `"14223"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 154/154 | `"95475"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 135/154 | `"Via Zoe Fontana, 220"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 154/154 | `0.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 154/154 | `0.0` | MOL documentale (€) |
| `note` | null | Note | 0/154 | `` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 13/154 | `20.0` | % Avanzamento economico |
| `pctMolEc` | number | % MOL Economico | 10/154 | `160.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 10/154 | `160.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 154/154 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 154/154 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 106/154 | `"Ombra Daniela"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 154/154 | `0.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 154/154 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 154/154 | `"APL_RES"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 154/154 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 154/154 | `"Roma - Via Sepano, lotto 28 -  FRATTA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 154/154 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 3/154 | `"Sepe  Roberto"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 154/154 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 63/154 | `"Conclusione iter"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 29/154 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 154/154 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 154/154 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 154/154 | `"PROVA 2"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/154 | `` | Testo ultima nota |

## AVV
**File:** `dashboard_AVV_CM/data/commesse_avv.json` · **Record:** 328

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 246/328 | `"Agnolini Sabrina"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 328/328 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 328/328 | `"0% -"` | Avanzamento numerico raw |
| `avvAnno` | integer | Anno | 128/328 | `"2023"` | Anno avvalimento |
| `avvCIG` | string | CIG | 20/328 | `"98861526B6"` | CIG gara per cui si fornisce avvalimento |
| `avvCategoria` | string | Categoria | 48/328 | `"OS4"` | Categoria avvalimento (singola) |
| `avvCategorie` | array | _(non in mappa)_ | 328/328 | `[]` | Lista categorie avvalimento |
| `avvClassifica` | string | Classifica | 2/328 | `"IV"` | Classifica SOA avvalimento (singola) |
| `avvClassifiche` | array | _(non in mappa)_ | 328/328 | `[]` | Lista classifiche SOA |
| `avvTipo` | string | Tipo | 311/328 | `"Pacchetto"` | Tipo avvalimento |
| `citta` | string | Città | 322/328 | `"NONANTOLA"` | Città cliente |
| `cliente` | string | Cliente | 326/328 | `"OLIVA S.R.L."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 328/328 | `900.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/328 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 328/328 | `"AVV_PacchettoAvvalimento"` | Codice contratto |
| `costi` | number | Totale Costi | 328/328 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 328/328 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 328/328 | `900.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 301/328 | `"22-02-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 198/328 | `"12-04-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 328/328 | `"22-02-2023"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 328/328 | `"22-02-2023"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 116/328 | `"12-04-2023"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/328 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 328/328 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 328/328 | `900.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 328/328 | `900.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(non in mappa)_ | 328/328 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 328/328 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 328/328 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 328/328 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 47/328 | `"AVVALIMENTI"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 328/328 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 328/328 | `"2740"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 328/328 | `"2200"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 326/328 | `"VIA PROVINCIALE OVEST, 109/1"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 328/328 | `900.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 328/328 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 10/328 | `"GARA CONCLUSA - NON AGGIUDICATA"` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 71/328 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 6/328 | `1.8` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 62/328 | `180.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 56/328 | `180.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 328/328 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 328/328 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 301/328 | `"Vitagliano Angela"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 328/328 | `900.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 328/328 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 328/328 | `"AVV"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 328/328 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 328/328 | `"Nonantola - Via Sepano, lotto 28 -  F..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 328/328 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 3/328 | `"Salvatore  Laura"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 328/328 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 213/328 | `"Chiusura"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 239/328 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 328/328 | `"In Lavorazione"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 328/328 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 328/328 | `"AVV_PacchettoAvvalimento_2023"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/328 | `` | Testo ultima nota |

## FIA
**File:** `dashboard_FIA_CM/data/commesse_fia.json` · **Record:** 276

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 252/276 | `"Fabozzi Michela"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 276/276 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 276/276 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 268/276 | `"Cardito"` | Città cliente |
| `cliente` | string | Cliente | 275/276 | `"OIKOS COSTRUZIONI s.r.l."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 276/276 | `0.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/276 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 276/276 | `"FNC_FONDO NUOVE COMPETENZE"` | Codice contratto |
| `costi` | number | Totale Costi | 276/276 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 276/276 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 276/276 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 179/276 | `"17-01-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 130/276 | `"21-11-2025"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 276/276 | `"27-12-2022"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 276/276 | `"27-12-2022"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 148/276 | `"09-05-2024"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/276 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 276/276 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 276/276 | `0.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 276/276 | `0.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(non in mappa)_ | 276/276 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 276/276 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 276/276 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 276/276 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 14/276 | `"ISO"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 276/276 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 276/276 | `"2350"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 276/276 | `"1670"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 270/276 | `"Via Parini n.2"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 276/276 | `0.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 276/276 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 41/276 | `"Pagata la fase II"` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 82/276 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 1/276 | `725.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 71/276 | `1000.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 71/276 | `1000.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 276/276 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 276/276 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 179/276 | `"Cosentino Consiglia"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 276/276 | `0.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 276/276 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 276/276 | `"FIA"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 276/276 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 276/276 | `"Cardito - Via Sepano, lotto 28 -  FRA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 276/276 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 55/276 | `"Fabozzi Michela"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 276/276 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 1/276 | `"8.b _ Consegna Certificato/Report Ent..."` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 218/276 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 276/276 | `"In Lavorazione"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 276/276 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 276/276 | `"FNC_FONDO NUOVE COMPETENZE_2022"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/276 | `` | Testo ultima nota |

## FOR
**File:** `dashboard_FOR_CM/data/commesse_for.json` · **Record:** 1346

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | null | Agente | 0/1346 | `` | Commerciale partecipante (referente vendita) |
| `anticipoDataAccredito` | date (dd-mm-yyyy) | Anticipo Data Accredito | 1/1346 | `"19-11-2025"` | Data accredito anticipo |
| `anticipoDataRichiesta` | date (dd-mm-yyyy) | Anticipo Data Richiesta | 82/1346 | `"23-09-2024"` | Data richiesta anticipo |
| `anticipoDecreto` | integer | Anticipo € da Decreto | 86/1346 | `20325` | Importo da decreto anticipo (€) |
| `anticipoIdRichiesta` | integer | Anticipo Id. Richiesta | 79/1346 | `"5497"` | ID richiesta anticipo |
| `anticipoImporto` | integer | Anticipo Importo | 82/1346 | `20325` | Importo anticipo Regione (€) |
| `avanzamento` | integer | Avanzamento | 1346/1346 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 1346/1346 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 3/1346 | `"frattamaggiore"` | Città cliente |
| `cliente` | string | Cliente | 1346/1346 | `"Prova Qualifica group"` | Ragione sociale cliente |
| `codClasse` | string | Codice Classe | 903/1346 | `"12987_1_ED 8_OPERATORE DELL'INFANZIA_..."` | Codice classe corso |
| `consulenza` | integer | Importo Consulenza | 1346/1346 | `0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/1346 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 1345/1346 | `"Gestione Interna  Qualifica Group"` | Codice contratto |
| `corso` | string | Corso | 903/1346 | `"OPERATORE DELL'INFANZIA"` | Nome corso |
| `costi` | integer | Totale Costi | 1346/1346 | `0` | Totale costi (€) |
| `costiDocum` | integer | Costi Documentali | 1346/1346 | `0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 1346/1346 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 904/1346 | `"31-05-2024"` | Data assegnazione al tecnico |
| `dataEsame` | date (dd-mm-yyyy) | Data Esame | 191/1346 | `"27-05-2024"` | Data esame corso |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 892/1346 | `"22-07-2025"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 896/1346 | `"03-02-2025"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 1346/1346 | `"31-05-2024"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 6/1346 | `"27-06-2025"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/1346 | `` | Descrizione estesa |
| `ecCostiCons` | integer | Ec. Costi Cons. | 1346/1346 | `0` | Costi economici consuntivati (€) |
| `ecMolCons` | integer | Ec. MOL Cons. | 1346/1346 | `0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | integer | Ec. Ricavi Cons. | 1346/1346 | `0` | Ricavi economici consuntivati (€) |
| `ed` | integer | ED | 908/1346 | `896` | Edizione corso |
| `erpLink` | url | _(non in mappa)_ | 1346/1346 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | integer | Fin. Delta Tot. | 1346/1346 | `0` | Delta finanziario (€) |
| `finIncassiTot` | integer | Fin. Incassi Tot. | 1346/1346 | `0` | Totale incassi finanziari (€) |
| `finUsciteTot` | integer | Fin. Uscite Tot. | 1346/1346 | `0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 1335/1346 | `"SICUREZZA"` | Funzione aziendale (linea di business) |
| `giaIncassato` | integer | Già Incassato | 1346/1346 | `0` | Importo già incassato (€) |
| `id` | integer | ID | 1346/1346 | `"7989"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 1346/1346 | `"6922"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 3/1346 | `"viale delle industrie snc"` | Indirizzo cliente |
| `mol` | integer | MOL Effettivo | 1346/1346 | `0` | Margine Operativo Lordo (€) |
| `molDocum` | integer | MOL Documentale | 1346/1346 | `0` | MOL documentale (€) |
| `note` | null | Note | 0/1346 | `` | Note libere |
| `ore` | integer | Totale Ore | 903/1346 | `300` | Ore totali corso |
| `pctAvanzEc` | integer | % Avanzamento Ec. | 145/1346 | `20` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 144/1346 | `11305.85` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 144/1346 | `30100.15` | % MOL economico sul totale |
| `pctRicaviEc` | integer | % Ricavi Economici | 144/1346 | `41406` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 1346/1346 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 1344/1346 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 904/1346 | `". SOLLECITI"` | Tecnico responsabile esecuzione |
| `ricavi` | integer | Totale Ricavi, Totale Ricavo | 1346/1346 | `0` | Totale ricavi (€) |
| `ricaviDocum` | integer | Ricavi Documentali | 1346/1346 | `0` | Ricavi documentali fatturati (€) |
| `saldoDataAccredito` | date (dd-mm-yyyy) | Saldo Data Accredito | 2/1346 | `"12-03-2024"` | Data accredito saldo |
| `saldoDataRichiesta` | date (dd-mm-yyyy) | Saldo Data Richiesta | 149/1346 | `"29-05-2024"` | Data richiesta saldo |
| `saldoDecreto` | integer | Saldo € da Decreto | 216/1346 | `41280` | Importo da decreto saldo (€) |
| `saldoDecretoNum` | string | Saldo Decreto Numero e Data | 4/1346 | `"2024-03-19"` | Numero e data decreto saldo |
| `saldoIdRichiesta` | integer | Saldo Id Richiesta | 212/1346 | `"3626"` | ID richiesta saldo |
| `saldoImporto` | number | Saldo Importo | 135/1346 | `35743.56` | Importo saldo Regione (€) |
| `sede` | string | Sede | 1344/1346 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 1346/1346 | `"Frattamaggiore - -"` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 1346/1346 | `"-"` | Sede operativa cliente |
| `segnalatore` | null | Segnalatore | 0/1346 | `` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 1344/1346 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoClasse` | string | Stato Classe | 821/1346 | `"Chiusa"` | Stato della classe corso (FOR-specifico) |
| `statoCorso` | string | Stato Corso | 822/1346 | `"Concluso"` | Stato del corso (FOR-specifico) |
| `statoLav` | string | Stato Lavorazione | 1/1346 | `"CONCLUSO_DA RENDICONTARE"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 1335/1346 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 1346/1346 | `"Chiusa"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 1346/1346 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 1346/1346 | `"FOR_OPI_1_GOL_CAM_Fratta 1_1"` | Titolo descrittivo della commessa |
| `totRicavo` | integer | _(non in mappa)_ | 119/1346 | `40510` | Totale ricavo aggregato (€) |
| `totRicevutoRegione` | integer | Totale Ricevuto Regione | 119/1346 | `40510` | Totale ricevuto da Regione (€) |
| `ultimaNota` | null | Ultima Nota | 0/1346 | `` | Testo ultima nota |

## GAR
**File:** `dashboard_GAR_CM/data/commesse_gar.json` · **Record:** 325

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 279/325 | `"Fabozzi Michela"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 325/325 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 325/325 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 317/325 | `"Cardito"` | Città cliente |
| `cliente` | string | Cliente | 325/325 | `"OIKOS COSTRUZIONI s.r.l."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 325/325 | `450.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/325 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 325/325 | `"INFOGARE_ Abbonamento Annuale"` | Codice contratto |
| `costi` | number | Totale Costi | 325/325 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 325/325 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 325/325 | `450.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 269/325 | `"14-02-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 160/325 | `"06-03-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 325/325 | `"14-02-2023"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 325/325 | `"14-02-2023"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 106/325 | `"29-11-2022"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/325 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 325/325 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 325/325 | `450.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 325/325 | `450.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(non in mappa)_ | 325/325 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 325/325 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 325/325 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 325/325 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 72/325 | `"GARE"` | Funzione aziendale (linea di business) |
| `garAggiudicataria` | string | _(non in mappa)_ | 1/325 | `"QUALIFICA GROUP SRL"` |  |
| `garAggiudicatariaPunti` | number | _(non in mappa)_ | 1/325 | `64.0` |  |
| `garAggiudicatariaRibasso` | number | _(non in mappa)_ | 1/325 | `12999.84` |  |
| `garAggiudicatariaRibassoPct` | number | _(non in mappa)_ | 1/325 | `11.89` |  |
| `garCIG` | string | CIG | 25/325 | `"B1A7EE8011"` | Codice Identificativo Gara (CIG) |
| `garCategoria` | string | Categoria e Classe Servizi | 6/325 | `"Busta + progetto tecnico + costituzio..."` | Categoria e classe servizi |
| `garDataInserimento` | date (dd-mm-yyyy) | Data Inserimento | 27/325 | `"15-05-2025"` | Data inserimento gara a sistema |
| `garDataScadenza` | date (dd-mm-yyyy) | Data scadenza | 23/325 | `"01-01-2022"` | Data scadenza presentazione offerta |
| `garEnte` | string | Ente Appaltante | 22/325 | `"COMUNE DI MARCIANISE"` | Ente appaltante |
| `garEsito` | integer | Esito | 7/325 | `"12"` | Esito gara (Aggiudicata, Non aggiudicata, ecc.) |
| `garImponibile` | number | _(non in mappa)_ | 1/325 | `13000.0` |  |
| `garImporto` | number | Importo Gara | 19/325 | `376568.0` | Importo base gara (€) |
| `garNoteEsito` | string | Note Esito | 6/325 | `"ROYALTY QUALIFICA 0,7%"` | Note esito gara |
| `garOggetto` | string | Oggetto | 28/325 | `"Lavori di manutenzione straordinaria ..."` | Oggetto della gara |
| `garOraScadenza` | string | _(non in mappa)_ | 5/325 | `"10:00:00"` |  |
| `garRibasso` | number | _(non in mappa)_ | 1/325 | `12999.84` |  |
| `garRibassoPct` | number | _(non in mappa)_ | 1/325 | `11.89` |  |
| `giaIncassato` | number | Già Incassato | 325/325 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 325/325 | `"2604"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 325/325 | `"2048"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 323/325 | `"Via Parini n.2"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 325/325 | `450.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 325/325 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 7/325 | `"TRASCORSA intera mattinata PER PROCED..."` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 42/325 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 11/325 | `10.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 36/325 | `90.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 36/325 | `100.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 325/325 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 322/325 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 269/325 | `"Garofalo Anna"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 325/325 | `450.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 325/325 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 325/325 | `"GAR"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 325/325 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 325/325 | `"Cardito - Via Sepano, lotto 28 -  FRA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 325/325 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | null | Segnalatore | 0/325 | `` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 325/325 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 116/325 | `"Chiusura"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 179/325 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 325/325 | `"In Lavorazione"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 325/325 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 325/325 | `"INFOGARE_ Abbonamento Annuale_2023"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/325 | `` | Testo ultima nota |

## GDPR
**File:** `dashboard_GDPR_CM/data/commesse_gdpr.json` · **Record:** 695

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 447/695 | `"Cesarini Giampiero"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 695/695 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 695/695 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 661/695 | `"Roma Rm"` | Città cliente |
| `cliente` | string | Cliente | 695/695 | `"Phonetrend - Societa' Cooperativa Soc..."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 695/695 | `0.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/695 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 695/695 | `"Gdpr_2019"` | Codice contratto |
| `costi` | number | Totale Costi | 695/695 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 695/695 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 695/695 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 449/695 | `"10-01-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 327/695 | `"11-04-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 695/695 | `"02-01-2024"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 695/695 | `"02-01-2024"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 448/695 | `"11-04-2023"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/695 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 695/695 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 695/695 | `0.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 695/695 | `0.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(non in mappa)_ | 695/695 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 695/695 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 695/695 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 695/695 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 678/695 | `"GDPR"` | Funzione aziendale (linea di business) |
| `gdprAccordo` | string | Accordo sui Pagamenti | 4/695 | `"ACC 50% SALDO 50 %"` | Accordo sui pagamenti GDPR (sì/no) |
| `gdprInsoluti` | string | Insoluti | 695/695 | `"No"` | Importo insoluti (€) |
| `gdprStatoPag` | string | _(non in mappa)_ | 449/695 | `"Giallo ( Iniziare la lavorazione )"` | Stato pagamento GDPR |
| `giaIncassato` | number | Già Incassato | 695/695 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 695/695 | `"804"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 695/695 | `"526"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 670/695 | `"Via La Spezia 6"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 695/695 | `0.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 695/695 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 277/695 | `"Durata: 3 anni"` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 53/695 | `5.0` | % Avanzamento economico |
| `pctMolEc` | number | % MOL Economico | 40/695 | `480.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 40/695 | `480.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 695/695 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 695/695 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 449/695 | `"D'aiello Stefano"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 695/695 | `0.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 695/695 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 695/695 | `"GDPR"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 695/695 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 695/695 | `"Roma Rm - Via Sepano, lotto 28 -  FRA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 695/695 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 35/695 | `"Irrera Lillo"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 695/695 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 276/695 | `"APPLICARE PENALI_FR"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 199/695 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 695/695 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 695/695 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 695/695 | `"Gdpr_2019_3"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/695 | `` | Testo ultima nota |

## ISO
**File:** `dashboard_ISO_CM/data/commesse_iso.json` · **Record:** 6185

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 5845/6185 | `"Degni Daniele"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 6185/6185 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 6185/6185 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 6146/6185 | `"Verona"` | Città cliente |
| `cliente` | string | Cliente | 6170/6185 | `"SOMAK SRL"` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 6185/6185 | `0.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/6185 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 6185/6185 | `"ISO_9001"` | Codice contratto |
| `costi` | number | Totale Costi | 6185/6185 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 6185/6185 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 6185/6185 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 4123/6185 | `"21-04-2022"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 2955/6185 | `"09-09-2022"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 6185/6185 | `"20-10-2024"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 6185/6185 | `"20-10-2024"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 3741/6185 | `"01-10-2024"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/6185 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 6185/6185 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 6185/6185 | `0.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 6185/6185 | `0.0` | Ricavi economici consuntivati (€) |
| `ente` | number | Importo Ente | 1842/6185 | `1400.0` | Importo Ente certificatore / pagato all'ente (€) |
| `erpLink` | url | _(non in mappa)_ | 6185/6185 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 6185/6185 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 6185/6185 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 6185/6185 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 6027/6185 | `"ISO"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 6185/6185 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 6185/6185 | `"1613"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 6185/6185 | `"1076"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 6156/6185 | `"Via Chioda , 92"` | Indirizzo cliente |
| `isoAccordoPagamenti` | string | Accordo sui Pagamenti | 1028/6185 | `"ACC 50 % SALDO 50%"` | Accordo pagamenti raggiunto (sì/no) |
| `isoDataFineLav` | date (dd-mm-yyyy) | Data Fine Lavorazione | 2266/6185 | `"02-05-2024"` | Data fine lavorazione audit |
| `isoDataInizioLav` | date (dd-mm-yyyy) | Data Inizio Lavorazione | 2450/6185 | `"02-04-2024"` | Data inizio lavorazione audit |
| `isoDataUltimaChiamata` | date (dd-mm-yyyy) | Data Ultima Chiamata | 492/6185 | `"25-10-2024"` | Data ultima chiamata cliente |
| `isoDataUltimoAudit` | date (dd-mm-yyyy) | _(non in mappa)_ | 17/6185 | `"23-09-2021"` |  |
| `isoDataUrgenza` | date (dd-mm-yyyy) | _(non in mappa)_ | 3/6185 | `"30-11-2024"` |  |
| `isoDataVerifica` | date (dd-mm-yyyy) | Data Verifica | 3001/6185 | `"22-05-2023"` | Data verifica ispettiva |
| `isoDataVerificaEff` | date (dd-mm-yyyy) | _(non in mappa)_ | 245/6185 | `"07-04-2025"` |  |
| `isoEnte` | string | Ente di Riferimento | 3160/6185 | `"URSS"` | Ente certificatore ISO di riferimento |
| `isoIntervistaSede` | string | Intervista in sede | 2565/6185 | `"Off Site"` | Intervista in sede effettuata (sì/no) |
| `isoOreLav` | number | Ore Lavorazione | 2396/6185 | `14.0` | Ore lavorazione tecnica |
| `isoScopoProposto` | string | Scopo proposto | 3350/6185 | `"EROGAZIONE DI SERVIZI DI PULIZIA E FA..."` | Scopo proposto alla certificazione |
| `isoScopoUscita` | string | Scopo in uscita | 103/6185 | `"PROGETTAZIONE ED  INSTALLAZIONE  DI  ..."` | Scopo finale rilasciato |
| `isoSettore` | string | Settore | 46/6185 | `"ISO"` | Settore EA della certificazione |
| `isoStandard` | integer | _(non in mappa)_ | 5455/6185 | `"9001"` | Standard ISO singolo (es. 9001) |
| `isoStandards` | array | _(non in mappa)_ | 6185/6185 | `["9001"]` | Lista standard ISO multipli (es. "9001+14001") |
| `isoStatoCert` | string | Stato del Certificato | 3438/6185 | `"I Sorveglianza"` | Stato certificato (attivo/sospeso/revocato) |
| `isoStatoPagamentoTxt` | string | _(non in mappa)_ | 4117/6185 | `"Verde ( Omaggio si può consegnare )"` | Stato pagamento testuale (ISO) |
| `isoTipoAudit` | string | _(non in mappa)_ | 4481/6185 | `"SA"` | Tipo audit (Stage1, Stage2, Sorveglianza, Rinnovo) |
| `isoTipoAuditList` | array | _(non in mappa)_ | 6185/6185 | `[]` |  |
| `isoUrgenza` | string | Urgenza emissione | 754/6185 | `"URGENTE"` | Urgenza emissione certificato |
| `mol` | number | MOL Effettivo | 6185/6185 | `0.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 6185/6185 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 575/6185 | `"FORMAZIONE RPC"` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 528/6185 | `30.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 53/6185 | `150.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 383/6185 | `380.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 383/6185 | `380.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 6185/6185 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 6182/6185 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 4120/6185 | `"Ienco Francesco"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 6185/6185 | `0.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 6185/6185 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 6185/6185 | `"ISO"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 6185/6185 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 6185/6185 | `"Verona - Via Sepano, lotto 28 -  FRAT..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 6185/6185 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 286/6185 | `"Patriciello Antonio"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 6185/6185 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 4000/6185 | `"5.a _ Lavorazione Conclusa o in Concl..."` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 2017/6185 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 6185/6185 | `"Annullato"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 6185/6185 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 6185/6185 | `"ISO_9001_3"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/6185 | `` | Testo ultima nota |

## IST
**File:** `dashboard_IST_CM/data/commesse_ist.json` · **Record:** 52

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 39/52 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 52/52 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 52/52 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 36/52 | `"Napoli"` | Città cliente |
| `cliente` | string | Cliente | 52/52 | `"ISTITUTO STATALE DI ISTRUZIONE SUPERI..."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 52/52 | `137704.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/52 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 52/52 | `"Campus didattici e innovativi"` | Codice contratto |
| `costi` | number | Totale Costi | 52/52 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 52/52 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 52/52 | `137704.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 52/52 | `"16-02-2026"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 40/52 | `"13-11-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 52/52 | `"16-02-2026"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 52/52 | `"16-02-2026"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 30/52 | `"13-11-2023"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/52 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 52/52 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 52/52 | `137704.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 52/52 | `137704.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(non in mappa)_ | 52/52 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 52/52 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 52/52 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 52/52 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 4/52 | `"FORMAZIONE, ISO"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 52/52 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 52/52 | `"16657"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 52/52 | `"100905"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 36/52 | `"Via Miano, 290"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 52/52 | `137704.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 52/52 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 1/52 | `"Durata del Corso:  4 ore 1 Aula - 17 ..."` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 44/52 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 26/52 | `10800.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 43/52 | `107964.12` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 43/52 | `107964.12` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 52/52 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 52/52 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 52/52 | `"Flagiello Ferdinando"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 52/52 | `137704.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 52/52 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(non in mappa)_ | 52/52 | `"IST"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 52/52 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 52/52 | `"Napoli - Via Sepano, lotto 28 -  FRAT..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 52/52 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 4/52 | `"Trimarco  Francesca"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 52/52 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 48/52 | `"3.1_Inizio attività a scuola"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 26/52 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 52/52 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 52/52 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 52/52 | `"Campus didattici e innovativi_1"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/52 | `` | Testo ultima nota |

## SIC
**File:** `dashboard_SIC_CM/data/commesse_sic.json` · **Record:** 2650

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 2522/2650 | `"Cacciapuoti Leo"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 2650/2650 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 2650/2650 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 2613/2650 | `"Roma"` | Città cliente |
| `cliente` | string | Cliente | 2650/2650 | `"** QUALIFICA GROUP S.r.l."` | Ragione sociale cliente |
| `consulenza` | integer | Importo Consulenza | 2650/2650 | `300` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/2650 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 2647/2650 | `"prova appuntamento sic"` | Codice contratto |
| `costi` | number | Totale Costi | 2613/2650 | `0.0` | Totale costi (€) |
| `costiDocum` | integer | Costi Documentali | 2650/2650 | `0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 2613/2650 | `300.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 2368/2650 | `"04-03-2024"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 2234/2650 | `"06-03-2024"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 2613/2650 | `"16-03-2023"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 2650/2650 | `"16-03-2023"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 2431/2650 | `"01-03-2024"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/2650 | `` | Descrizione estesa |
| `ecCostiCons` | integer | Ec. Costi Cons. | 2650/2650 | `0` | Costi economici consuntivati (€) |
| `ecMolCons` | integer | Ec. MOL Cons. | 2650/2650 | `300` | MOL economico consuntivato (€) |
| `ecRicaviCons` | integer | Ec. Ricavi Cons. | 2650/2650 | `300` | Ricavi economici consuntivati (€) |
| `ente` | integer | Ente di Riferimento | 2650/2650 | `0` | Importo Ente certificatore / pagato all'ente (€) |
| `erpLink` | url | _(non in mappa)_ | 2650/2650 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | integer | Fin. Delta Tot. | 2650/2650 | `0` | Delta finanziario (€) |
| `finIncassiTot` | integer | Fin. Incassi Tot. | 2650/2650 | `0` | Totale incassi finanziari (€) |
| `finUsciteTot` | integer | Fin. Uscite Tot. | 2650/2650 | `0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 2632/2650 | `"SICUREZZA"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 2613/2650 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 2650/2650 | `"3039"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 2650/2650 | `"2515"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 2641/2650 | `"via zoe fontana 220"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 2613/2650 | `300.0` | Margine Operativo Lordo (€) |
| `molDocum` | integer | MOL Documentale | 2650/2650 | `0` | MOL documentale (€) |
| `note` | string | Note | 372/2650 | `"Antonio Carbone <a.carbone@qualificag..."` | Note libere |
| `pctAvanzEc` | integer | % Avanzamento Ec. | 2650/2650 | `0` | % Avanzamento economico |
| `pctCostiEc` | integer | % Costi Economici | 2650/2650 | `0` | % Costi economici sul totale |
| `pctMolEc` | integer | % MOL Economico | 2650/2650 | `0` | % MOL economico sul totale |
| `pctRicaviEc` | integer | % Ricavi Economici | 2650/2650 | `0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 2650/2650 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 2632/2650 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 2368/2650 | `"Rettori Elio"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 2613/2650 | `300.0` | Totale ricavi (€) |
| `ricaviDocum` | integer | Ricavi Documentali | 2650/2650 | `0` | Ricavi documentali fatturati (€) |
| `sede` | string | Sede | 2632/2650 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 2650/2650 | `"Roma - -"` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 2650/2650 | `"-"` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 115/2650 | `"Salvatore  Laura"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 2632/2650 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 285/2650 | `"Pratica conclusa"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 1937/2650 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 2650/2650 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 2650/2650 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 2650/2650 | `"prova appuntamento sic_1"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/2650 | `` | Testo ultima nota |

## SOA
**File:** `dashboard_SOA_CM/data/commesse_soa.json` · **Record:** 613

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 525/613 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 613/613 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(non in mappa)_ | 613/613 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 601/613 | `"Saviano"` | Città cliente |
| `cliente` | string | Cliente | 607/613 | `"Global Technique"` | Ragione sociale cliente |
| `consorzio` | string | Nome del Consorzio | 2/613 | `"L'impresa partecipa al consorzio stab..."` | Nome del consorzio |
| `consorzioFlag` | integer | Appartenenza Consorzio | 2/613 | `"1"` | Appartiene a un consorzio (sì/no) |
| `consulenza` | number | Importo Consulenza | 613/613 | `1752.24` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/613 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 613/613 | `"SOA_OG1/III_2022"` | Codice contratto |
| `costi` | number | Totale Costi | 613/613 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 613/613 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 613/613 | `1752.24` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 400/613 | `"15-09-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 230/613 | `"26-06-2025"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 613/613 | `"26-06-2025"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 613/613 | `"26-06-2025"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 464/613 | `"19-06-2025"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/613 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 613/613 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 613/613 | `1752.24` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 613/613 | `1752.24` | Ricavi economici consuntivati (€) |
| `ente` | number | Importo Ente | 483/613 | `1752.24` | Importo Ente certificatore / pagato all'ente (€) |
| `enteCert9001` | string | Nome dell'Ente di Certiifcazione 9001 | 34/613 | `"URS"` | Ente che ha certificato ISO 9001 |
| `erpLink` | url | _(non in mappa)_ | 613/613 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 613/613 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 613/613 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 613/613 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 603/613 | `"SOA"` | Funzione aziendale (linea di business) |
| `gdprStatoPag` | string | _(non in mappa)_ | 467/613 | `"Giallo ( Iniziare la lavorazione )"` | Stato pagamento GDPR |
| `giaIncassato` | number | Già Incassato | 613/613 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 613/613 | `"1068"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 613/613 | `"606"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 603/613 | `"Scarlatti 15"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 613/613 | `1752.24` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 613/613 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 193/613 | `"Credenziali accesso al portale:\n08859..."` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 354/613 | `100.0` | % Avanzamento economico |
| `pctMolEc` | number | % MOL Economico | 336/613 | `2313.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 336/613 | `2313.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 613/613 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 613/613 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 400/613 | `"Sepe Roberto"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 613/613 | `1752.24` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 613/613 | `0.0` | Ricavi documentali fatturati (€) |
| `scadenzaCert` | date (dd-mm-yyyy) | Scadenza Ente di Certiifcazione 9001 | 31/613 | `"22-02-2025"` | Scadenza certificazione ISO 9001 |
| `sector` | string | _(non in mappa)_ | 613/613 | `"SOA"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 613/613 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(non in mappa)_ | 613/613 | `"Frattamaggiore 1 (Hq) - Via Sepano, l..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 613/613 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 14/613 | `"Dos Santos   Patricia"` | Rete segnalatore (chi ha portato il lead) |
| `soaAttestante` | string | Soa Attestante, SOA Attestante | 376/613 | `"LA SOATECH S.P.A."` | Nome ente SOA attestante |
| `societa` | string | Società / Sedi, Società Aziendale | 613/613 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 463/613 | `"SOA_0.4_Invio prima email con allegat..."` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 124/613 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 613/613 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 613/613 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 613/613 | `"SOA_OG1/III_2022_2"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/613 | `` | Testo ultima nota |

## OFFERTE
**File:** `dashboard_offerte/data/offerte.json` · **Record:** 14767

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 10360/14767 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `anno` | integer | Anno | 14767/14767 | `"2022"` | Anno offerta |
| `categoria` | string | Categoria | 14767/14767 | `"ISO"` | Categoria offerta |
| `cliente` | string | Cliente | 14732/14767 | `"Maes S.r.l."` | Ragione sociale cliente |
| `data` | string | Data | 14767/14767 | `"2022-03"` | Data offerta |
| `dataFull` | date (dd-mm-yyyy) | _(non in mappa)_ | 14767/14767 | `"23-03-2022"` | Data offerta completa |
| `funzione` | string | Funzione aziendale, Funzione | 417/14767 | `"GDPR, SICUREZZA"` | Funzione aziendale (linea di business) |
| `id` | integer | ID | 14767/14767 | `"1"` | ID univoco Qnet della commessa |
| `sede` | string | Sede | 14752/14767 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeOp` | string | Sede Operativa | 14767/14767 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 556/14767 | `"Levrini Paola"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 14752/14767 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `status` | string | Status, Stato | 14767/14767 | `"Offerta Contrattualizzata"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipo` | string | Tipo | 14766/14767 | `"ISO_9001_14001"` | Tipo offerta |
| `totale` | number | Totale | 14767/14767 | `4400.0` | Totale offerta (€) |

## OPP_FOR
**File:** `dashboard_FOR_OPP/data/opportunita_for.json` · **Record:** 13102

| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `annualita` | date (dd-mm-yyyy) | Annualità | 6057/13102 | `"18-10-2024"` | Annualità del bando |
| `assegnatoA` | integer | _(non in mappa)_ | 1588/13102 | `"09537471212"` | Operatore a cui è assegnato il lead |
| `citta` | string | Città | 18/13102 | `"Roma"` | Città cliente |
| `cliente` | null | Cliente | 0/13102 | `` | Ragione sociale cliente |
| `corso` | string | Corso | 9579/13102 | `"OSA - Operatore Socio Assistenziale"` | Nome corso |
| `corsoInteresse` | string | Corso di interesse | 194/13102 | `"REALIZZAZIONE DI TRATTAMENTI DI CURA,..."` | Corso di interesse |
| `cpi` | string | CPI | 9063/13102 | `"MAIORI"` | Centro per l'Impiego di pertinenza |
| `data` | string | Data | 13102/13102 | `"Gestione Interna  Qualifica Group"` | Data offerta |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 1773/13102 | `"15-09-2025"` | Data dell'ultima nota inserita |
| `fonte` | string | Fonte | 84/13102 | `"Email"` | Fonte del lead (campagna marketing) |
| `id` | integer | ID | 13102/13102 | `"1"` | ID univoco Qnet della commessa |
| `operatore` | string | Operatore | 8012/13102 | `"Fabozzi Michela"` | Operatore CPI di riferimento |
| `provincia` | string | Provincia | 833/13102 | `"RM"` | Provincia del lead |
| `rendicontazione` | string | Rendicontazione | 6827/13102 | `"Davide Bozza"` | Stato rendicontazione |
| `sede` | string | Sede | 13102/13102 | `"QUALIFICA GROUP srl"` | Sede legale cliente (Excel) |
| `sedeOp` | string | Sede Operativa | 982/13102 | `"FORMAZIONE"` | Sede operativa cliente |
| `statoCorso` | string | Stato Corso | 2/13102 | `"10:30"` | Stato del corso (FOR-specifico) |
| `statoPrev` | string | Stato Preventivo | 13102/13102 | `"Con Offerta"` | Stato preventivo |
| `status` | string | Status, Stato | 13101/13102 | `"Attesa Pro-forma"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipologiaCorso` | string | Tipologia Corso | 871/13102 | `"sfl"` | Tipologia corso (IFTS, ITS, ecc.) |
| `titolo` | string | Titolo | 12990/13102 | `"Esposito Mario"` | Titolo descrittivo della commessa |
| `ultimaNota` | string | Ultima Nota | 1773/13102 | `"Nuovo app. anticipato al 26/09"` | Testo ultima nota |

## Mappa Alias

### Comuni (applicate a tutte le BU)

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `% Avanzamento Ec.` | `pctAvanzEc` |
| `% Costi Economici` | `pctCostiEc` |
| `% MOL Economico` | `pctMolEc` |
| `% Ricavi Economici` | `pctRicaviEc` |
| `Agente` | `agente` |
| `Anno` | `anno` |
| `Annualità` | `annualita` |
| `Anticipo Data Accredito` | `anticipoDataAccredito` |
| `Anticipo Data Richiesta` | `anticipoDataRichiesta` |
| `Anticipo Decreto Numero e Data` | `anticipoDecretoNum` |
| `Anticipo Id. Richiesta` | `anticipoIdRichiesta` |
| `Anticipo Importo` | `anticipoImporto` |
| `Anticipo € da Decreto` | `anticipoDecreto` |
| `Avanzamento` | `avanzamento` |
| `CPI` | `cpi` |
| `Categoria` | `categoria` |
| `Città` | `citta` |
| `Cliente` | `cliente` |
| `Codice Classe` | `codClasse` |
| `Codice Fiscale` | `codiceFiscale` |
| `Codice fiscale` | `codiceFiscale` |
| `Cognome` | `cognome` |
| `Contatto` | `contatto` |
| `Contratto` | `contratto` |
| `Corso` | `corso` |
| `Corso di interesse` | `corsoInteresse` |
| `Costi Documentali` | `costiDocum` |
| `Da Incassare` | `daIncassare` |
| `Data` | `data` |
| `Data Assegnazione` | `dataAssegnazione` |
| `Data Contratto` | `dataContratto` |
| `Data Esame` | `dataEsame` |
| `Data Fine` | `dataFine` |
| `Data Inizio` | `dataInizio` |
| `Data Pian. Inizio` | `dataPianInizio` |
| `Data Ultima Nota` | `dataUltimaNota` |
| `Descrizione` | `descrizione` |
| `ED` | `ed` |
| `Ec. Costi Cons.` | `ecCostiCons` |
| `Ec. MOL Cons.` | `ecMolCons` |
| `Ec. Ricavi Cons.` | `ecRicaviCons` |
| `Email` | `email` |
| `Euro Residuo Effettivo` | `euroResiduo` |
| `Fin. Delta Tot.` | `finDeltaTot` |
| `Fin. Incassi Tot.` | `finIncassiTot` |
| `Fin. Uscite Tot.` | `finUsciteTot` |
| `Fonte` | `fonte` |
| `Funzione` | `funzione` |
| `Funzione aziendale` | `funzione` |
| `Già Incassato` | `giaIncassato` |
| `ID` | `id` |
| `ID Contratto` | `idContratto` |
| `Importo Consulenza` | `consulenza` |
| `Importo Ente` | `ente` |
| `Indirizzo` | `indirizzo` |
| `Link Commessa` | `qnetLink` |
| `MOL Documentale` | `molDocum` |
| `MOL Effettivo` | `mol` |
| `Nome` | `nome` |
| `Note` | `note` |
| `Num. Discenti` | `numDiscenti` |
| `Operatore` | `operatore` |
| `Opportunità` | `opportunita` |
| `Provincia` | `provincia` |
| `Regione` | `regione` |
| `Rendicontazione` | `rendicontazione` |
| `Responsabile` | `responsabile` |
| `Ricavi Documentali` | `ricaviDocum` |
| `Rifiuto` | `rifiuto` |
| `Saldo Data Accredito` | `saldoDataAccredito` |
| `Saldo Data Richiesta` | `saldoDataRichiesta` |
| `Saldo Decreto Numero e Data` | `saldoDecretoNum` |
| `Saldo Id Richiesta` | `saldoIdRichiesta` |
| `Saldo Importo` | `saldoImporto` |
| `Saldo € da Decreto` | `saldoDecreto` |
| `Sede` | `sede` |
| `Sede Operativa` | `sedeOp` |
| `Segnalatore` | `segnalatore` |
| `Società / Sedi` | `societa` |
| `Società Aziendale` | `societa` |
| `Stato` | `status` |
| `Stato Classe` | `statoClasse` |
| `Stato Corso` | `statoCorso` |
| `Stato Lavorazione` | `statoLav` |
| `Stato Pagamento` | `statoPagamento` |
| `Stato Preventivo` | `statoPrev` |
| `Status` | `status` |
| `Telefono` | `telefono` |
| `Tipo` | `tipo` |
| `Tipo Commessa` | `tipoCommessa` |
| `Tipologia Corso` | `tipologiaCorso` |
| `Titolo` | `titolo` |
| `Totale` | `totale` |
| `Totale Costi` | `costi` |
| `Totale Ore` | `ore` |
| `Totale Ricavi` | `ricavi` |
| `Totale Ricavo` | `ricavi` |
| `Totale Ricevuto Regione` | `totRicevutoRegione` |
| `Ultima Nota` | `ultimaNota` |

### Per-BU (vincono sui comuni)

#### APL_RES

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `Data Fine Lavorazione` | `aplDataFineLav` |
| `Data Inizio Lavorazione` | `aplDataInizioLav` |
| `Numero Risorse` | `aplNumeroRisorse` |
| `Profilo Risorse` | `aplProfilo` |

#### AVV

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `Anno` | `avvAnno` |
| `CIG` | `avvCIG` |
| `Categoria` | `avvCategoria` |
| `Classifica` | `avvClassifica` |
| `Esito` | `avvEsito` |
| `Tipo` | `avvTipo` |

#### FIA

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `CIG` | `garCIG` |
| `Data Inserimento` | `garDataInserimento` |
| `Data scadenza` | `garDataScadenza` |
| `Ente Appaltante` | `garEnte` |
| `Esito` | `garEsito` |
| `Importo Gara` | `garImporto` |
| `Note Esito` | `garNoteEsito` |
| `Protocollo` | `garProtocollo` |

#### GAR

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `CIG` | `garCIG` |
| `Categoria e Classe Servizi` | `garCategoria` |
| `Data Inserimento` | `garDataInserimento` |
| `Data scadenza` | `garDataScadenza` |
| `Ente Appaltante` | `garEnte` |
| `Esito` | `garEsito` |
| `Importo Gara` | `garImporto` |
| `Note Esito` | `garNoteEsito` |
| `Oggetto` | `garOggetto` |
| `Protocollo` | `garProtocollo` |

#### GDPR

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `Accordo sui Pagamenti` | `gdprAccordo` |
| `Insoluti` | `gdprInsoluti` |

#### ISO

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `Accordo sui Pagamenti` | `isoAccordoPagamenti` |
| `Data Fine Lavorazione` | `isoDataFineLav` |
| `Data Inizio Lavorazione` | `isoDataInizioLav` |
| `Data Ultima Chiamata` | `isoDataUltimaChiamata` |
| `Data Verifica` | `isoDataVerifica` |
| `Ente di Riferimento` | `isoEnte` |
| `Intervista in sede` | `isoIntervistaSede` |
| `Ore Lavorazione` | `isoOreLav` |
| `Scopo in uscita` | `isoScopoUscita` |
| `Scopo proposto` | `isoScopoProposto` |
| `Settore` | `isoSettore` |
| `Stato del Certificato` | `isoStatoCert` |
| `Urgenza emissione` | `isoUrgenza` |

#### SIC

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `Ente di Riferimento` | `ente` |

#### SOA

| Header Excel (italiano) | Chiave camelCase |
|---|---|
| `Appartenenza Consorzio` | `consorzioFlag` |
| `Nome del Consorzio` | `consorzio` |
| `Nome dell'Ente di Certiifcazione 9001` | `enteCert9001` |
| `SOA Attestante` | `soaAttestante` |
| `Scadenza Ente di Certiifcazione 9001` | `scadenzaCert` |
| `Soa Attestante` | `soaAttestante` |

## Endpoint API suggeriti

Base path proposto: `https://api.qualificagroup.org/v1/`

| Risorsa | Endpoint | Note |
|---|---|---|
| Commesse APL_PAL | `GET /commesse/apl-pal` | Restituisce la lista, paginata. Campi come da sezione [APL_PAL](#apl_pal) |
| Commesse APL_RES | `GET /commesse/apl-res` | Restituisce la lista, paginata. Campi come da sezione [APL_RES](#apl_res) |
| Commesse AVV | `GET /commesse/avv` | Restituisce la lista, paginata. Campi come da sezione [AVV](#avv) |
| Commesse FIA | `GET /commesse/fia` | Restituisce la lista, paginata. Campi come da sezione [FIA](#fia) |
| Commesse FOR | `GET /commesse/for` | Restituisce la lista, paginata. Campi come da sezione [FOR](#for) |
| Commesse GAR | `GET /commesse/gar` | Restituisce la lista, paginata. Campi come da sezione [GAR](#gar) |
| Commesse GDPR | `GET /commesse/gdpr` | Restituisce la lista, paginata. Campi come da sezione [GDPR](#gdpr) |
| Commesse ISO | `GET /commesse/iso` | Restituisce la lista, paginata. Campi come da sezione [ISO](#iso) |
| Commesse IST | `GET /commesse/ist` | Restituisce la lista, paginata. Campi come da sezione [IST](#ist) |
| Commesse SIC | `GET /commesse/sic` | Restituisce la lista, paginata. Campi come da sezione [SIC](#sic) |
| Commesse SOA | `GET /commesse/soa` | Restituisce la lista, paginata. Campi come da sezione [SOA](#soa) |
| Commesse OFFERTE | `GET /commesse/offerte` | Restituisce la lista, paginata. Campi come da sezione [OFFERTE](#offerte) |
| Commesse OPP_FOR | `GET /commesse/opp-for` | Restituisce la lista, paginata. Campi come da sezione [OPP_FOR](#opp_for) |

### Filtri standard supportati (query string)
- `?status=In%20Lavorazione` — filtra per status
- `?from=2026-01-01&to=2026-12-31` — range data inizio
- `?fine_from=2026-01-01&fine_to=2026-12-31` — range data fine
- `?cliente=<nome>` — match cliente
- `?agente=<nome>` — match commerciale
- `?limit=1000&offset=0` — paginazione
