# ROLLBACK FIA (fia-bandi) ERP → oawroqmqepwcndcbvnba (02/07/2026)

Trovato PROATTIVAMENTE mentre risolvevo l'incidente HR (stessa causa radice).

## Causa
fia-bandi era flippata su ERP schema `app_fia` (env ERP_* dal ~29/06). Il cutover
ha perso i DEFAULT degli `id`: **tutte e 10 le tabelle uuid di app_fia** senza
default → creazione di nuovi record rotta (`null value in column "id"…`).
Il core scraping (tabella `incentivi`, id = TEXT/chiave naturale) NON era
impattato; a rompersi erano organizations, utenti, fonti, valutazioni, tag, ecc.

## Perché rollback (sicuro)
DB standalone FIA (`oawroqmqepwcndcbvnba`, public) allineato al gemello app_fia:
incentivi 4590=4590, fonti 10=10, app_organizations 0=0, utenti 3=3 → doppio-binario
in sync → 0 perdita dati. Lo standalone ha i default sani (l'unica id-uuid senza
default è `v_fonti_stato`, che è una VISTA → irrilevante).

## Rimosso (Vercel `qualifica-fia-bandi`, Production) + redeploy
    ERP_SUPABASE_URL, ERP_SUPABASE_SCHEMA (=app_fia), ERP_SUPABASE_SERVICE_ROLE_KEY
AUTH (bqyqr) NON toccata. Deployment c7u4oi9of ● Ready; dominio → HTTP 307 (login).

## Prima di ri-flippare
Completare app_fia come da checklist in ROLLBACK-HR-ERP.md (default+PK+FK+not-null)
e audit VERDE. Vedi memoria project_cutover_fk_perse_schemi_app.
