# FIA · Campi disponibili
_File JSON sorgente: `dashboard_FIA_CM/data/commesse_fia.json` · 276 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 252/276 | `"Fabozzi Michela"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 276/276 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 276/276 | `"0% -"` | Avanzamento numerico raw |
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
| `erpLink` | url | _(no alias)_ | 276/276 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
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
| `sector` | string | _(no alias)_ | 276/276 | `"FIA"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 276/276 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 276/276 | `"Cardito - Via Sepano, lotto 28 -  FRA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 276/276 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 55/276 | `"Fabozzi Michela"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 276/276 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 1/276 | `"8.b _ Consegna Certificato/Report Ent..."` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 218/276 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 276/276 | `"In Lavorazione"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 276/276 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 276/276 | `"FNC_FONDO NUOVE COMPETENZE_2022"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/276 | `` | Testo ultima nota |
