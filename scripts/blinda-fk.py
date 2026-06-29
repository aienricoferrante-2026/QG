#!/usr/bin/env python3
# Blinda l'integrità: per i *_id senza FK con target chiaro + 0 orfani, AGGIUNGE la FK.
# Additivo/reversibile (drop constraint). Salta soft-link (codice) e casi con orfani.
import json, os, re, urllib.request, urllib.error
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
HUB="bqyqrqmbekdhejrzasvv"
def q(sql):
    req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{HUB}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
    try:
        with urllib.request.urlopen(req,timeout=120) as r: return json.load(r),None
    except urllib.error.HTTPError as e: return None,e.read().decode()[:160]
SCH="('public','commerciale','commesse','formazione','sedi_partner','contabilita','cdg','hr','iso','sic','fia','bp')"
# mappa nome-radice -> tabella target (schema.tabella) con colonna chiave 'id'
TGT={
 'azienda':'public.aziende','cliente':'public.aziende','fornitore':'public.aziende','partner_azienda':'public.aziende',
 'contatto':'public.contatti','contatto_principale':'public.contatti',
 'utente':'public.utenti','operatore':'public.utenti','titolare':'public.utenti','created_by_utente':'public.utenti','responsabile':'public.utenti','assegnato_a':'public.utenti','rivisto_da':'public.utenti',
 'commessa':'commesse.commesse','opportunita':'commerciale.opportunita','opportunita_for':'commerciale.opportunita_for',
 'offerta':'commerciale.offerta','deal':'commerciale.deal','ordine_cliente':'commerciale.ordine_cliente','campagna':'commerciale.campagna',
 'dipendente':'hr.dipendenti','mansione':'hr.mansioni','discente':'formazione.discente','iscrizione':'formazione.iscrizione',
 'incentivo':'fia.incentivi','incentivi':'fia.incentivi','agente':'contabilita.agente_commerciale',
 'partner':'public.aziende','oda':'contabilita.oda','filiale':'hr.sedi','bmc':'bp.bmc',
 'agente_commerciale':'contabilita.agente_commerciale','provvigione_calcolata':'contabilita.provvigione_calcolata',
 'fonte':'commerciale.fonte','prodotto':'commerciale.prodotti','societa':'cdg.societa',
}
cols=q(f"""select c.table_schema sch,c.table_name tbl,c.column_name col from information_schema.columns c
 where c.table_schema in {SCH} and c.column_name like '%\\_id' and c.column_name<>'qnet_id'
 and exists(select 1 from pg_class cl join pg_namespace n on n.oid=cl.relnamespace where n.nspname=c.table_schema and cl.relname=c.table_name and cl.relkind='r')
 and not exists (select 1 from information_schema.key_column_usage k join information_schema.table_constraints t on t.constraint_name=k.constraint_name and t.constraint_type='FOREIGN KEY' where k.table_schema=c.table_schema and k.table_name=c.table_name and k.column_name=c.column_name)
 order by 1,2,3""")[0]
added=0; orph=0; notgt=0; skip=0; report=[]
for c in cols:
    root=c['col'][:-3]  # toglie _id
    tgt=TGT.get(root)
    if not tgt: notgt+=1; continue
    tsch,ttbl=tgt.split('.')
    # target esiste con colonna id?
    ex=q(f"select 1 from information_schema.columns where table_schema='{tsch}' and table_name='{ttbl}' and column_name='id'")[0]
    if not ex: notgt+=1; continue
    # orfani?
    oc=q(f"select count(*) n from {c['sch']}.{c['tbl']} s where s.{c['col']} is not null and not exists (select 1 from {tsch}.{ttbl} t where t.id=s.{c['col']})")
    if oc[0] is None: skip+=1; continue
    n=oc[0][0]['n']
    if n>0:
        orph+=1; report.append(('ORFANI',f"{c['sch']}.{c['tbl']}.{c['col']} -> {tgt}: {n} orfani")); continue
    # aggiungi FK NOT VALID->validate? usa diretta (0 orfani quindi valida)
    cn=f"fk_{c['tbl']}_{c['col']}"[:60]
    r,err=q(f"alter table {c['sch']}.{c['tbl']} add constraint {cn} foreign key ({c['col']}) references {tsch}.{ttbl}(id)")
    if r is not None: added+=1
    else: skip+=1; report.append(('SKIP',f"{c['sch']}.{c['tbl']}.{c['col']}: {err}"))
print(f"FK aggiunte: {added} · con orfani (no): {orph} · senza target mappato: {notgt} · skip: {skip}")
for tag,m in report[:25]: print(f"  [{tag}] {m}")
