#!/usr/bin/env python3
# FASE 1+2: catalogo campi UNICO dal DB vivo (vista) + funzionalità (tabella editabile).
# Fonte unica che alimenta Hub /dizionario-campi e l'export Excel.
import json, os, re, urllib.request, urllib.error
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
HUB="bqyqrqmbekdhejrzasvv"
def q(sql):
    req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{HUB}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
    try:
        with urllib.request.urlopen(req,timeout=120) as r: return json.load(r),None
    except urllib.error.HTTPError as e: return None,e.read().decode()[:200]
SCHEMAS=['public','commerciale','commesse','formazione','sedi_partner','contabilita','cdg','hr','iso','sic','fia','bp']
inlist="("+",".join(f"'{s}'" for s in SCHEMAS)+")"
DOM={'public':'Anagrafica master','commerciale':'CRM/Commerciale','commesse':'Commesse','formazione':'Formazione','sedi_partner':'Sedi & Partner','contabilita':'Contabilità','cdg':'Controllo gestione','hr':'HR','iso':'ISO','sic':'Sicurezza','fia':'Bandi (FIA)','bp':'Business Plan'}

# 1) tabella funzionalità (editabile come qnet_mappa)
q("""create table if not exists public.catalogo_funzionalita (
  schema text not null, tabella text not null, funzionalita text,
  aggiornato_il timestamptz default now(), primary key(schema,tabella))""")
q("comment on table public.catalogo_funzionalita is 'A cosa serve ogni tabella (funzionalità). Editabile in Hub /dizionario-campi. Fonte del catalogo unico.'")
# popola dedotto (senza sovrascrivere quelle già editate)
tabs=q(f"select table_schema sch,table_name tbl from information_schema.tables where table_schema in {inlist} and table_type='BASE TABLE' and table_name not like 'v\\_%'")[0]
ins=0
for t in tabs:
    s,tb=t['sch'],t['tbl']; dom=DOM.get(s,s); tn=tb.replace('_',' ')
    fz=f"{dom} — gestione/registro di «{tn}»"
    r,_=q(f"insert into public.catalogo_funzionalita(schema,tabella,funzionalita) values ('{s}','{tb}',$f${fz}$f$) on conflict (schema,tabella) do nothing")
    if r is not None: ins+=1
print(f"catalogo_funzionalita: {len(tabs)} tabelle (popolate dedotte, non sovrascrive le editate)")

# 2) vista catalogo unico (LIVE dal DB + funzionalità + Qnet da qnet_mappa)
view="""create or replace view public.v_catalogo_campi as
select
  c.table_schema                                   as schema,
  c.table_name                                     as tabella,
  c.column_name                                    as campo,
  c.ordinal_position                               as posizione,
  coalesce(c.udt_name, c.data_type)                as tipo,
  (c.is_nullable = 'NO')                           as obbligatorio,
  exists(select 1 from pg_index i join pg_class cl on cl.oid=i.indrelid
         join pg_namespace n on n.oid=cl.relnamespace
         join pg_attribute a on a.attrelid=cl.oid and a.attnum = any(i.indkey)
         where i.indisprimary and n.nspname=c.table_schema and cl.relname=c.table_name and a.attname=c.column_name) as pk,
  (select fn.nspname||'.'||ft.relname from pg_constraint con
     join pg_class cc on cc.oid=con.conrelid join pg_namespace nn on nn.oid=cc.relnamespace
     join pg_class ft on ft.oid=con.confrelid join pg_namespace fn on fn.oid=ft.relnamespace
     join pg_attribute aa on aa.attrelid=cc.oid and aa.attnum=any(con.conkey)
     where con.contype='f' and nn.nspname=c.table_schema and cc.relname=c.table_name and aa.attname=c.column_name limit 1) as fk_verso,
  col_description(format('%s.%s', c.table_schema, c.table_name)::regclass, c.ordinal_position) as descrizione,
  qm.qnet_path,
  (qm.qnet_path is not null)                       as da_qnet,
  cf.funzionalita
from information_schema.columns c
left join public.qnet_mappa qm
  on split_part(qm.campo_id,'.',2)=c.table_name and split_part(qm.campo_id,'.',3)=c.column_name
left join public.catalogo_funzionalita cf
  on cf.schema=c.table_schema and cf.tabella=c.table_name
where c.table_schema in {sch} and c.table_name not like 'v\\_%'
""".replace("{sch}", inlist)
r,err=q(view)
print("vista v_catalogo_campi:", "OK" if r is not None else "ERR "+str(err))
q("grant select on public.v_catalogo_campi to service_role, anon, authenticated; grant all on public.catalogo_funzionalita to service_role; notify pgrst, 'reload schema'")
# verifica
chk=q("select count(*) campi, count(*) filter (where da_qnet) qnet, count(distinct funzionalita) funz from public.v_catalogo_campi")[0][0]
print("VERIFICA v_catalogo_campi:", chk)
