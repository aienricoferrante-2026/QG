#!/usr/bin/env python3
# app_hr: indici unique mancanti + 4 funzioni (public.->app_hr. + search_path) + 2 trigger.
# Idempotente. Le funzioni vivono in app_hr; i guard girano sulle tabelle giuste.
import json, os, re, time, urllib.request

ENV = os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK = next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)', l).group(1).strip()
            for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")), None)
HR, HUB = "hsoovytrzxcllbawpvwt", "bqyqrqmbekdhejrzasvv"

def q(ref, sql):
    for attempt in range(5):
        req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",
            data=json.dumps({"query": sql}).encode(),
            headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json", "User-Agent": "curl/8"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:400]
            if e.code in (429,500,502,503,504) and attempt < 4: time.sleep(2+attempt*2); continue
            raise RuntimeError(body)

# 1) indici su app_hr.dipendente_funzione_aziendale (ON CONFLICT li richiede)
print("indici...")
q(HUB, """
create unique index if not exists dfa_dip_fa_key on app_hr.dipendente_funzione_aziendale (dipendente_id, fa_codice);
create unique index if not exists uq_dip_fa_principale on app_hr.dipendente_funzione_aziendale (dipendente_id) where (is_principale = true);
create index if not exists idx_dip_fa_dipendente on app_hr.dipendente_funzione_aziendale (dipendente_id);
create index if not exists idx_dip_fa_codice on app_hr.dipendente_funzione_aziendale (fa_codice);
""")
print("  ok")

# 2) funzioni: prendi def dalla sorgente, trasforma, applica
FUNZIONI = ["hr_guard_attivazione_bu_bs","hr_guard_ultima_fa","hr_assegna_funzione_aziendale","hr_dip_fa_replace"]
for fn in FUNZIONI:
    d = q(HR, f"select pg_get_functiondef('public.{fn}'::regproc) d")[0]["d"]
    d = d.replace("public.", "app_hr.")                                   # ref HR -> app_hr
    d = d.replace("\nAS $function$", "\n SET search_path TO app_hr, public\nAS $function$", 1)
    q(HUB, d)
    q(HUB, f"grant execute on function app_hr.{fn} to service_role" if 'guard' not in fn else f"select 1")
    print(f"  funzione app_hr.{fn} creata")

# 3) trigger: guard_attivazione su hr.dipendenti (base, la vista non porta trigger);
#    guard_ultima_fa su app_hr.dipendente_funzione_aziendale (tabella reale)
print("trigger...")
q(HUB, "drop trigger if exists trg_guard_attivazione_bu_bs on hr.dipendenti")
q(HUB, "create trigger trg_guard_attivazione_bu_bs before update on hr.dipendenti for each row execute function app_hr.hr_guard_attivazione_bu_bs()")
q(HUB, "drop trigger if exists trg_guard_ultima_fa on app_hr.dipendente_funzione_aziendale")
q(HUB, "create trigger trg_guard_ultima_fa before delete on app_hr.dipendente_funzione_aziendale for each row execute function app_hr.hr_guard_ultima_fa()")
print("  ok")

q(HUB, "notify pgrst, 'reload schema'")
# verifica presenza
fns = q(HUB, "select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='app_hr' order by 1")
trg = q(HUB, "select tgname, c.relname from pg_trigger t join pg_class c on c.oid=t.tgrelid where tgname like 'trg_guard%' and not tgisinternal")
print("FUNZIONI app_hr:", [r["proname"] for r in fns])
print("TRIGGER:", [(r["tgname"], r["relname"]) for r in trg])
