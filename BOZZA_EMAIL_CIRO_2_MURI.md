# ✉️ Bozza pronta — richiesta a Ciro (NON inviata)

> Pronta per il mattino. Dimmi "invia a Ciro" e parte (endpoint send-mail già attivo).
> **A:** ciro.cacciapuoti@esterno.qualificagroup.it
> **CC:** direzione@qualificagroup.it
> **Oggetto:** Due cose per completare l'allineamento DB ↔ Qnet

---

Ciao Ciro,

stiamo allineando i database della Workspace al modello di Qnet. Per chiudere il lavoro mi servono due cose da te:

1. **Dump completo dello schema Qnet** (le 341 tabelle: struttura + Models). Quello che avevamo non è più recuperabile dal disco. Senza, il confronto campo-per-campo Qnet↔Workspace resta a metà.

2. **4 API del ciclo attivo** (oggi mancanti): `/invoices/active`, le proforme complete da `/orders/{id}/proforme`, `/scadenze`, `/incassi` — più `GET /orders/{id}/details` per il livello di dettaglio non-formazione.

Appena le ho, completiamo la parità e accendiamo la contabilità attiva. Grazie.

Enrico

---

_Generata stanotte come parte dell'audit pulizia DB. Vedi [PIANO_PULIZIA_DB_V2_BLINDATO.md](PIANO_PULIZIA_DB_V2_BLINDATO.md) §F._
