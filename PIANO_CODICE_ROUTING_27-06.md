# Piano — Layer CODICE + ROUTING — 27/06/2026

> Parte del Piano Master ERP. Mappa di OGNI punto di codice che tocca il DB (1033 siti su 17 app) + il piano del guscio unico. READ-ONLY, nessuna modifica.

## Sintesi codice+routing

# Piano Codice + Routing

## A. Accoppiamento codice↔DB

**Principio fondante (deterministico):** ogni riga della mappa è un *sito* — un punto preciso `file → tabelle → operazioni`. Per ogni tabella o colonna che cambia nel piano DB, la lista dei file da toccare **non si indovina**: si filtra la mappa per nome tabella e si ottengono esattamente i file da modificare, con il tipo di operazione (select/insert/update/delete/rpc). Questo è il contratto tra il LAYER DB e il LAYER CODICE: lo slice "repoint" del piano DB legge da qui.

**Volume (gruppo `qp-notte-pulizia`):**

| App | #siti | Peso |
|---|---|---|
| **sales** | 183 | 🔴 la più accoppiata — da sola supera hub+qwork |
| **hub** | 102 | 🔴 secondo polo, fortemente trasversale |
| **qwork** | 57 | 🟠 terzo, dominio task isolato |
| **Totale gruppo** | **342** | |

**Le app più accoppiate (top, per ampiezza di superficie DB):**

1. **sales (183 siti)** — è il cuore commerciale e tocca il maggior numero di tabelle distinte: `anagrafica_cliente`, `contatto`, `opportunita`, `offerta`, `offerta_riga`, `offerta_stato_dettaglio`, `ordine_cliente`, `deal`, `lead`, `campagna*` (8 tabelle figlie), `provvigione_*`, `catalogo_campo` / `template_campo` / `valore_info_preliminare`, `business_unit` / `linea` / `categoria`, più una dozzina di viste `*_vw`. Qualsiasi rename su anagrafica, offerta o opportunità ha qui il suo epicentro.

2. **hub (102 siti)** — è il polo **trasversale**: tocca tabelle di *tutti* i domini (commesse, dipendenti, struttura_gerarchia, qwork_activities, qnet_mappa, feature_flags, audit_log, permessi). Il file `lib/mission-control-tools.ts` da solo legge ~27 tabelle. È l'app che "vede tutto" → ogni rename ad ampio raggio passa di qui.

3. **qwork (57 siti)** — il più **autocontenuto**: ~50 siti restano dentro il prefisso `qwork_*` (`qwork_activities`, `qwork_tasks`, `qwork_task_*`, `qwork_time_entries`, `pm_*`). Accoppiamento esterno limitato a `utenti`, `business_units`, `business_services`, `clienti`, `contatti`. Conferma la nota memoria: dominio task isolabile.

**Tabelle "calde" (cross-app, ad alto fan-out):**

- `audit_log` — scrittura in decine di siti di tutte e 3 le app: ogni cambio è un repoint di massa.
- `utenti` — letta ovunque (hub, qwork, sales): è il giunto dell'anagrafica unica.
- `business_units` / `business_unit` — **incoerenza di naming già visibile** (qwork usa `business_units`, sales usa `business_unit` singolare): candidato n.1 a slice di normalizzazione, e la mappa dice già *dove* (qwork: `anagrafica`, `attivita`, `mcp`, `qwork-db`, `task-db`, `task/route`; sales: `utenti`, `campagna/prossimo-codice`, `commesse-link`, `elenco-catalogo`, `pipeline/analytics`).
- `commesse` — letta da hub (cruscotto, search, kpi, email-reports, qnet-orders-sync) e sales (`commesse-link`): giunto STW↔commerciale.
- `contatto` / `contatti` — **altra incoerenza** (`contatto` singolare in sales, `contatti` plurale in hub v1 + qwork): da consolidare.

## B. Tabella per-app

| App | #siti | Tabelle principali (dominio) | File critici (massimo fan-out) |
|---|---|---|---|
| **sales** | 183 | `anagrafica_cliente`, `contatto`, `opportunita`(+`_bu`,`_dati_gol`), `offerta`(+`_riga`,`_stato_dettaglio`), `ordine_cliente`, `deal`, `lead`, `campagna`(+8 figlie), `provvigione_offerta`/`provvigione_assegnazione_azienda`, `catalogo_campo`/`template_campo`/`valore_info_preliminare`, `business_unit`/`linea`/`categoria`, viste `*_vw` | `api/cron/scan-quotidiano/route.ts` (12 tabelle, ops complete), `api/opportunita/[id]/cronologia/route.ts` (7), `api/offerta/[id]/transizione-status/route.ts` (5), `api/lead/import-fb/route.ts` (8), `api/campagna/[id]/route.ts` (8), `api/contatori-sidebar/route.ts` (6) |
| **hub** | 102 | `audit_log`, `utenti`, `commesse`, `dipendenti`, `struttura_gerarchia`, `feature_flags`, `qnet_mappa`, `backlog_voce`, `notifica`/`notifica_letta`, `cervello_bu_*`, `permesso_*`/`autorizzazioni`/`wea_ambito`, `team`/`utente_team`, `qwork_sync_*` | `lib/mission-control-tools.ts` (~27 tabelle, select), `api/cruscotto/route.ts` (11), `api/centro-autorizzazioni/default/route.ts` (6), `api/cervello-bu/genera-piano/route.ts` (5), `lib/produttivita-coordinatori/dati.ts` (commesse+offerte+qwork) |
| **qwork** | 57 | `qwork_activities`(+`_logs`,`_notes`,`_attachments`,`_observers`), `qwork_tasks`(+`_assigneds`,`_observers`,`_subs`,`_notes`,`_reminders`,`_documents`,`_recurrences`,`_logs`), `qwork_time_entries`, `qwork_notifications`, `pm_progetto`/`pm_task`/`pm_assegnazione`, `qwork_qnet_sync_log` | `api/task/[id]/route.ts` (9 tabelle), `lib/qnet/sync.ts` (4, ops complete), `lib/task-db.ts`, `lib/qwork-db.ts`, `api/cron/task-recurrence/route.ts` (4) — più i tipi in `lib/types.ts` |

> Per ogni slice del piano DB: filtrare questa griglia per la tabella interessata e si ottiene la rosa dei file critici da aprire per primi.

## C. Routing — guscio unico

### Stato oggi (dalla mappa ROUTING)

- **Cornice condivisa:** 15/18 app montano `@qualifica/ui/AppShell`. **3 bespoke** (`soa`, `quaimed`, `qcert`) con sidebar/header locali. **CrossNav** (4 linguette) solo in 4 app (cdg, commesse, sales, dashboard).
- **Login:** ogni app ha `/login` locale che autentica contro **Hub Supabase** (`bqyqr…`), fallback rigido `hub-defaults.ts`. Cookie **per-dominio** → re-login tra app inevitabile.
- **Indirizzi vecchi hardcoded (Regola 7, già attiva):** `packages/ui/src/cross-nav.tsx` (4 URL `*.vercel.app`), `app-switcher-data.ts` (18 slug hardcoded), `login-card.tsx:39` (`HUB_URL`), più link sparsi in sales/dashboard/commesse/qwork/hub. Email di sistema in hr/sales/sic/for. Template paziente in quaimed.

### Tappe verso un solo indirizzo + sezioni a slash

| # | Tappa | File / modifica | Esito |
|---|---|---|---|
| **0** | **DNS** `app.qualificagroup.com` | pannello M365 (Lillo) → progetto Vercel gateway | bloccante, fuori codice |
| **1** | **Gateway rewrites** | `next.config.mjs` nuovo (app gateway o hub): `rewrites()` `/<slug>/:path* → https://qualifica-wea-<slug>.vercel.app/:path*` + catch-all su hub | `app.qualificagroup.com/sales/…` vivo, **zero** modifiche alle app |
| **2** | **Cookie condiviso** | `packages/auth/src/supabase/{server,client,middleware}.ts` → `cookieOptions: { domain: '.qualificagroup.com' }`; allineare `site_url` + `uri_allow_list` su Hub Supabase Auth | re-login zero, una volta sola per tutte le 15 app |
| **3** | **basePath per app** | un `next.config.mjs` per ognuna delle 18 app: `basePath: '/<slug>'` (gestisce href interni, Image, assetPrefix, route API) | link profondi interni coerenti; intervento più invasivo, app-per-app, da testare |
| **4** | **Repoint link navigazione** | `cross-nav.tsx` (4 URL→percorsi relativi), `app-switcher-data.ts` (18 slug→`/slug`, **fonte unica**), `login-card.tsx:39` (`HUB_URL`→env `app.qualificagroup.com`), link UI in sales/dashboard/commesse/qwork/hub | nessun salto fuori dal guscio |
| **5** | **Rollout CrossNav** | `components/layout/header.tsx` delle 11 app con AppShell senza CrossNav | Regola 2 completa (cornice identica) |
| **6** | **Migrare bespoke** | `apps/{soa,quaimed,qcert}/app/(app)/layout.tsx` → `SharedAppShell` | cornice unica; per quaimed decidere lato paziente (eccezione dottore) |

### Rischi

- **Cookie/dominio:** cambio dominio del cookie = **logout forzato una-tantum** di tutte le sessioni `*.vercel.app` attive → pianificare in finestra a bassa attività.
- **Link profondi (Regola 8):** senza `basePath` (Tappa 3) la navigazione interna rompe; testare ogni app con URL diretto `…/hr/dipendenti/42`.
- **Permessi a vista (Regola 6):** `QUALIFICA_APPS` mostra oggi tutte le 18 app a tutti; menu access-aware (`wea_ambito`) disegnato ma non costruito → pagina raggiungibile via URL senza controllo gateway.
- **API server-to-server:** chiamate inter-app con fallback `*.vercel.app` devono restare sui domini Vercel originali (le API interne mantengono l'URL Vercel) o passare per il gateway (un hop in più, più lento).
- **Rewrites Vercel:** proxano il body ma non tutti gli header (`Set-Cookie` può avere dominio sbagliato) → testare prima con la sola hub.

### Legame col DB

Il routing **non tocca le tabelle**: è un layer di indirizzamento puro. L'unico aggancio al DB è indiretto — `app-switcher-data.ts` / `cross-nav.tsx` sono la *fonte unica* degli indirizzi, parallela a `qnet_mappa`/`flussi_app` (hub) che descrivono i flussi tra app. Quando uno slice DB rinomina una tabella che cambia un *path* (es. `/anagrafica` → `/aziende` se la pagina segue il nome dominio), il repoint dei link in `packages/ui` va schedulato **insieme** allo slice, usando la mappa A per i file UI coinvolti.

## D. Innesto nel percorso slice del piano DB

Il piano DB procede a **slice per dominio/tabella** (strangler: tabella nuova accanto alla vecchia, poi repoint, poi drop). Ogni slice ha una fase **"repoint"** che consuma direttamente la mappa A:

1. **Selezione file** — lo slice nomina la tabella/colonna; si filtra la mappa A per quel nome → si ottiene la lista esatta dei siti (file + operazione). Nessuna ricerca a mano. Esempio: slice `business_unit` → la mappa restituisce 6 file sales + 6 file qwork, separati per `business_unit` vs `business_units` (la normalizzazione di naming **è** lo slice).

2. **Ordine per operazione** — dentro la lista, si parte dai siti `select` (sola lettura, repoint sicuro: vista/alias), poi `insert`/`update`/`delete` (scrittura, repoint con doppia scrittura durante la transizione), infine `rpc` (funzioni DB, da migrare in coda).

3. **Priorità per fan-out** — i file critici di B (es. `mission-control-tools.ts`, `scan-quotidiano`, `task/[id]/route.ts`) si toccano per ultimi e con più test: concentrano molte tabelle, un errore qui è ad ampio raggio.

4. **Tabelle calde = slice trasversali** — `audit_log`, `utenti`, `business_unit(s)`, `commesse`, `contatto/contatti` non sono slice di un solo dominio: vanno trattate come slice **orizzontali** che attraversano tutte e 3 le app insieme, perché la mappa mostra fan-out su hub+qwork+sales contemporaneamente.

5. **Cancello (gate CEO):** repoint in codice + migration scritte sono **autonomi**; l'applicazione del rename in prod e il drop della vecchia tabella restano al gate (nota memoria: missione notturna = audit+migration+FK+PR verdi; GATE = applicare in prod/deploy).

6. **Sincronia con C:** se uno slice cambia un path UI (rename che si riflette in un indirizzo a slash), il suo repoint include i link in `packages/ui` (Tappa 4 di C) nello **stesso** slice, così codice DB e indirizzi del guscio restano allineati.

---

## Piano Routing / Guscio unico (dettaglio)

Ho ora una visione completa. Posso costruire il report.

---

## Stato reale del guscio oggi

### Cornice condivisa (@qualifica/app-shell + @qualifica/ui)

**15 su 18 app usano lo stesso AppShell condiviso** (`@qualifica/ui/AppShell`):

bp, cdg, commesse, dashboard, fia, for, hr, hub, iso, qcont, qwork, sales, sgi, sic, area-riservata (esterna, non conta), e hub stesso.

**3 app hanno un layout bespoke** (non montano `@qualifica/ui/AppShell`):

- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/soa/app/(app)/layout.tsx` — usa `<div class="min-h-screen lg:flex">` costruito a mano con `<Sidebar>` e `<Header>` locali, senza SharedAppShell
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/quaimed/app/(app)/layout.tsx` — identico pattern bespoke
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/qcert/app/(app)/layout.tsx` — identico pattern bespoke

Tutte e tre montano sidebar e header locali ma non li passano attraverso SharedAppShell. Regola 2 (cornice identica): segnalare come da agganciare, non violazione attiva, perche' Strada 1 non e' ancora attiva su queste app.

**CrossNav (4 linguette fisse):** presente solo in 4 app (cdg, commesse, sales, dashboard) tramite re-export da `@qualifica/ui`. Le altre 11 app con AppShell condiviso non montano CrossNav — non e' ancora stata rollata su tutte.

### Login unico

Struttura solida: `@qualifica/auth/server` usa `hub-defaults.ts` come fallback rigido — nessuna app puo' tornare al DB locale. Ogni app ha la propria pagina `/login` locale che pero' autentica contro Hub Supabase (`bqyqrqmbekdhejrzasvv`). Finche' i cookie rimangono per-dominio (ogni app sul proprio `.vercel.app`) c'e' re-login tra app anche se le credenziali sono le stesse — questo e' il problema strutturale che Strada 1 risolve.

Regola 3: nessuna violazione attiva oggi (ogni `/login` locale autentica verso Hub), ma il re-login e' inevitabile senza il dominio unico.

### Indirizzi vecchi nel codice di navigazione

**Violazioni Regola 7 gia' attive oggi** (link hardcoded in componenti UI visibili, non nelle email):

- `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/ui/src/cross-nav.tsx` righe 14-17 — tutte e 4 le linguette fisse puntano a `*.vercel.app` hardcoded senza nessuna env var
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/ui/src/app-switcher-data.ts` righe 34-55 — tutti i 18 slug hanno URL `*.vercel.app` hardcoded (fonte unica, ma il contenuto e' sbagliato per Strada 1)
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/ui/src/login-card.tsx` riga 39 — `HUB_URL = "https://qualifica-wea-hub.vercel.app"` hardcoded come fallback
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/sales/app/(app)/impostazioni/team-costi/page.tsx` riga 92 — link a `qualifica-wea-cdg.vercel.app`
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/sales/app/(app)/ordini-cliente/[id]/page.tsx` riga 142 e `/apps/sales/app/(app)/ordini-cliente/page.tsx` riga 280 — link a `qualifica-wea-commesse.vercel.app`
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/dashboard/app/(app)/home/page.tsx` righe 76 e 96 — link a `qualifica-wea-commesse.vercel.app/commesse`
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/dashboard/app/(app)/manuale/page.tsx` righe 20, 42, 64 — stessa destinazione
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/commesse/components/commessa-detail.tsx` riga 1491 — link a `qualifica-wea-hub.vercel.app/documenti`
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/qwork/app/(app)/admin/page.tsx` righe 95 e 102 — link a `qualifica-wea-hub.vercel.app/admin/integrazioni/...`
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/hub/app/(app)/admin/integrazioni/microsoft-365/page.tsx` riga 176 — link a `qualifica-hr-operativa.vercel.app/api/...`

**Nelle email di sistema** (non codice di navigazione UI, ma vanno aggiornate quando il dominio cambia): `apps/hr/app/api/profilo/route.ts:185`, `apps/hr/app/api/cron/pl-mensile-mail/route.ts:115`, `apps/sales/app/api/note/route.ts:95`, `apps/sic/app/api/cron/invia-notifiche-scadenze/route.ts:58`, `apps/for/app/api/cron/invia-notifiche-scadenze/route.ts:58`.

**Nei template QuaiMed** (credenziali ai pazienti): `apps/quaimed/app/studio/pazienti/page.tsx:98,103` e `apps/quaimed/app/(app)/medici/page.tsx:300,309` — puntano a `qualifica-wea-quaimed.vercel.app`. Da aggiornare quando QuaiMed entra in Strada 1 (ha un contesto paziente separato che potrebbe restare autonomo — vedi decisione CEO su QuaiMed lato dottore).

---

## Percorso a tappe verso il guscio unico

### Tappa 0 — Prerequisito DNS (bloccante, fuori codice)

Lillo crea il record DNS `app.qualificagroup.com` nel pannello M365 puntando a un progetto Vercel gateway. Senza questo nessuna tappa successiva e' deployabile in produzione. Non e' lavoro di codice.

### Tappa 1 — Gateway Vercel (app nuova o hub come gateway)

Si crea un progetto Vercel separato (o si riusa `hub`) su `app.qualificagroup.com` con un `next.config.mjs` che contiene solo rewrites:

```js
async rewrites() {
  return [
    { source: '/hub/:path*',      destination: 'https://qualifica-wea-hub.vercel.app/:path*' },
    { source: '/hr/:path*',       destination: 'https://qualifica-hr-operativa.vercel.app/:path*' },
    { source: '/sales/:path*',    destination: 'https://qualifica-wea-sales.vercel.app/:path*' },
    { source: '/commesse/:path*', destination: 'https://qualifica-wea-commesse.vercel.app/:path*' },
    // ...tutti gli slug
    { source: '/:path*',          destination: 'https://qualifica-wea-hub.vercel.app/:path*' },
  ]
}
```

Questo da' subito `app.qualificagroup.com/sales/...` funzionante senza toccare nessuna app. E' la mossa piu' rapida perche' le app singole restano invariate — cambia solo il punto di ingresso.

File coinvolti: un `next.config.mjs` nuovo in un'app gateway, zero file nelle app esistenti.

Rischio: i rewrites Vercel proxano il body ma non propagano tutti gli header (es. `Set-Cookie` da Supabase puo' avere il dominio sbagliato). Testare subito con una sola app (hub) prima del rollout.

### Tappa 2 — Cookie condiviso (re-login zero)

Il cookie Supabase e' legato al dominio dell'app al momento della creazione. Con il gateway in Tappa 1, le risposte di autenticazione arrivano ancora dai singoli `*.vercel.app` — il browser riceve cookie con `Domain=qualifica-wea-hub.vercel.app` che non vengono inviati su `app.qualificagroup.com/hr`.

La soluzione e' configurare il cookie su `.qualificagroup.com`. In `@qualifica/auth/src/supabase/server.ts` e `client.ts` si passa `cookieOptions: { domain: '.qualificagroup.com' }` al `createServerClient`. Questo va fatto una volta sola nel package condiviso e vale per tutte le 15 app.

File coinvolti:
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/auth/src/supabase/server.ts`
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/auth/src/supabase/client.ts`
- `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/auth/src/supabase/middleware.ts`

Attenzione: il dominio del cookie deve coincidere con il `site_url` di Hub Supabase Auth (ora e' `qualifica-wea-hub.vercel.app` — va aggiornato a `app.qualificagroup.com`). La lista `uri_allow_list` deve includere `https://app.qualificagroup.com/**`.

### Tappa 3 — basePath per ogni app (link profondi reali)

Con i rewrites in Tappa 1 un link `app.qualificagroup.com/hr/dipendenti/42` funziona, ma i link interni all'app (generati da Next.js con `href="/dipendenti/42"`) producono URL relativi che arrivano a `app.qualificagroup.com/dipendenti/42` invece di `/hr/dipendenti/42`, rompendo la navigazione.

La correzione per ogni app e' aggiungere `basePath` nel `next.config.mjs`:

```js
// apps/hr/next.config.mjs
const nextConfig = {
  basePath: '/hr',
  // ...
};
```

Questo fa si' che tutti gli `<a href="/dipendenti/42">` generati da Next.js diventino automaticamente `/hr/dipendenti/42`. E' il cambio per singola app piu' invasivo (tocca anche gli `Image`, gli `assetPrefix`, le route API). Va fatto app per app e testato.

File coinvolti: un `next.config.mjs` per ognuna delle 18 app in `/Users/enricoferrante/Desktop/qp-notte-pulizia/apps/`.

**Alternativa piu' sicura e piu' lenta (strangler)**: non usare `basePath` ma aggiornare manualmente tutti i link interni alle app con il prefisso. Molto piu' lavoro ma nessun rischio di rompere le route API esistenti.

### Tappa 4 — Aggiornare i link hardcoded nella navigazione

Dopo Tappa 1 i link `*.vercel.app` nelle linguette CrossNav e nell'AppSwitcher mandano l'utente fuori dal guscio. Da aggiornare in questo ordine:

1. `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/ui/src/cross-nav.tsx` — sostituire i 4 URL con `/hub/anagrafica`, `/sales/dashboard`, `/commesse/commesse`, `/dashboard/riepilogo` (percorsi relativi se il cookie e' condiviso, o `app.qualificagroup.com/...`)

2. `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/ui/src/app-switcher-data.ts` — tutti i 18 slug passano da `https://qualifica-wea-*.vercel.app` a `/slug` (percorso relativo al gateway). Il campo `url` nella struct `QualificaApp` diventa un percorso invece di un URL assoluto. Cambiarlo qui lo cambia in tutte le 18 app contemporaneamente (e' la fonte unica).

3. `/Users/enricoferrante/Desktop/qp-notte-pulizia/packages/ui/src/login-card.tsx` riga 39 — `HUB_URL` diventa `process.env.NEXT_PUBLIC_HUB_URL ?? "https://app.qualificagroup.com"`

4. Le pagine con link hardcoded in navigazione UI (sales, dashboard, commesse, qwork, hub): sostituire con percorsi relativi o con costanti tratte da `QUALIFICA_APPS` (che dopo Tappa 4.2 avranno l'URL corretto).

### Tappa 5 — Rollout CrossNav su tutte le app (Regola 2 completa)

Oggi CrossNav e' presente solo in cdg, commesse, sales, dashboard. Va aggiunto all'header delle restanti 11 app che usano AppShell condiviso. E' un intervento meccanico su ogni `components/layout/header.tsx`.

### Tappa 6 — SOA, QuaiMed, Q-CERT portati alla cornice comune (Regola 2)

Le 3 app con layout bespoke vanno migrate a `SharedAppShell`. Per QuaiMed la parte `/app` (lato paziente) e la parte `/studio` (lato medico) sono contesti separati dall'Auth Hub — decidere se il lato paziente entra nel guscio staff o resta autonomo (nota memoria: "QuaiMed lato dottore = eccezione").

---

## Rischi specifici

### Cookie e sottodomini

Il rischio piu' alto di Strada 1 e' il cambio del dominio del cookie. Tutti gli utenti che hanno una sessione attiva su `*.vercel.app` la perdono alla migrazione: al primo accesso dopo il rollout il browser non invia il vecchio cookie su `app.qualificagroup.com`. E' un logout forzato una-tantum per tutti gli utenti attivi — da pianificare in un momento di bassa attivita'.

### Link profondi (Regola 8)

Senza `basePath` i link profondi (`/commesse/123`) funzionano via gateway ma la navigazione interna rompe. Ogni app dopo Tappa 3 deve essere testata con un URL diretto `app.qualificagroup.com/hr/dipendenti/42` per verificare che non faccia redirect alla propria home.

### Permessi a vista (Regola 6)

Il menù comune access-aware (ogni utente vede solo le sue app) e' gia' parzialmente descritto nel design (`project_erp_unico_decisione`) ma non e' implementato. Oggi `QUALIFICA_APPS` mostra tutte le 18 app a tutti gli utenti nell'AppSwitcher. Con Strada 1 attiva un utente senza ruolo su HR non dovrebbe vedere `/hr` nel menu. Il "libro dei permessi" (wea_ambito su Hub) e' stato disegnato ma non costruito. Questo non blocca Strada 1 tecnicamente ma e' un rischio di Regola 6 appena il gateway e' attivo — la pagina e' raggiungibile via URL senza controllo gateway.

### API server-to-server tra app

Molte app chiamano Hub e HR via env var con fallback `*.vercel.app` (es. `process.env.NEXT_PUBLIC_HUB_URL ?? "https://qualifica-wea-hub.vercel.app"`). Con il gateway attivo, queste chiamate devono continuare a puntare ai domini originali Vercel (le app mantengono i loro URL Vercel per le API interne) oppure passare per il gateway (piu' lento, aggiunge un hop). La scelta piu' sicura e' lasciare le API interne su `*.vercel.app` e portare su `app.qualificagroup.com` solo la navigazione utente.

---

## Legame con il consolidamento DB

Strada 1 e il consolidamento DB sono indipendenti tecnicamente ma si rinforzano:

- Il cookie condiviso su `.qualificagroup.com` richiederebbe che tutte le app usino lo stesso progetto Supabase per i dati (o almeno per l'auth). Oggi auth e' gia' centralizzata su Hub (`bqyqrqmbekdhejrzasvv`) — Tappa 2 del guscio dipende solo da questo, non dal merge dei DB dati.
- Quando le API interne (Hub→HR, Commesse→Hub) migreranno da cross-app a query intra-schema (obiettivo ERP 1 DB), i link hardcoded `*.vercel.app` nelle route API scompariranno naturalmente — non servira' una pulizia separata.
- Il `NEXT_PUBLIC_HUB_URL` usato come env in qwork, commesse, bp, sgi rimane necessario finche' Hub e' un'app separata. Quando Hub diventa il gateway unico, questo env diventa la URL del gateway stesso.

---

## Proposte proattive

**1. Unificare subito `cross-nav.tsx` con percorsi relativi** Oggi le 4 linguette CrossNav usano URL assoluti Vercel. Cambiare i 4 URL in `packages/ui/src/cross-nav.tsx` da assoluti a relativi (`/hub/anagrafica`, `/sales/dashboard`, ecc.) non richiede che Strada 1 sia attiva — funzionano gia' sui singoli domini Vercel come link assoluti, ma se impostati come relativi funzioneranno automaticamente sia sui domini Vercel sia sul gateway futuro senza nessun'altra modifica.

**2. Aggiungere il campo `path` a `QualificaApp`** La struct in `app-switcher-data.ts` ha solo `url` (assoluto). Aggiungere un campo `path: string` con il percorso slug (`"/hr"`, `"/sales"`) permette all'AppSwitcher di usare `path` quando il gateway e' attivo e `url` come fallback — zero rottura per le app che non sono ancora su Strada 1.

**3. Creare un env `NEXT_PUBLIC_GATEWAY_URL`** condiviso in tutti i `next.config.mjs` delle app (tramite il `turbo.json` esistente). Quando e' vuoto, i link usano gli URL Vercel diretti; quando e' `https://app.qualificagroup.com`, i link usano il gateway. Questo rende lo switch da Vercel-multipli a gateway-unico un singolo cambio di env su Vercel senza toccare il codice.

---

## Appendice — accoppiamento codice↔DB per app (conteggi)

| App | # siti codice↔DB |
|---|---|
| sales | 183 |
| qcont | 143 |
| hub | 102 |
| sic | 88 |
| hr | 84 |
| for | 82 |
| iso | 73 |
| qwork | 57 |
| cdg | 53 |
| quaimed | 34 |
| commesse | 32 |
| sgi | 31 |
| soa | 30 |
| bp | 21 |
| fia | 12 |
| dashboard | 8 |
| area-riservata | 0 |
| **TOTALE** | **1033** |
