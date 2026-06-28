#!/usr/bin/env python3
# Costruisce lo schema-compat app_fia in bqyqr per il flip dell'app fia.
# - tabelle DOMINIO (incentivi, ai_valutazioni, fonti, geo_province_istat) -> VISTE su fia.*
# - tabelle OPERATIVE (app_*, utenti, ai_variazioni, scraping_reports) -> tabelle reali (DDL+dati da sorgente)
# Additivo, reversibile (drop schema app_fia cascade). Idempotente.
import json, os, re, sys, urllib.request

ENV = os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK = next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)', l).group(1).strip()
            for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")), None)
FIA, HUB = "oawroqmqepwcndcbvnba", "bqyqrqmbekdhejrzasvv"

def q(ref, sql):
    req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json", "User-Agent": "curl/8"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

DOMINIO = ["incentivi", "ai_valutazioni", "fonti", "geo_province_istat"]
OPERATIVE = ["app_organizations","app_organization_members","app_organization_invites","app_plans",
             "app_user_column_preferences","app_audit_logs","app_bando_tags","app_bando_tag_history",
             "utenti","ai_variazioni","scraping_reports"]

PGTYPE = {"character varying":"text","character":"text","timestamp with time zone":"timestamptz",
          "timestamp without time zone":"timestamp","USER-DEFINED":"text","ARRAY":"jsonb","json":"jsonb"}

q(HUB, "create schema if not exists app_fia")
print("schema app_fia ok")

# 1) viste dominio
for t in DOMINIO:
    q(HUB, f"create or replace view app_fia.{t} as select * from fia.{t}")
    print(f"  vista app_fia.{t} -> fia.{t}")

# 2) tabelle operative: DDL + dati
for t in OPERATIVE:
    cols = q(FIA, f"select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name='{t}' order by ordinal_position")
    if not cols:
        continue
    defs = ", ".join(f'"{c["column_name"]}" {PGTYPE.get(c["data_type"], c["data_type"])}' for c in cols)
    q(HUB, f"drop table if exists app_fia.{t} cascade")
    q(HUB, f"create table app_fia.{t} ({defs})")
    colnames = [c["column_name"] for c in cols]
    sel = ",".join(f'"{c}"' for c in colnames)
    rows = q(FIA, f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{t}) x")
    data = rows[0]["j"]
    n = 0
    if data and data != "[]":
        ins = (f"insert into app_fia.{t} ({sel}) select {sel} from "
               f"jsonb_to_recordset($j${data}$j$::jsonb) as r({defs})")
        q(HUB, ins)
        n = len(json.loads(data))
    print(f"  tabella app_fia.{t}: {len(cols)} col, {n} righe")

# 3) verifica
chk = q(HUB, "select count(*) n from information_schema.tables where table_schema='app_fia'")
chk2 = q(HUB, "select count(*) n from information_schema.views where table_schema='app_fia'")
print(f"\nOK app_fia: {chk2[0]['n']} viste dominio + {chk[0]['n']-chk2[0]['n']} tabelle operative")
