-- Parità FIA: default+PK+FK+identity+RLS+trigger+indici (generato 02/07)
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
ALTER TABLE fia.ai_valutazioni ALTER COLUMN creata_il SET DEFAULT now();
ALTER TABLE fia.ai_valutazioni ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE fia.ai_valutazioni ALTER COLUMN stato_revisione SET DEFAULT 'da_rivedere'::text;
ALTER TABLE app_fia.ai_variazioni ALTER COLUMN data_variazione SET DEFAULT now();
ALTER TABLE app_fia.ai_variazioni ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_fia.ai_variazioni ALTER COLUMN notificata SET DEFAULT false;
ALTER TABLE app_fia.app_audit_logs ALTER COLUMN ts SET DEFAULT now();
ALTER TABLE app_fia.app_bando_tag_history ALTER COLUMN creato_il SET DEFAULT now();
ALTER TABLE app_fia.app_bando_tag_history ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_fia.app_bando_tags ALTER COLUMN creato_il SET DEFAULT now();
ALTER TABLE app_fia.app_bando_tags ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_fia.app_organization_invites ALTER COLUMN creato_il SET DEFAULT now();
ALTER TABLE app_fia.app_organization_invites ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_fia.app_organization_invites ALTER COLUMN ruolo SET DEFAULT 'member'::text;
ALTER TABLE app_fia.app_organization_invites ALTER COLUMN stato SET DEFAULT 'pending'::text;
ALTER TABLE app_fia.app_organization_members ALTER COLUMN attivo SET DEFAULT true;
ALTER TABLE app_fia.app_organization_members ALTER COLUMN entrato_il SET DEFAULT now();
ALTER TABLE app_fia.app_organization_members ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_fia.app_organization_members ALTER COLUMN ruolo SET DEFAULT 'member'::text;
ALTER TABLE app_fia.app_organizations ALTER COLUMN aggiornata_il SET DEFAULT now();
ALTER TABLE app_fia.app_organizations ALTER COLUMN attiva SET DEFAULT true;
ALTER TABLE app_fia.app_organizations ALTER COLUMN creata_il SET DEFAULT now();
ALTER TABLE app_fia.app_organizations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_fia.app_organizations ALTER COLUMN max_membri SET DEFAULT 3;
ALTER TABLE app_fia.app_organizations ALTER COLUMN piano SET DEFAULT 'starter'::text;
ALTER TABLE app_fia.app_plans ALTER COLUMN attivo SET DEFAULT true;
ALTER TABLE app_fia.app_plans ALTER COLUMN creato_il SET DEFAULT now();
ALTER TABLE app_fia.app_plans ALTER COLUMN prezzo_anno SET DEFAULT 0;
ALTER TABLE app_fia.app_plans ALTER COLUMN prezzo_mese SET DEFAULT 0;
ALTER TABLE app_fia.app_user_column_preferences ALTER COLUMN contesto SET DEFAULT 'bandi'::text;
ALTER TABLE app_fia.app_user_column_preferences ALTER COLUMN posizione SET DEFAULT 0;
ALTER TABLE app_fia.app_user_column_preferences ALTER COLUMN visibile SET DEFAULT true;
ALTER TABLE fia.fonti ALTER COLUMN aggiornata_il SET DEFAULT now();
ALTER TABLE fia.fonti ALTER COLUMN attiva SET DEFAULT true;
ALTER TABLE fia.fonti ALTER COLUMN canali SET DEFAULT '{privato}'::text[];
ALTER TABLE fia.fonti ALTER COLUMN creata_il SET DEFAULT now();
ALTER TABLE fia.fonti ALTER COLUMN email_report SET DEFAULT true;
ALTER TABLE fia.fonti ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE fia.fonti ALTER COLUMN metodo SET DEFAULT 'http'::text;
ALTER TABLE fia.fonti ALTER COLUMN tipo SET DEFAULT 'scraping'::text;
ALTER TABLE fia.incentivi ALTER COLUMN canali SET DEFAULT '{}'::text[];
ALTER TABLE fia.incentivi ALTER COLUMN fetched_at SET DEFAULT now();
ALTER TABLE fia.incentivi ALTER COLUMN raw_data SET DEFAULT '{}'::jsonb;
ALTER TABLE fia.incentivi ALTER COLUMN stato_bando SET DEFAULT 'sconosciuto'::text;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN bandi_aggiornati SET DEFAULT 0;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN bandi_estratti SET DEFAULT 0;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN bandi_inseriti SET DEFAULT 0;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN bandi_saltati SET DEFAULT 0;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE app_fia.scraping_reports ALTER COLUMN errori_count SET DEFAULT 0;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN ha_risultati SET DEFAULT false;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN pagine_elaborate SET DEFAULT 0;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN report_email_inviato SET DEFAULT false;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN visitata SET DEFAULT false;
ALTER TABLE app_fia.utenti ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE app_fia.utenti ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE app_fia.utenti ALTER COLUMN is_superadmin SET DEFAULT false;
ALTER TABLE app_fia.utenti ALTER COLUMN ruolo SET DEFAULT 'collaboratore'::text;
ALTER TABLE app_fia.utenti ALTER COLUMN stato SET DEFAULT 'attivo'::text;
ALTER TABLE app_fia.utenti ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE app_fia.app_audit_logs ALTER COLUMN id DROP DEFAULT;
do $$ begin ALTER TABLE app_fia.app_audit_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY; exception when others then raise notice 'identity skip: %', sqlerrm; end $$;
ALTER TABLE app_fia.app_user_column_preferences ALTER COLUMN id DROP DEFAULT;
do $$ begin ALTER TABLE app_fia.app_user_column_preferences ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY; exception when others then raise notice 'identity skip: %', sqlerrm; end $$;
ALTER TABLE fia.geo_province_istat ALTER COLUMN id DROP DEFAULT;
do $$ begin ALTER TABLE fia.geo_province_istat ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY; exception when others then raise notice 'identity skip: %', sqlerrm; end $$;
ALTER TABLE app_fia.scraping_reports ALTER COLUMN id DROP DEFAULT;
do $$ begin ALTER TABLE app_fia.scraping_reports ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY; exception when others then raise notice 'identity skip: %', sqlerrm; end $$;
do $$ begin ALTER TABLE fia.ai_valutazioni ADD CONSTRAINT ai_valutazioni_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.ai_variazioni ADD CONSTRAINT ai_variazioni_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.ai_variazioni ADD CONSTRAINT ai_variazioni_tipo_check CHECK ((tipo = ANY (ARRAY['proroga'::text, 'faq'::text, 'rettifica'::text, 'allegato'::text, 'chiusura'::text, 'altro'::text]))); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_audit_logs ADD CONSTRAINT app_audit_logs_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_bando_tag_history ADD CONSTRAINT app_bando_tag_history_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_bando_tags ADD CONSTRAINT app_bando_tags_incentivo_id_org_id_creato_da_key UNIQUE (incentivo_id, org_id, creato_da); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_bando_tags ADD CONSTRAINT app_bando_tags_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_organization_invites ADD CONSTRAINT app_organization_invites_token_hash_key UNIQUE (token_hash); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_organization_invites ADD CONSTRAINT app_organization_invites_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_organization_members ADD CONSTRAINT app_organization_members_org_id_user_id_key UNIQUE (org_id, user_id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_organization_members ADD CONSTRAINT app_organization_members_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_organizations ADD CONSTRAINT app_organizations_slug_key UNIQUE (slug); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_organizations ADD CONSTRAINT app_organizations_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_plans ADD CONSTRAINT app_plans_pkey PRIMARY KEY (nome); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_user_column_preferences ADD CONSTRAINT app_user_column_preferences_user_id_colonna_contesto_key UNIQUE (user_id, colonna, contesto); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_user_column_preferences ADD CONSTRAINT app_user_column_preferences_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE fia.fonti ADD CONSTRAINT fonti_source_name_key UNIQUE (source_name); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE fia.fonti ADD CONSTRAINT fonti_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE fia.geo_province_istat ADD CONSTRAINT geo_province_istat_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE fia.incentivi ADD CONSTRAINT incentivi_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.scraping_reports ADD CONSTRAINT scraping_reports_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.utenti ADD CONSTRAINT utenti_email_key UNIQUE (email); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.utenti ADD CONSTRAINT utenti_pkey PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
-- SKIP (auth.users diverso su bqyqr): ai_valutazioni.ai_valutazioni_rivisto_da_fkey
do $$ begin ALTER TABLE fia.ai_valutazioni ADD CONSTRAINT ai_valutazioni_incentivo_id_fkey FOREIGN KEY (incentivo_id) REFERENCES fia.incentivi(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.ai_variazioni ADD CONSTRAINT ai_variazioni_incentivo_id_fkey FOREIGN KEY (incentivo_id) REFERENCES fia.incentivi(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_audit_logs ADD CONSTRAINT app_audit_logs_org_id_fkey FOREIGN KEY (org_id) REFERENCES app_fia.app_organizations(id) ON DELETE SET NULL; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
-- SKIP (auth.users diverso su bqyqr): app_audit_logs.app_audit_logs_user_id_fkey
-- SKIP (auth.users diverso su bqyqr): app_bando_tag_history.app_bando_tag_history_user_id_fkey
do $$ begin ALTER TABLE app_fia.app_bando_tag_history ADD CONSTRAINT app_bando_tag_history_incentivo_id_fkey FOREIGN KEY (incentivo_id) REFERENCES fia.incentivi(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_bando_tag_history ADD CONSTRAINT app_bando_tag_history_org_id_fkey FOREIGN KEY (org_id) REFERENCES app_fia.app_organizations(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_bando_tags ADD CONSTRAINT app_bando_tags_org_id_fkey FOREIGN KEY (org_id) REFERENCES app_fia.app_organizations(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
do $$ begin ALTER TABLE app_fia.app_bando_tags ADD CONSTRAINT app_bando_tags_incentivo_id_fkey FOREIGN KEY (incentivo_id) REFERENCES fia.incentivi(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
-- SKIP (auth.users diverso su bqyqr): app_bando_tags.app_bando_tags_creato_da_fkey
-- SKIP (auth.users diverso su bqyqr): app_organization_invites.app_organization_invites_accettato_da_fkey
-- SKIP (auth.users diverso su bqyqr): app_organization_invites.app_organization_invites_invitato_da_fkey
do $$ begin ALTER TABLE app_fia.app_organization_invites ADD CONSTRAINT app_organization_invites_org_id_fkey FOREIGN KEY (org_id) REFERENCES app_fia.app_organizations(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
-- SKIP (auth.users diverso su bqyqr): app_organization_members.app_organization_members_invitato_da_fkey
do $$ begin ALTER TABLE app_fia.app_organization_members ADD CONSTRAINT app_organization_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES app_fia.app_organizations(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
-- SKIP (auth.users diverso su bqyqr): app_organization_members.app_organization_members_user_id_fkey
-- SKIP (auth.users diverso su bqyqr): app_organizations.app_organizations_creato_da_fkey
-- SKIP (auth.users diverso su bqyqr): app_user_column_preferences.app_user_column_preferences_user_id_fkey
do $$ begin ALTER TABLE fia.incentivi ADD CONSTRAINT incentivi_source_name_fkey FOREIGN KEY (source_name) REFERENCES fia.fonti(source_name) ON UPDATE CASCADE; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
-- SKIP (auth.users diverso su bqyqr): incentivi.incentivi_scheda_validata_da_fkey
do $$ begin ALTER TABLE app_fia.scraping_reports ADD CONSTRAINT scraping_reports_fonte_id_fkey FOREIGN KEY (fonte_id) REFERENCES fia.fonti(id) ON DELETE SET NULL; exception when duplicate_object then null; when duplicate_table then null; when invalid_table_definition then null; end $$;
CREATE INDEX IF NOT EXISTS idx_ai_val_canale ON fia.ai_valutazioni USING btree (canale);
CREATE INDEX IF NOT EXISTS idx_ai_val_confidenza ON fia.ai_valutazioni USING btree (confidenza);
CREATE INDEX IF NOT EXISTS idx_ai_val_incentivo ON fia.ai_valutazioni USING btree (incentivo_id);
CREATE INDEX IF NOT EXISTS idx_ai_val_stato ON fia.ai_valutazioni USING btree (stato_revisione);
CREATE INDEX IF NOT EXISTS idx_ai_var_incentivo ON app_fia.ai_variazioni USING btree (incentivo_id);
CREATE INDEX IF NOT EXISTS idx_ai_var_tipo ON app_fia.ai_variazioni USING btree (tipo);
CREATE INDEX IF NOT EXISTS idx_audit_azione ON app_fia.app_audit_logs USING btree (azione);
CREATE INDEX IF NOT EXISTS idx_audit_org ON app_fia.app_audit_logs USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON app_fia.app_audit_logs USING btree (ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON app_fia.app_audit_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_bando_tags_incentivo ON app_fia.app_bando_tags USING btree (incentivo_id);
CREATE INDEX IF NOT EXISTS idx_bando_tags_org ON app_fia.app_bando_tags USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_bando_tags_tag ON app_fia.app_bando_tags USING btree (tag);
CREATE INDEX IF NOT EXISTS idx_membri_org ON app_fia.app_organization_members USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_membri_user ON app_fia.app_organization_members USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_org_slug ON app_fia.app_organizations USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_geo_regione ON fia.geo_province_istat USING btree (regione);
CREATE INDEX IF NOT EXISTS idx_incentivi_canali ON fia.incentivi USING gin (canali);
CREATE INDEX IF NOT EXISTS idx_incentivi_content_hash ON fia.incentivi USING btree (content_hash);
CREATE INDEX IF NOT EXISTS idx_incentivi_data_chiusura ON fia.incentivi USING btree (data_chiusura);
CREATE INDEX IF NOT EXISTS idx_incentivi_fetched_at ON fia.incentivi USING btree (fetched_at);
CREATE INDEX IF NOT EXISTS idx_incentivi_source_name ON fia.incentivi USING btree (source_name);
CREATE INDEX IF NOT EXISTS idx_incentivi_titolo_trgm ON fia.incentivi USING gin (titolo extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_scraping_fonte ON app_fia.scraping_reports USING btree (fonte_id);
CREATE INDEX IF NOT EXISTS idx_scraping_source ON app_fia.scraping_reports USING btree (source_name);
CREATE INDEX IF NOT EXISTS idx_scraping_started ON app_fia.scraping_reports USING btree (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_status ON app_fia.scraping_reports USING btree (status);
CREATE INDEX IF NOT EXISTS idx_utenti_email ON app_fia.utenti USING btree (lower(email));
do $$ declare r record; begin
  for r in select n.nspname s, c.relname t from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname in ('fia','app_fia') and c.relkind='r' and not c.relrowsecurity loop
    execute format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.s, r.t);
  end loop; end $$;
CREATE OR REPLACE FUNCTION app_fia.set_aggiornata_il()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN NEW.aggiornata_il = NOW(); RETURN NEW; END; $fn$;
DROP TRIGGER IF EXISTS fonti_aggiornata_il ON fia.fonti;
CREATE TRIGGER fonti_aggiornata_il BEFORE UPDATE ON fia.fonti FOR EACH ROW EXECUTE FUNCTION app_fia.set_aggiornata_il();
DROP TRIGGER IF EXISTS org_aggiornata_il ON app_fia.app_organizations;
CREATE TRIGGER org_aggiornata_il BEFORE UPDATE ON app_fia.app_organizations FOR EACH ROW EXECUTE FUNCTION app_fia.set_aggiornata_il();
