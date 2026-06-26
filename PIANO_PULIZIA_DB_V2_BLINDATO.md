# 🛡️ Piano pulizia DB + codice — v2 BLINDATO — 27/06/2026

> Il piano v1 è stato **bocciato da 3 red-team su 3** (tutti "non regge"). Questo è il v2 che chiude le falle, dopo aver **verificato sul vivo** ogni accusa. Non è "fai tutto e deploi tutto": è **autonomia sul sicuro + il tuo OK su 6 punti**, perché su questo terreno l'autonomia totale ALZA l'errore, non lo abbassa.

---

## A. Perché l'autonomia totale non porta a errore 0 (verificato)
1. **Nessun data-access layer.** Ogni app parla a Supabase con stringhe colonna scritte a mano (sales ~987, qcont ~491, hub ~408). Il compilatore **non vede** un rename rotto: l'errore esce **solo a runtime, in produzione**, quando un coordinatore apre una pagina rotta.
2. **11 app su 18 senza rete (zero test + zero e2e)**, incluse le 4 più accoppiate (qwork/iso/for/sic).
3. **Il gate e2e è finto.** `skipSenzaCredenziali()` fa **saltare** i test se mancano le credenziali → "e2e verde" può voler dire "e2e non eseguito". Va reso un gate vero.
4. **Il rollback "PR atomico" è una finzione su Supabase.** Revert del PR ripristina il **codice**, NON la **migration sul DB**. Serve la migration inversa scritta a parte.
5. **Cavillo soldi:** `gia_incassato`/`da_incassare` sono messi **a mano** dai coordinatori. Un sync che li sovrascrive = **incassi reali cancellati**.

## B. Cosa il red-team ha sbagliato (verificato su origin/main)
- ❌ "Bug vivo sync CdG `bu_codice`" → **falso**: origin/main scrive già `fa_codice`. Era il checkout locale stale.
- ❌ "6 migration non versionate" → **falso**: sono **già su origin/main**.
- ⚠️ "9 app condividono `bqyqr` come primary" → **impreciso**: solo **hub+qwork** come primary; le altre 8 lo usano come **auth**. La distinzione cambia il blast radius (vedi [Topologia](TOPOLOGIA_DB_REALE_27-06.md)).

---

## C. Le 6 regole di blindatura (valgono per ogni cantiere che tocca il DB)
1. **Doppio nome durante il rename** (per evitare la finestra di rottura): deploy del codice che legge **sia il vecchio sia il nuovo nome** → poi applica la migration → poi togli il vecchio nome. Niente più "codice e DB disallineati per 3 minuti".
2. **Migration inversa obbligatoria**: ogni rename ha la sua `DOWN` scritta e **provata** prima di applicare la `UP`. Il rollback non si affida al revert del PR.
3. **Gate e2e VERO**: il test deve **dichiarare di aver girato** (non skip). Se non ci sono credenziali e2e, il gate **fallisce**, non passa.
4. **FK additive in 3 tempi** (mai un `ADD CONSTRAINT` secco su tabella grande: prende un lock e blocca le scritture): (a) check orfani in lettura → (b) `ADD CONSTRAINT … NOT VALID` → (c) `VALIDATE CONSTRAINT` in finestra a basso traffico, una FK alla volta.
5. **Manuale vince sul sync**: per i campi messi a mano (`gia_incassato` ecc.) il sync **non scrive mai** sopra. Non `COALESCE` — un flag "inserito a mano" che blocca.
6. **Registro migration (ledger)**: una tabella unica "chi ha applicato cosa e quando", così due sessioni parallele non applicano la stessa migration due volte. Oggi è SQL Editor a mano, senza lucchetto.

---

## D. Cantieri v2 (riordinati per la topologia reale)

### 🟢 Autonomi (li faccio io, sicuri, reversibili)
| # | Cantiere | Rischio | Note |
|---|---|---|---|
| **0** | **Audit parità Qnet↔WeA** (read-only) | nessuno | In corso stanotte. **Parziale**: il dump Qnet è perso → le righe "da-verificare" si chiudono solo quando Ciro lo rifornisce. |
| **6** | **Rete e2e per le 4 app scoperte** (qwork, iso, for, sic) | basso | Solo file di test. Serve PRIMA di toccarle. |
| **1b** | **Doc igiene repo** (lista branch da potare, worktree volatili) | nessuno | **Solo proposta**, non eseguo: potare 488 branch mentre 17 worktree sono vivi è rischioso senza di te. |

### 🔴 Gate tuo (li preparo pronti-da-premere, NON deploio alla cieca)
| # | Cantiere | Rischio | Perché serve il tuo OK |
|---|---|---|---|
| **2** | FK additive | basso-medio | Lock su tabelle grandi condivise → finestra a basso traffico. |
| **3** | Rename `cliente_nome→ragione_sociale` su CDG (DB dedicato) | medio | Prima vittima sicura: app con DB dedicato + e2e. Il "facile" da cui partire. |
| **5** | Rename residui su app con DB dedicato (cdg→qcont→sales→hr) | medio-alto | Una alla volta, con le 6 regole. **NO hub** qui (è zona condivisa). |
| **5b** | Coppia **hub + qwork** (DB condiviso `bqyqr`) | alto | Deploy coordinato sulle 2 app insieme; qwork senza test → prima il Cantiere 6. |
| **7** | Coppia **for + sic** (DB condiviso `lkkk`) | alto | Migration unica, verifica ENTRAMBE; check anti-leak categoria corsi. |
| **4** | Consolidamento 3 mirror `/customers` → 1 anagrafica | alto | Fusione solo su match certo; serializzato, mai in parallelo alle rinomine. |
| **8→9** | Phase B anagrafica unica | alto | F0/F1 (disegno) autonomo; F2/F3 (esecuzione) gate tuo. |
| **10** | Sync ciclo attivo + Livello 3 | medio | Solo quando Ciro espone le 4 API; regola "manuale vince". |

### ⛔ Zona 1 — Tabelle auth in `bqyqr` (login di 10 app)
**Cantiere a sé, mai mescolato.** Qualsiasi rename su `utenti`/`ruoli`/accessi si fa in finestra di manutenzione dedicata, con le 10 app verificate una per una. Da non toccare finché tutto il resto non è chiuso.

---

## E. Ordine e ritmo
**Prep autonoma** (stanotte/oggi): C0 audit → C6 reti e2e → doc igiene.
**Rinomine** (gate tuo, una alla volta, dalla più sicura): C3 (cdg) → C5 (app dedicate) → C5b (hub+qwork) → C7 (for+sic).
**Anagrafica** (gate tuo): C4 → C8 → C9.
**Sblocco muri Ciro**: C10 + completamento C0, appena arrivano dump + 4 API.
**Pending altre chat**: si riprendono **uno alla volta**, ognuno nel suo worktree, solo dopo che le rinomine sono chiuse — mai sovrapposti a un cantiere aperto sulla stessa app.

## F. Cosa serve da te / da Ciro (blocca la completezza)
1. **Ciro — dump schema Qnet 341 tabelle**: VERIFICATO PERSO (solo `.DS_Store` in STW/QNET/). Senza, l'audit parità resta parziale.
2. **Ciro — 4 API ciclo attivo** (`/invoices/active`, `/orders/{id}/proforme`, `/scadenze`, `/incassi`) + `GET /orders/{id}/details`.
3. **Tu — decisione**: i 5 commit di main locale non pushati (probabilmente già su origin via worktree, è solo bookkeeping del tuo checkout) e la potatura dei 488 branch.
