# ISO · Campi disponibili
_File JSON sorgente: `dashboard_ISO_CM/data/commesse_iso.json` · 6185 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 5845/6185 | `"Degni Daniele"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 6185/6185 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 6185/6185 | `"0% -"` | Avanzamento numerico raw |
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
| `erpLink` | url | _(no alias)_ | 6185/6185 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
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
| `isoDataUltimoAudit` | date (dd-mm-yyyy) | _(no alias)_ | 17/6185 | `"23-09-2021"` |  |
| `isoDataUrgenza` | date (dd-mm-yyyy) | _(no alias)_ | 3/6185 | `"30-11-2024"` |  |
| `isoDataVerifica` | date (dd-mm-yyyy) | Data Verifica | 3001/6185 | `"22-05-2023"` | Data verifica ispettiva |
| `isoDataVerificaEff` | date (dd-mm-yyyy) | _(no alias)_ | 245/6185 | `"07-04-2025"` |  |
| `isoEnte` | string | Ente di Riferimento | 3160/6185 | `"URSS"` | Ente certificatore ISO di riferimento |
| `isoIntervistaSede` | string | Intervista in sede | 2565/6185 | `"Off Site"` | Intervista in sede effettuata (sì/no) |
| `isoOreLav` | number | Ore Lavorazione | 2396/6185 | `14.0` | Ore lavorazione tecnica |
| `isoScopoProposto` | string | Scopo proposto | 3350/6185 | `"EROGAZIONE DI SERVIZI DI PULIZIA E FA..."` | Scopo proposto alla certificazione |
| `isoScopoUscita` | string | Scopo in uscita | 103/6185 | `"PROGETTAZIONE ED  INSTALLAZIONE  DI  ..."` | Scopo finale rilasciato |
| `isoSettore` | string | Settore | 46/6185 | `"ISO"` | Settore EA della certificazione |
| `isoStandard` | integer | _(no alias)_ | 5455/6185 | `"9001"` | Standard ISO singolo (es. 9001) |
| `isoStandards` | array | _(no alias)_ | 6185/6185 | `["9001"]` | Lista standard ISO multipli (es. "9001+14001") |
| `isoStatoCert` | string | Stato del Certificato | 3438/6185 | `"I Sorveglianza"` | Stato certificato (attivo/sospeso/revocato) |
| `isoStatoPagamentoTxt` | string | _(no alias)_ | 4117/6185 | `"Verde ( Omaggio si può consegnare )"` | Stato pagamento testuale (ISO) |
| `isoTipoAudit` | string | _(no alias)_ | 4481/6185 | `"SA"` | Tipo audit (Stage1, Stage2, Sorveglianza, Rinnovo) |
| `isoTipoAuditList` | array | _(no alias)_ | 6185/6185 | `[]` |  |
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
| `sector` | string | _(no alias)_ | 6185/6185 | `"ISO"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 6185/6185 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 6185/6185 | `"Verona - Via Sepano, lotto 28 -  FRAT..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 6185/6185 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 286/6185 | `"Patriciello Antonio"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 6185/6185 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 4000/6185 | `"5.a _ Lavorazione Conclusa o in Concl..."` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 2017/6185 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 6185/6185 | `"Annullato"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 6185/6185 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 6185/6185 | `"ISO_9001_3"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/6185 | `` | Testo ultima nota |
