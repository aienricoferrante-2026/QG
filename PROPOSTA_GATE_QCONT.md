# 🔴 PROPOSTA GATE — Cutover app Q-CONT sul DB unico (sblocca 1,66 mln provvigioni)

> Decisione richiesta a Enrico: **sì/no** se avviare questo cantiere. È l'unico gate che resta per il valore vero. Tocca soldi/pagamenti dal vivo → non lo faccio alla cieca.

## Cosa è (in parole semplici)
Oggi l'app **Q-CONT** (provvigioni, fatture passive, pagamenti partner) legge dal **suo database separato** (eqprz). Tutti i dati di quel ciclo li ho già **copiati e consolidati** nel database unico (bqyqr, schema `contabilita`): piano conti, fornitori, agenti, ODA, + le 18 tabelle del ciclo. Il "cutover" = far **leggere a Q-CONT il database unico** invece del suo separato.

## Perché è un GATE (e non un deploy qualsiasi)
1. **Tocca soldi veri**: Q-CONT gestisce provvigioni e pagamenti ai partner dal vivo. Se sbaglio il cutover, si rompe la gestione pagamenti in produzione.
2. **È grande**: 153 route API + 155 file leggono il DB; 30 toccano il ciclo passivo.
3. **Non è un cambio-indirizzo**: le query di Q-CONT puntano allo schema `public` del suo DB; nel DB unico i dati sono nello schema `contabilita` → serve un **repoint di codice** (non basta cambiare la spina dell'env).

## I 1,66 mln: da dove arrivano
La cifra è nelle **provvigioni** (`provvigione_calcolata`), oggi VUOTA nel ciclo passivo: il valore si popola dal **sync Qnet** (le commissioni servizio) + il calcolo provvigionale che vive dentro Q-CONT. Quindi i 1,66 mln si sbloccano **insieme** al cutover Q-CONT, non prima.

## Come lo farei (piano sicuro, graduale)
1. **Esporre** lo schema `contabilita` via API sul DB unico (config PostgREST) — additivo, non rompe nulla.
2. **Doppio-binario**: Q-CONT scrive su entrambi (vecchio + nuovo) per un periodo → confronto importi a specchio (devono quadrare al centesimo, come ho già fatto col CdG: €102M quadrati).
3. **Repoint a blocchi** (non tutte le 153 route insieme): prima sola-lettura (liste/report), poi le azioni che scrivono, una famiglia per volta, ognuna verificata a vista.
4. **Sync provvigioni Qnet** → popola `provvigione_calcolata` → verifico i 1,66 mln contro la fonte Qnet viva.
5. **Spegnimento** del vecchio DB solo dopo 30 gg di doppio-binario verde.

## Rollback
Ad ogni blocco: l'env/codice torna a eqprz in 1 commit; il vecchio DB resta intatto per tutto il doppio-binario. Rischio reale solo allo spegnimento finale (gate separato).

## ⛔ Cosa ti chiedo (sì/no)
**Avvio il cantiere cutover Q-CONT** con questo piano graduale (parto dal punto 1+2, sola-lettura, zero rischio sul vivo), portandoti la verifica a vista ad ogni blocco prima di toccare le scritture?
- **SÌ** → parto dall'esposizione schema + doppio-binario sola-lettura (reversibile, non tocca i pagamenti).
- **NO / non ora** → resta tutto com'è (Q-CONT continua sul suo DB; i dati consolidati restano pronti nel DB unico per quando vorrai).
