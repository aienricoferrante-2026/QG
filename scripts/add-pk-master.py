#!/usr/bin/env python3
# Aggiunge PRIMARY KEY (id) alle tabelle senza PK dove 'id' è valido (not-null + unico).
import json, os, re, urllib.request, urllib.error
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
HUB="bqyqrqmbekdhejrzasvv"
def q(sql):
    req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{HUB}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
    try:
        with urllib.request.urlopen(req,timeout=120) as r: return json.load(r),None
    except urllib.error.HTTPError as e: return None,e.read().decode()[:150]
SCH="('public','commerciale','commesse','formazione','sedi_partner','contabilita','cdg','hr','iso','sic','fia','bp')"
# tabelle senza PK ma con colonna 'id'
nopk=q(f"""select n.nspname sch, c.relname tbl from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname in {SCH} and c.relkind='r'
 and not exists (select 1 from pg_index i where i.indrelid=c.oid and i.indisprimary)
 and exists (select 1 from information_schema.columns col where col.table_schema=n.nspname and col.table_name=c.relname and col.column_name='id')
 order by 1,2""")[0]
added=0; bad=[]
for t in nopk:
    s,tb=t['sch'],t['tbl']
    chk=q(f"select count(*) tot, count(distinct id) dist, count(*) filter (where id is null) nulli from {s}.{tb}")[0]
    if chk is None: bad.append((f"{s}.{tb}","check fallito")); continue
    d=chk[0]
    if d['nulli']==0 and d['tot']==d['dist']:
        r,err=q(f"alter table {s}.{tb} add primary key (id)")
        if r is not None: added+=1
        else: bad.append((f"{s}.{tb}",err))
    else:
        bad.append((f"{s}.{tb}",f"id non valido (null={d['nulli']}, tot={d['tot']}, distinti={d['dist']})"))
print(f"PK aggiunte: {added} / {len(nopk)} tabelle senza-PK-con-id")
for n,m in bad[:20]: print(f"  ⚠️ {n}: {m}")
