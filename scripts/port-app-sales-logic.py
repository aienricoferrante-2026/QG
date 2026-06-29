#!/usr/bin/env python3
# Porta la business-logic di sales in app_sales: funzioni custom + trigger.
# I 3 trigger su audit_log sono DEFERITI (li aggiunge un passo finale, dopo che
# la copia di audit_log e' completa, per non riscrivere gli hash in volo).
import json, os, re, time, socket, urllib.request, sys
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
SRC="vqtqccnbwkslbnxlfskk"; HUB="bqyqrqmbekdhejrzasvv"
ONLY_AUDIT = "--audit" in sys.argv          # passo finale: solo i 3 trigger audit_log
def q(ref,sql):
    for a in range(6):
        req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
        try:
            with urllib.request.urlopen(req,timeout=120) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            b=e.read().decode()[:200]
            if e.code in (429,500,502,503,504) and a<5: time.sleep(2+a*2); continue
            raise RuntimeError(b)
        except (urllib.error.URLError,socket.timeout,TimeoutError):
            if a<5: time.sleep(2+a*2); continue
            raise

# tabelle realmente presenti in app_sales (per non creare trigger su tabelle assenti)
have={r["table_name"] for r in q(HUB,"select table_name from information_schema.tables where table_schema='app_sales'")}

if not ONLY_AUDIT:
    # 1) FUNZIONI custom (escludo quelle di estensione: pg_trgm ecc.)
    fns=q(SRC,"""select p.proname, pg_get_functiondef(p.oid) d from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and not exists (select 1 from pg_depend dd where dd.objid=p.oid and dd.deptype='e') order by p.proname""")
    okf=0; failf=[]
    for f in fns:
        d=f["d"].replace("public.", "app_sales.")
        d=d.replace("\nAS $function$", "\n SET search_path TO app_sales, public\nAS $function$", 1)
        # alcuni usano $$ invece di $function$
        if " SET search_path" not in d:
            d=re.sub(r"\nAS \$", "\n SET search_path TO app_sales, public\nAS $", d, count=1)
        try: q(HUB,d); okf+=1
        except RuntimeError as e: failf.append((f["proname"], str(e)[:90]))
    print(f"FUNZIONI: {okf} ok, {len(failf)} fallite")
    for n,e in failf: print(f"  ✗ {n}: {e}")

# 2) TRIGGER
trg=q(SRC,"""select c.relname tbl, t.tgname, pg_get_triggerdef(t.oid) d from pg_trigger t
  join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and not t.tgisinternal order by 1,2""")
okt=0; failt=[]; deferred=0
for tg in trg:
    tbl=tg["tbl"]
    if tbl not in have:  # tabella non in app_sales -> salta
        continue
    is_audit_log = (tbl=="audit_log")
    if is_audit_log and not ONLY_AUDIT: deferred+=1; continue
    if not is_audit_log and ONLY_AUDIT: continue
    d=tg["d"].replace(" ON public.", f" ON app_sales.").replace("EXECUTE FUNCTION ", "EXECUTE FUNCTION app_sales.").replace("EXECUTE PROCEDURE ", "EXECUTE PROCEDURE app_sales.")
    try:
        q(HUB, f"drop trigger if exists {tg['tgname']} on app_sales.{tbl}")
        q(HUB, d); okt+=1
    except RuntimeError as e: failt.append((f"{tbl}.{tg['tgname']}", str(e)[:90]))
print(f"TRIGGER: {okt} ok, {len(failt)} fallite, {deferred} deferiti(audit_log)")
for n,e in failt: print(f"  ✗ {n}: {e}")
q(HUB,"notify pgrst, 'reload schema'")
print("FATTO")
