# APL_RES · Campi disponibili
_File JSON sorgente: `dashboard_APL_RES_CM/data/commesse_apl_res.json` · 154 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 23/154 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `aplDataFineLav` | date (dd-mm-yyyy) | Data Fine Lavorazione | 1/154 | `"28-07-2025"` | Data fine lavorazione (APL) |
| `aplDataInizioLav` | date (dd-mm-yyyy) | Data Inizio Lavorazione | 2/154 | `"23-05-2023"` | Data inizio lavorazione (APL) |
| `aplNumeroRisorse` | number | Numero Risorse | 1/154 | `1.0` | Numero risorse richieste (APL_RES) |
| `aplProfilo` | string | Profilo Risorse | 1/154 | `"Impiegato contabile"` | Profilo risorse richieste (APL_RES) |
| `avanzamento` | integer | Avanzamento | 154/154 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 154/154 | `"0% -"` | Avanzamento numerico raw |
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
| `erpLink` | url | _(no alias)_ | 154/154 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
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
| `sector` | string | _(no alias)_ | 154/154 | `"APL_RES"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 154/154 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 154/154 | `"Roma - Via Sepano, lotto 28 -  FRATTA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 154/154 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 3/154 | `"Sepe  Roberto"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 154/154 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 63/154 | `"Conclusione iter"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 29/154 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 154/154 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 154/154 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 154/154 | `"PROVA 2"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/154 | `` | Testo ultima nota |
