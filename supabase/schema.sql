-- ════════════════════════════════════════════════════════════════════════════
-- STW · Schema Supabase (qualifica-stw) — snake_case
-- ----------------------------------------------------------------------------
-- Postgres normalizza in lowercase identifier non-quoted → uso snake_case.
-- Lo script seed mappa camelCase JSON → snake_case colonna.
-- ════════════════════════════════════════════════════════════════════════════

drop table if exists public.commesse cascade;
drop table if exists public.offerte cascade;
drop table if exists public.opportunita_for cascade;

create table public.commesse (
  bu                  text not null check (bu in ('FOR','ISO','SIC','APL_PAL','GDPR','SOA','AVV','GAR','FIA','APL_RES','IST')),
  id                  text not null,
  cliente             text,
  societa             text,
  sede                text,
  sede_norm           text,
  sede_op             text,
  citta               text,
  regione             text,
  indirizzo           text,
  status              text,
  stato_lav           text,
  avanzamento         numeric,
  avanzamento_raw     text,
  stato_pagamento     text,
  consulenza          numeric,
  ricavi              numeric,
  mol                 numeric,
  costi               numeric,
  ricavi_docum        numeric,
  costi_docum         numeric,
  mol_docum           numeric,
  ec_ricavi_cons      numeric,
  ec_mol_cons         numeric,
  ec_costi_cons       numeric,
  gia_incassato       numeric,
  da_incassare        numeric,
  fin_incassi_tot     numeric,
  fin_uscite_tot      numeric,
  fin_delta_tot       numeric,
  agente              text,
  responsabile        text,
  segnalatore         text,
  funzione            text,
  contatto            text,
  data_inizio         date,
  data_pian_inizio    date,
  data_fine           date,
  data_assegnazione   date,
  data_ultima_nota    date,
  contratto           text,
  id_contratto        text,
  tipo_commessa       text,
  titolo              text,
  descrizione         text,
  note                text,
  ultima_nota         text,
  erp_link            text,
  qnet_link           text,
  meta                jsonb default '{}'::jsonb,
  imported_at         timestamptz default now(),
  primary key (bu, id)
);

create index commesse_bu_idx on public.commesse(bu);
create index commesse_cliente_idx on public.commesse(cliente);
create index commesse_status_idx on public.commesse(status);
create index commesse_data_inizio_idx on public.commesse(data_inizio);
create index commesse_meta_idx on public.commesse using gin(meta);

create table public.offerte (
  id              text primary key,
  cliente         text,
  societa         text,
  sede            text,
  sede_op         text,
  agente          text,
  segnalatore     text,
  categoria       text,
  tipo            text,
  status          text,
  funzione        text,
  anno            text,
  data            text,
  data_full       text,
  totale          numeric,
  meta            jsonb default '{}'::jsonb,
  imported_at     timestamptz default now()
);
create index offerte_agente_idx on public.offerte(agente);
create index offerte_categoria_idx on public.offerte(categoria);
create index offerte_status_idx on public.offerte(status);

create table public.opportunita_for (
  id                  text primary key,
  titolo              text,
  cliente             text,
  sede                text,
  sede_op             text,
  operatore           text,
  rendicontazione     text,
  corso               text,
  corso_interesse     text,
  tipologia_corso     text,
  cpi                 text,
  provincia           text,
  status              text,
  stato_prev          text,
  fonte               text,
  annualita           text,
  data                text,
  data_ultima_nota    text,
  ultima_nota         text,
  assegnato_a         text,
  meta                jsonb default '{}'::jsonb,
  imported_at         timestamptz default now()
);
create index opp_for_operatore_idx on public.opportunita_for(operatore);
create index opp_for_cpi_idx on public.opportunita_for(cpi);
create index opp_for_status_idx on public.opportunita_for(status);

alter table public.commesse        enable row level security;
alter table public.offerte         enable row level security;
alter table public.opportunita_for enable row level security;

create policy commesse_anon_read         on public.commesse        for select using (true);
create policy offerte_anon_read          on public.offerte         for select using (true);
create policy opp_for_anon_read          on public.opportunita_for for select using (true);
