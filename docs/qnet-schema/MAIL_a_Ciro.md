# Bozza mail / messaggio a Ciro

**Oggetto:** Mappatura campi Qnet API V2 · 20 minuti per sbloccare le webapp

---

Ciao Ciro,

per costruire l'API che le nostre webapp Qualifica (Q-WORK, dashboard STW,
WeA CdG, Hub) chiameranno per leggere le commesse / offerte / opportunità
da Qnet, ho bisogno di una cosa che solo tu sai: **come si chiama davvero
ogni campo dentro Qnet**.

Ti ho preparato un Excel pre-compilato con tutti i 168 campi che noi
usiamo nelle dashboard. Per ognuno:

- ✅ Le **prime 6 colonne** sono già piene (le riconoscerai: sono i nomi
  che vediamo negli export Excel di Qnet + descrizione + esempio).
- 🟡 Le **ultime 5 colonne** sono per te — tabella DB, nome SQL, tipo,
  endpoint API V2, eventuali note.

📎 Allegato: `qnet-fields-template-per-ciro.xlsx`

Nella prima scheda dell'Excel ("📖 Istruzioni") trovi tutti i dettagli su
cosa mettere in ogni colonna. Per i campi che noi calcoliamo lato nostro
o che non esistono in Qnet, scrivi semplicemente "CALCOLATO" — bastano
20-30 minuti del tuo tempo per fare tutto.

Quando me lo rimandi, parte la sync automatica Qnet → Supabase → tutte
le webapp (addio Excel scaricati a mano per sempre).

Grazie!

— Enrico
