# SOA · Campi disponibili
_File JSON sorgente: `dashboard_SOA_CM/data/commesse_soa.json` · 613 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 525/613 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 613/613 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 613/613 | `"0% -"` | Avanzamento numerico raw |
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
| `erpLink` | url | _(no alias)_ | 613/613 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 613/613 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 613/613 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 613/613 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 603/613 | `"SOA"` | Funzione aziendale (linea di business) |
| `gdprStatoPag` | string | _(no alias)_ | 467/613 | `"Giallo ( Iniziare la lavorazione )"` | Stato pagamento GDPR |
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
| `sector` | string | _(no alias)_ | 613/613 | `"SOA"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 613/613 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 613/613 | `"Frattamaggiore 1 (Hq) - Via Sepano, l..."` | Sede normalizzata (post-elaborazione) |
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
