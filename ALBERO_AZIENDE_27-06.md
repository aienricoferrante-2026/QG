# 🌳 Albero dei campi — AZIENDE — 27/06/2026 (v2 · DETERMINISTICO)

> Collocazione decisa **dall'algoritmo R3**, non da scelte umane. Regola-faro: **nucleo = carta d'identità dell'azienda (vero anche senza rapporto con noi, Registro Imprese) · estensione = esiste solo perché ci lavoriamo.** Base: 18.268 righe reali, fill-rate veri (= solo nota).
> **Zero decisioni tecniche per Enrico.** L'algoritmo ha risolto da solo tutti i casi prima "ambigui".

## 🟦 NUCLEO `aziende` — il record oggettivo (Registro Imprese)
**Identità:** `id` · `qnet_id` · `ragione_sociale` · `forma_giuridica` · `partita_iva` (64%) · `codice_fiscale` (27%)
**Sede legale:** `indirizzo` (100%) · `citta` · `cap` · `provincia`
**Recapiti propri:** `email` (36%) · `pec` (18%) · `telefono` (50%) · `sito_web` (1%) · `sdi` (2%)
**Classificazione camerale:** `codici_ateco` (16%) · `settore_ea` (52%) · `n_dipendenti` (5%) · `classe_dimensionale`
**Ruolo (eccezione di legge):** `is_cliente`* · `is_fornitore` · `is_partner`*
**Tecnici:** `origine` · `sincronizzato_il` · `created_at` · `updated_at` · `presente_in_qnet`*
> *= da creare. `sdi/ateco/ea/n_dipendenti` → **nucleo** perché oggettivi (fatti camerali), non scelte di targeting. La regola supera l'istinto del critico → consistenza.

## 🟩 ESTENSIONE `aziende_commerciale` — esiste solo perché ci lavoriamo (CRM)
`categoria`/`tag_tipologia` (nostra segmentazione) · `fonte` (come l'abbiamo acquisita) · `segnalatore` · `gestore_interno`→FK Utenti · `supervisore`→FK Utenti · `commerciale`(agent)→FK Utenti · `referente`·`referente_email`·`referente_telefono` · `comunicazione_email` (consenso mkt) · `stato_convenzione`·`note_convenzione` · `commenti`
> Tutti campi che **nascono dal nostro processo commerciale**. `referente*`: a regime confluisce nella relazione Contatti (legge 3-anagrafiche).

## 🟪 SATELLITE `aziende_qualifiche` — idoneità a operare (insiemi 1:N)
`certificazioni_iso` (1:N) · `attestazioni_soa` (1:N) · `avvalimenti` (1:N) · `sicurezza` (DVR/RSPP)
> ISO+SOA+sicurezza **accorpate** (stesso macro-dominio, anti-sbriciolamento).

## 🟫 SATELLITE `aziende_indirizzi` — sedi operative (1:N navigabile)
sede · indirizzo · città · provincia · specifica
> 1:N che si naviga/filtra → tabella satellite (non jsonb), per regola.

## 🟨 `aziende_contabilita` — NON creata ora
Nessun campo oggi (lo `sdi` è oggettivo → nucleo). Nasce *just-in-time* col primo campo suo (es. condizioni di pagamento concordate).

## ⬜ jsonb (sul nucleo) · ⬜ coda lunga
`meta` (payload grezzo /customers, cerotto — non discarica) · puntatore `storico_audit` (log nel Registro Audit unico) · certificazioni rare non-ISO/SOA.

## 🔗 NON sono campi di `aziende` (relazioni → viste/join)
commesse (`orders.customer_id`) · offerte · opportunità · attività · documenti · ticket · **contatti collegati** (N:N → anagrafica Contatti).

---

## ⚖️ Cosa resta a Enrico
**Decisioni tecniche: ZERO** — tutto deciso dalle regole.
**Unica policy di business (con default già scelto):** chi vede/scrive `aziende_commerciale`? → *default: ruoli commerciali + admin (RLS)*. Se ti sta bene il default, non serve che rispondi.
