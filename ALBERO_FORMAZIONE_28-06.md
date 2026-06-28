# 🌳 Albero-campi — SLICE Formazione/FOR (28/06)

> R7: il dizionario PRIMA delle tabelle. Decisioni R3 (collocazione per significato). Sorgenti staged oggi in `commesse`/`contabilita_attiva` da rialloccare INSIEME (catena FK). Da firmare custode-modello-dati-erp prima dell'expand.

## Cluster da rialloccare (conteggi reali)
discenti 10.691 · opportunita_for 24.491 · discente_origine_gol 3.220 · offerte 46.157 · decreto_regione 296.

## 1. `formazione.discente` ← `commesse.discenti` (10.691)
Il discente è una PERSONA-learner (non nel master Contatti: i Contatti sono contatti di business, i discenti sono allievi → entità propria con identità inline; eventuale dedup futuro a "Contatti-persone" = decisione separata, non ora).
- **PK**: `id uuid` (nuovo) · business-key Qnet: `qnet_order_id` (era order_id text), `qnet_opportunita_id` (era opportunita_id text)
- **Identità persona (nucleo, inline)**: codice_fiscale, cognome, nome, `nome_completo` (era full_name), email, telefono
- **Iscrizione/frequenza (nucleo 1:1)**: data_iscrizione (text→date), ore_previste, ore_frequentate_decimali, ore_assenze_decimali, esito, corso_superato
- **FK**: `opportunita_for_id` → `commerciale.opportunita_for(id)` (risolto via qnet_opportunita_id)
- **Rename ITA** (regola naming 28/06): full_name→nome_completo, order_id→qnet_order_id, opportunita_id→qnet_opportunita_id

## 2. `formazione.discente_economia` (estensione 1:1) ← campi economici di `commesse.discenti`
Dominio diverso (provvigioni/ricavi) → estensione, non nucleo anagrafico.
- importo_oda, ricavo_h_reale, ricavo_h_considerate, ricavo_totale, partner_pct_provvigione, partner_importo_provvigione
- `agente_commerciale_id` → utenti (da risolvere) · `partner_commerciale_id` → contatto Partner_Sede (text oggi) · operatore_nome (text, → FK utenti in rifinitura)
- FK `discente_id` → formazione.discente

## 3. `formazione.discente_origine_gol` (satellite) ← `commesse.discente_origine_gol` (3.220)
Origine GOL del discente. FK `discente_id` → formazione.discente. (id-preservato sorgente per riagganciare la catena.)

## 4. `commerciale.opportunita_for` ← `commesse.opportunita_for` (24.491)
Opportunità = pipeline COMMERCIALE (anche se FOR/GOL) → schema commerciale (scaffold già lì, 0 righe). Migra preservando id (la catena discenti.opportunita_id text vi punta). Campi: corso, tipologia_corso, cpi, annualita, status, fonte… (mirror Qnet).

## 5. `commerciale.offerte_mirror_stw` ← `commesse.offerte` (46.157)
`offerte` è un MIRROR quotation Qnet (payload, status_quotation, qnet_updated_at) ≠ master strutturato `commerciale.offerta`. NON merge → resta mirror, casa = `offerte_mirror_stw` (già scaffold). Decisione mirror-vs-merge RISOLTA: mirror separato.

## 6. `formazione.decreto_regione` ← `contabilita_attiva.decreto_regione` (296)
Finanziamento regionale corsi = rendicontazione/FORMAZIONE, non contabilità attiva. Migra 296 righe → formazione, DROP doppione vuoto.

## Note
- GA1-4_nome, segnalatore: restano text (→ FK contatti/utenti in rifinitura, non bloccante).
- PK uuid sui nuovi nuclei (discente.id era integer) + business-key qnet preservata.
- ORDINE migrate (catena FK): opportunita_for → discente → discente_origine_gol; offerte e decreto indipendenti.
- DROP shell vuote + doppioni dopo migrate verificato. Re-audit VERDE prima del cutover formazione.
