# 🌙 Report notturno — Pulizia DB + Codice — 27/06/2026

> Buongiorno Enrico. Hai detto "decidi tu, vado a dormire, fai tutto quello che puoi".
> **In una riga:** ho mandato la flotta a mappare tutto, il red-team ha **bocciato il piano v1**, ho **verificato sul vivo** cosa era vero e cosa no, e ti ho preparato il **piano v2 blindato**. **Non ho deployato niente di rischioso** — di proposito, te lo spiego sotto.

---

## 🎯 La cosa più importante che ho scoperto
Il tuo piano "fai tutto e deploi tutto in automatico = errore 0" **è rovesciato**, e ora ho la prova:
- **9–10 app condividono lo stesso DB** (`bqyqr…` è il login di 10 app; hub+qwork e for+sic condividono il DB dati). Un rename "su una app" può romperne **dieci**. Il piano v1 dava per scontato l'opposto.
- **Non c'è un compilatore che ti salva**: i nomi colonna sono stringhe scritte a mano, un rename rotto si vede **solo in produzione** quando qualcuno apre la pagina.
- **Il gate e2e era finto** (i test saltano in silenzio se mancano le credenziali).

→ Dettaglio in **[TOPOLOGIA_DB_REALE_27-06.md](TOPOLOGIA_DB_REALE_27-06.md)** e **[PIANO_PULIZIA_DB_V2_BLINDATO.md](PIANO_PULIZIA_DB_V2_BLINDATO.md)**.

---

## ✅ Fatto stanotte (sicuro, zero rischio)
1. **Audit completo a flotta** (9 agenti Opus, read-only): mappato git, topologia DB, parità Qnet, accoppiamento codice, regole canoniche.
2. **Red-team a 3 lenti** (produzione / cross-app / clobber): tutti e 3 "il piano non regge" → falle raccolte e chiuse nel v2.
3. **Verifica sul vivo di ogni accusa del red-team** (origin/main, non il checkout stale):
   - ❌ "bug vivo sync CdG" → **falso**, già `fa_codice` su origin/main.
   - ❌ "6 migration perse" → **falso**, già su origin/main.
   - ✅ DB condivisi → **vero e critico**.
   - ✅ gate e2e finto → **vero**.
   - ✅ dump Qnet 341 tabelle → **perso** (solo `.DS_Store`).
4. **Topologia DB reale** documentata (le 3 zone di rischio).
5. **Piano v2 blindato** con le 6 regole di sicurezza (doppio-nome, migration inversa, gate e2e vero, FK in 3 tempi, manuale-vince-sul-sync, ledger migration).
6. **Cantiere 0 (registro parità Qnet↔WeA)** lanciato — _in corso, lo trovi qui sotto quando finisce_.
7. Worktree pulito di lavoro creato da origin/main (`chore/notte-pulizia-27-06`), senza toccare nulla degli altri 17 worktree né i tuoi file in sospeso.

## 📦 Pronto-da-premere (aspetta il tuo OK)
Niente è stato deployato. I cantieri rischiosi sono **progettati e ordinati** nel piano v2, ognuno con: come si verifica, rollback, e perché serve il tuo OK. Quando dai il via, parto dalla **vittima sicura** (Cantiere 3: rename su CDG, DB dedicato + test) e procedo una app alla volta.

## 🔴 Decisioni per te (in ordine)
1. **OK al piano v2?** Se sì, parto coi cantieri autonomi (audit + reti e2e) senza altro disturbo, e ti porto il primo rename (CDG) pronto al gate.
2. **Ciro: 2 muri da sbloccare** — (a) il **dump schema Qnet** (perso, serve ri-fornirlo) e (b) le **4 API ciclo attivo**. Senza, parità e contabilità attiva restano parziali. _(Posso prepararti la mail per Ciro.)_
3. **Branch & worktree**: 488 branch locali e 17 worktree (2 su `/tmp`, volatili). Vanno potati, ma **non lo faccio mentre dormi** (rischio di cancellare lavoro vivo di un'altra sessione). Te lo propongo come operazione assistita.
4. **"Una sola app" (Guscio Unico)**: confermato come cantiere a sé (UX, non dati). Lo tengo separato dalla pulizia DB.

## 🧱 Stato — cosa ho toccato e cosa NO
- ✅ Creato: worktree `~/Desktop/qp-notte-pulizia` (branch `chore/notte-pulizia-27-06`), 3 doc in `~/Desktop/STW/`.
- 🚫 NON toccato: i tuoi 38 file in sospeso, gli altri 17 worktree, nessun DB, nessun deploy, nessun branch potato.

---

_Ultimo aggiornamento: piano v2 scritto; Cantiere 0 audit ancora in corso._
