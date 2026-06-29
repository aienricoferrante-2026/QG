#!/usr/bin/env python3
# ============================================================================
# stato-cutover-erp.py — salute del cutover: le 5 app flippate sono sane?
# Per ogni app: route viva (HTTP) + schema app_* leggibile (conteggio tabelle
# + tabella-chiave). Logga in public.erp_cutover_health. Verde N giorni di fila
# = sicuro spegnere i DB vecchi.
# ============================================================================
import json, os, re, urllib.request, urllib.error
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
HUB="bqyqrqmbekdhejrzasvv"
def q(sql):
    req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{HUB}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
    try:
        with urllib.request.urlopen(req,timeout=60) as r:return json.load(r)
    except urllib.error.HTTPError: return None
def http(url):
    try:
        req=urllib.request.Request(url,method="GET"); req.add_header("User-Agent","curl/8")
        return urllib.request.urlopen(req,timeout=20).status
    except urllib.error.HTTPError as e: return e.code
    except Exception: return 0
# app -> (schema, tabella-chiave, url-root)
APPS={
 "fia":("app_fia","incentivi","https://qualifica-fia-bandi-aienricoferrante-2026s-projects.vercel.app"),
 "hr":("app_hr","dipendenti","https://qualifica-hr-operativa-aienricoferrante-2026s-projects.vercel.app"),
 "qcont":("app_qcont","piano_conti","https://qualifica-wea-qcont-aienricoferrante-2026s-projects.vercel.app"),
 "sales":("app_sales","opportunita","https://qualifica-wea-sales-aienricoferrante-2026s-projects.vercel.app"),
 "commesse":("app_commesse","commessa_filiale_map","https://qualifica-wea-commesse-aienricoferrante-2026s-projects.vercel.app"),
}
q("create table if not exists public.erp_cutover_health (id bigint generated always as identity primary key, eseguito_at timestamptz not null default now(), tutte_verdi boolean not null, dettaglio jsonb not null)")
det=[]; verdi=True
for app,(sch,key,url) in APPS.items():
    code=http(url)
    r=q(f"select count(*) n from {sch}.\"{key}\"")
    rows=r[0]["n"] if r else None
    ntab=(q(f"select count(*) n from information_schema.tables where table_schema='{sch}'") or [{"n":0}])[0]["n"]
    ok = code in (200,302,307,401) and rows is not None
    verdi = verdi and ok
    det.append({"app":app,"http":code,"schema":sch,"tabelle":ntab,f"{key}":rows,"ok":ok})
    print(f"  [{'OK ' if ok else 'KO '}] {app}: http={code} {sch}({ntab} tab) {key}={rows}")
payload=json.dumps(det).replace("'","''")
q(f"insert into public.erp_cutover_health (tutte_verdi, dettaglio) values ({str(verdi).lower()}, '{payload}'::jsonb)")
# giorni-verdi consecutivi
gv=q("select count(*) n from (select date_trunc('day',eseguito_at) d, bool_and(tutte_verdi) v from public.erp_cutover_health group by 1 order by 1 desc) t where t.v")
print(f"\n  ESITO: {'TUTTE VERDI' if verdi else 'PROBLEMI'} — giorni-verdi registrati: {gv[0]['n'] if gv else '?'}")
print("  (≥3 giorni verdi consecutivi = sicuro spegnere i DB vecchi)")
