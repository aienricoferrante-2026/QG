# Campi specifici per BU — guida per il programmatore

**A cosa serve:** spiegare quali campi sono specifici di ogni reparto (BU) delle commesse e **dove si trovano** (database + codice), così chiunque lavori sull'elenco commesse sa dove guardare e come aggiungerne di nuovi.

**Regola d'oro:** esiste UN solo elenco-mappa di tutti i campi di tutte le BU. Non si cercano sparsi: si guarda quello.

---

## 1. La fonte di verità (nel codice)

📄 **`packages/commesse-stw/src/campi-catalogo.ts`**

È l'elenco unico. Ogni voce dice:
- `chiave` — nome univoco del campo
- `label` — etichetta mostrata come colonna
- `tipo` — testo / numero / euro / data / percentuale
- `ambito` — a chi si applica (quale BU, o linea, o categoria, o campagna)
- `fonte` — **da dove si legge il valore** (`meta`, `dettagli_for`, oppure `colonna`)

Documento di regole completo (perché è fatto così): `.claude/LEGGE-CAMPI-BU.md`.

**Per aggiungere un campo nuovo:** si aggiunge UNA riga nel catalogo. Nient'altro. Non si tocca il database.

---

## 2. Dove vivono i dati (nel database STW, progetto `odjwvqabxkkpyblghruv`)

| Tipo di campo | Dove vive | Come si legge |
|---|---|---|
| **Comuni a tutte le BU** (cliente, ricavi, regione, stato, avanzamento…) | colonne normali della tabella `commesse` | `commesse.<colonna>` |
| **ISO, GAR, AVV, GDPR, SOA** | dentro il campo "sacchetto" `meta` (jsonb) della tabella `commesse` | `commesse.meta ->> '<chiave>'` |
| **Formazione (FOR)** | tabella dedicata `commessa_dettagli_for` (collegata per `commessa_id`) | join su `commessa_dettagli_for` |
| **SIC, APL, FIA** | nessun campo specifico per ora (solo i comuni) | — |

Le chiavi dentro `meta` iniziano col prefisso del reparto: `iso…` (ISO), `gar…` (GAR), `avv…` (AVV), `gdpr…` (GDPR), `soa…`/`enteCert9001`/`scadenzaCert` (SOA). I comuni economici sono `pct…`, `sector`, `ente`.

---

## 3. I campi decisi, per reparto

### ISO · Certificazioni → da `commesse.meta`
| Chiave nel database | Etichetta |
|---|---|
| `isoStandard` | Standard ISO |
| `isoTipoAudit` | Tipo audit |
| `isoStatoCert` | Stato certificazione |
| `isoEnte` | Ente certificatore |
| `isoScopoProposto` | Scopo proposto |
| `isoDataVerifica` | Data verifica |
| `isoOreLav` | Ore lavorazione |
| `isoDataInizioLav` | Inizio lavorazione |
| `isoDataFineLav` | Fine lavorazione |
| `isoStatoPagamentoTxt` | Stato pagamento |
| `isoUrgenza` | Urgenza |

### GAR · Gare → da `commesse.meta`
| Chiave | Etichetta |
|---|---|
| `garOggetto` | Oggetto gara |
| `garCIG` | CIG |
| `garEnte` | Ente |
| `garImporto` | Importo |
| `garDataScadenza` | Scadenza |
| `garDataInserimento` | Data inserimento |
| `garEsito` | Esito |
| `garCategoria` | Categoria gara |

### AVV · Avvalimenti → da `commesse.meta`
| Chiave | Etichetta |
|---|---|
| `avvTipo` | Tipo avvalimento |
| `avvAnno` | Anno |
| `avvCategorie` | Categorie |
| `avvClassifiche` | Classifiche |
| `avvCIG` | CIG |

### GDPR · Privacy → da `commesse.meta`
| Chiave | Etichetta |
|---|---|
| `gdprStatoPag` | Stato pagamento |
| `gdprInsoluti` | Insoluti |
| `gdprAccordo` | Accordo |

### SOA · Attestazioni → da `commesse.meta`
| Chiave | Etichetta | Nota |
|---|---|---|
| `soaAttestante` | Attestante | |
| `enteCert9001` | Ente cert. 9001 | |
| `scadenzaCert` | Scadenza cert. | |
| `gdprStatoPag` | Stato pagamento | ⚠️ SOA riusa questa chiave di GDPR (collisione di nome nel sacchetto). Nel catalogo è un campo SOA distinto (`soaStatoPag`) che legge `gdprStatoPag`. |

### FOR · Formazione → dalla tabella `commessa_dettagli_for`
| Colonna | Etichetta |
|---|---|
| `titolo_corso` | Nome corso |
| `stato_corso` | Stato corso |
| `stato_classe` | Stato classe |
| `ore_totali` | Ore totali |
| `numero_discenti` | N° discenti |
| `corso_inizio` | Inizio corso |
| `corso_fine` | Fine corso |
| `data_esame` | Data esame |
| `anticipo_euro_da_decreto` | Anticipo (da decreto) |
| `anticipo_num_decreto_data` | Decreto anticipo |
| `saldo_euro_da_decreto` | Saldo (da decreto) |
| `saldo_num_decreto_data` | Decreto saldo |
| `totale_ricevuto_regione` | Tot. ricevuto Regione |
| `euro_residuo_effettivo` | Residuo effettivo |

---

## 4. Come l'app mostra questi campi

L'elenco commesse mostra **solo le colonne comuni** quando il filtro è su "tutte le BU".
Quando si filtra per una BU, l'app chiama l'endpoint `GET /api/commesse/campi-bu?bu=<BU>` che:
1. riapplica i permessi dell'utente (vede solo le sue commesse),
2. legge i campi dal posto giusto (`meta` o `commessa_dettagli_for`) leggendo dal catalogo,
3. restituisce solo le colonne che hanno almeno un valore.

L'app aggiunge quelle colonne in coda a quelle comuni. Tornando a "tutte le BU" spariscono.

File coinvolti:
- catalogo: `packages/commesse-stw/src/campi-catalogo.ts`
- letture: `packages/commesse-stw/src/stw.ts` (`fetchMetaByIds`, `fetchDettagliForByIds`)
- endpoint: `apps/commesse/app/api/commesse/campi-bu/route.ts`
- elenco: `apps/commesse/app/(app)/commesse/page.tsx`

---

## 5. Anomalie note (da sapere)

- **FOR ha i dati in 3 posti**: la tabella `commessa_dettagli_for` (la più completa, la fonte da usare), alcune colonne quasi vuote nella tabella `commesse`, e qualche chiave nel `meta`. Usare **`commessa_dettagli_for`**.
- Le commesse di formazione **molto vecchie** (id basso) non hanno la riga in `commessa_dettagli_for`: per loro i campi corso non compaiono.
- Alcuni campi si compilano solo a fine pratica (es. `isoDataVerifica`, `garEsito`, `totale_ricevuto_regione`): è normale che siano spesso vuoti.
