-- migration-erp-doppio-binario-log.sql — applicata a bqyqr 29/06/2026
-- Tabella storica del controllo doppio-binario (cutover readiness ERP).
-- Additiva, reversibile. DOWN: drop table public.erp_doppio_binario_log;
create table if not exists public.erp_doppio_binario_log (
  id            bigint generated always as identity primary key,
  eseguito_at   timestamptz not null default now(),
  verde         boolean     not null,
  domini_ok     int         not null,
  domini_drift  int         not null,
  dettaglio     jsonb       not null
);
comment on table public.erp_doppio_binario_log is
  'Storico controllo doppio-binario sorgenti-live vs bqyqr (ERP cutover readiness). Verde=0 drift. Alimentata da scripts/doppio-binario-erp.py (cron 4h).';
