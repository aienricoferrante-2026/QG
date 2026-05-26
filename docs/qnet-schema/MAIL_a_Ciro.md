# Bozza mail / messaggio a Ciro

**Oggetto:** Mappatura campi Qnet API V2 · 20-30 min per sbloccare le API automatiche di tutte le webapp Qualifica

---

Ciao Ciro,

ti spiego dove stiamo andando e cosa mi serve da te.

## Il contesto

Sto lavorando con **Claude (l'AI di Anthropic)** per costruire un layer
API unico sopra Qnet, che alimenti automaticamente tutte le nostre webapp:

- dashboard STW (analytics multi-BU)
- Q-WORK
- WeA CdG
- HR, Sales, BP, SGI, Hub
- e tutte quelle future

L'obiettivo finale è arrivare a un punto in cui **nessuno scarica più
Excel da Qnet a mano**. La sync è automatica ogni 15-30 minuti:
Qnet → Supabase qualifica-stw → tutte le webapp che servono.

Claude scrive il codice da solo (le 7 API REST + il sync cron) — io ti
giro solo il PR finale per la review. Ma per partire ha bisogno di sapere
**come si chiama davvero ogni campo dentro Qnet**.

## Cosa mi serve da te

Oggi noi conosciamo solo i nomi degli header degli export Excel (quelli
umani in italiano) ma non sappiamo:
- in che **tabella** vivono nel DB
- come si chiamano davvero in **SQL**
- che **tipi** sono
- su quale **endpoint API V2** si trovano

## Come ho semplificato il tuo lavoro

Ti allego un Excel con tutti i 168 campi che le webapp usano oggi.
Per ognuno:

- ✅ **Prime 7 colonne** già piene (nome che usiamo a video, header Excel
  italiano, descrizione, esempio reale, coverage, **dove viene usato il
  campo** — dashboard + webapp). Non toccarle.
- 🟡 **Ultime 5 colonne** (in giallo) sono per te:
  - Tabella Qnet
  - Nome campo SQL
  - Tipo SQL
  - Endpoint API V2
  - Note

**Sulla colonna G "Usato in"**: ti mostra dove ogni campo viene
consumato oggi (es. "Dashboard CM-FOR · WeA CON · Q-WORK"). Ti dà il
contesto: campi usati da molti consumatori sono critici, campi usati
da uno solo possono attendere se complessi.

**Per i campi speciali**:
- Se NON esistono in Qnet perché li calcoliamo noi → scrivi `CALCOLATO`
- Se sono in JSON / dati liberi → scrivi `JSONB`
- Se sono in più tabelle → indica quella primaria + note nella K

**🔴 Importante per la colonna J (Endpoint API V2)**:
Sappiamo che V2 oggi è stata pensata principalmente per Q-WORK e probabilmente NON espone tutti i 168 campi (specialmente quelli economici tipo `consulenza`, `mol`, `anticipoImporto`, e quelli BU-specific tipo `soaAttestante`, `garCIG`).

Per ogni campo, nella colonna J scrivi:
- L'endpoint se è già esposto (es. `GET /api/v2/orders`)
- `NON IN V2` se il campo esiste in DB ma non c'è endpoint
- `DA AGGIUNGERE A V2` se basta una piccola modifica (con un'indicazione di come)

Questo ci dice esattamente quanta sync è automatizzabile vs quanto serve estendere V2 o trovare un altro modo.

**Tempo stimato**: 20-30 minuti.

## Garanzia di sicurezza

Sappiamo che Qnet è la SSoT operativa di tutta Qualifica e non vogliamo
metterla a rischio. Per questo le API che Claude sta scrivendo sono in
modalità **safe-write**:

| Operazione | Permessa | Motivo |
|---|---|---|
| **READ** (lettura) | ✅ sempre | nessun rischio |
| **INSERT** (aggiunta) | ✅ | crea record nuovi, nulla di esistente perso |
| **UPDATE** (modifica) | ✅ | cambia campi specifici di record esistenti |
| **DELETE** (cancellazione) | ❌ **MAI** | rischio perdita dati irreversibile |
| Soft-delete | ✅ | flag `archiviato=true` invece di cancellare → reversibile |

**Non c'è modo che le webapp distruggano dati Qnet per errore.** L'unico
"peggio" possibile è un record con `archiviato=true` che si recupera
togliendo il flag.

## Cosa succede quando mi rimandi l'Excel

1. Claude legge il tuo Excel compilato (5 min)
2. Genera la mappa "Qnet → camelCase" automatica
3. Per i campi che NON sono in V2 (probabilmente la maggioranza dei 168):
   **scegli tu come procedere** (vedi sotto)
4. Scrive il cron sync Qnet API V2 → Supabase per i campi disponibili
5. Le webapp partono in automatico con i **campi reali**

## Proposta extra: Claude può scriverti la V2.1

Visto che probabilmente molti campi (~70%) sono in DB ma non esposti
da V2, ti propongo:

**Claude scrive lui la PR Laravel pronta da applicare per estendere
V2 → V2.1** (~10-15 nuovi endpoint, ~8-12h di suo lavoro). Tu fai
solo review + test staging + deploy.

| Opzione | Tempo tuo | Pro |
|---|---|---|
| 🅐 Claude scrive, tu reviewa | ~2h review | Risparmi 8-10h |
| 🅑 Spec di Claude, scrivi tu | ~8-12h | Controllo totale del codice |
| 🅒 Niente V2.1, sync solo su campi V2 | 0h | Restano alcuni campi via Excel manuale |

**Tutta la roba è in READ/INSERT/UPDATE, MAI DELETE** (vedi tabella
safe-write sopra) — quindi qualsiasi opzione è zero rischio per Qnet.

Indicami nella mail di risposta quale preferisci.

## Da quel momento

**Addio export Excel manuale per tutto il gruppo** (almeno per i campi
coperti). Tu non ricevi più richieste di "rifammi l'export per la
dashboard X"; tutto è automatico.

## File allegato

📎 `qnet-fields-template-per-ciro.xlsx`

Nella prima scheda dell'Excel ("📖 Istruzioni") trovi tutti i dettagli
operativi su cosa mettere in ogni colonna.

Grazie mille — questo passo sblocca tutto il roadmap webapp dei prossimi
mesi.

— Enrico
