-- ============================================================================
-- F4: audit_log HR-format + unique organigramma + funzioni + trigger
-- Porting da standalone (hsoovy public) a bqyqr, con schema-qualificazione.
-- cdg.societa ESCLUSA dal trigger updated_at (non ha la colonna).
-- ============================================================================

-- A) app_hr.audit_log: da vista (puntava al registro HUB, formato sbagliato) a tabella base HR-format
DROP VIEW IF EXISTS app_hr.audit_log;
CREATE TABLE IF NOT EXISTS app_hr.audit_log (
  id           uuid        DEFAULT gen_random_uuid() NOT NULL,
  logged_at    timestamptz DEFAULT now() NOT NULL,
  table_name   text        NOT NULL,
  record_id    text,
  operation    text        NOT NULL,
  actor_email  text,
  old_data     jsonb,
  new_data     jsonb,
  changed_keys text[],
  CONSTRAINT app_hr_audit_log_pkey PRIMARY KEY (id)
);
ALTER TABLE app_hr.audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_apphr_audit_logged_at ON app_hr.audit_log (logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_apphr_audit_table ON app_hr.audit_log (table_name);

-- B) UNIQUE per gli ON CONFLICT dei trigger sync organigramma (0 duplicati verificati)
ALTER TABLE hr.organigramma_assegnazione
  ADD CONSTRAINT organigramma_assegnazione_ruolo_dip_uniq UNIQUE (ruolo_id, dipendente_id);

-- C) FUNZIONI (schema-qualificate, in app_hr)
CREATE OR REPLACE FUNCTION app_hr.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION app_hr.fn_audit_log()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE v_actor TEXT; v_old JSONB; v_new JSONB; v_id TEXT; v_keys TEXT[];
BEGIN
  BEGIN v_actor := current_setting('app.current_user_email', true); EXCEPTION WHEN OTHERS THEN v_actor := NULL; END;
  IF v_actor = '' THEN v_actor := NULL; END IF;
  IF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW); v_id := COALESCE(NEW.id::text, NULL);
    IF v_actor IS NULL THEN BEGIN v_actor := NEW.updated_by; EXCEPTION WHEN OTHERS THEN END; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD); v_new := to_jsonb(NEW); v_id := COALESCE(NEW.id::text, OLD.id::text, NULL);
    IF v_actor IS NULL THEN BEGIN v_actor := NEW.updated_by; EXCEPTION WHEN OTHERS THEN END; END IF;
    SELECT array_agg(key ORDER BY key) INTO v_keys FROM (
      SELECT key FROM jsonb_each(v_new) EXCEPT SELECT key FROM jsonb_each(v_old)
      UNION
      SELECT k.key FROM jsonb_each(v_old) k JOIN jsonb_each(v_new) n ON k.key = n.key
      WHERE k.value IS DISTINCT FROM n.value) sub
    WHERE key NOT IN ('updated_at', 'created_at');
    IF v_keys IS NULL OR array_length(v_keys, 1) IS NULL THEN RETURN NEW; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD); v_id := COALESCE(OLD.id::text, NULL);
    IF v_actor IS NULL THEN BEGIN v_actor := OLD.updated_by; EXCEPTION WHEN OTHERS THEN END; END IF;
  END IF;
  INSERT INTO app_hr.audit_log (table_name, record_id, operation, actor_email, old_data, new_data, changed_keys)
  VALUES (TG_TABLE_NAME, v_id, TG_OP, v_actor, v_old, v_new, v_keys);
  RETURN COALESCE(NEW, OLD);
END;
$fn$;

CREATE OR REPLACE FUNCTION app_hr.fn_sync_dip_fa_principale()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN
  IF NEW.is_principale = TRUE THEN
    UPDATE hr.dipendenti SET funzione_aziendale = NEW.fa_codice, updated_at = now()
      WHERE id = NEW.dipendente_id;
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION app_hr.fn_sync_organigramma_on_md_insert()
RETURNS trigger LANGUAGE plpgsql AS $fn$
DECLARE v_ruolo_id UUID; v_mansione_uuid UUID;
BEGIN
  IF NEW.data_fine IS NOT NULL THEN RETURN NEW; END IF;
  SELECT m.id, m.ruolo_organigramma_id INTO v_mansione_uuid, v_ruolo_id
    FROM app_hr.mansione m
    JOIN hr.mansioni ml ON LOWER(ml.nome) = LOWER(m.nome)
    WHERE ml.id = NEW.mansione_id
    LIMIT 1;
  IF v_ruolo_id IS NOT NULL THEN
    INSERT INTO hr.organigramma_assegnazione (ruolo_id, dipendente_id, created_by)
      VALUES (v_ruolo_id, NEW.dipendente_id, 'trigger-md-insert')
      ON CONFLICT (ruolo_id, dipendente_id) DO NOTHING;
    INSERT INTO app_hr.organigramma_audit (actor_email, azione, payload)
      VALUES ('trigger', 'sync-add', jsonb_build_object('ruolo_id', v_ruolo_id, 'dipendente_id', NEW.dipendente_id, 'source', 'mansioni_dipendente.insert'));
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION app_hr.fn_sync_organigramma_on_md_update()
RETURNS trigger LANGUAGE plpgsql AS $fn$
DECLARE v_ruolo_id UUID;
BEGIN
  IF OLD.data_fine IS NULL AND NEW.data_fine IS NOT NULL THEN
    SELECT m.ruolo_organigramma_id INTO v_ruolo_id
      FROM app_hr.mansione m JOIN hr.mansioni ml ON LOWER(ml.nome) = LOWER(m.nome)
      WHERE ml.id = NEW.mansione_id LIMIT 1;
    IF v_ruolo_id IS NOT NULL THEN
      DELETE FROM hr.organigramma_assegnazione
        WHERE ruolo_id = v_ruolo_id AND dipendente_id = NEW.dipendente_id;
    END IF;
  END IF;
  IF OLD.data_fine IS NOT NULL AND NEW.data_fine IS NULL THEN
    SELECT m.ruolo_organigramma_id INTO v_ruolo_id
      FROM app_hr.mansione m JOIN hr.mansioni ml ON LOWER(ml.nome) = LOWER(m.nome)
      WHERE ml.id = NEW.mansione_id LIMIT 1;
    IF v_ruolo_id IS NOT NULL THEN
      INSERT INTO hr.organigramma_assegnazione (ruolo_id, dipendente_id, created_by)
        VALUES (v_ruolo_id, NEW.dipendente_id, 'trigger-md-update')
        ON CONFLICT (ruolo_id, dipendente_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION app_hr.fn_sync_organigramma_on_md_delete()
RETURNS trigger LANGUAGE plpgsql AS $fn$
DECLARE v_ruolo_id UUID;
BEGIN
  SELECT m.ruolo_organigramma_id INTO v_ruolo_id
    FROM app_hr.mansione m JOIN hr.mansioni ml ON LOWER(ml.nome) = LOWER(m.nome)
    WHERE ml.id = OLD.mansione_id LIMIT 1;
  IF v_ruolo_id IS NOT NULL THEN
    DELETE FROM hr.organigramma_assegnazione
      WHERE ruolo_id = v_ruolo_id AND dipendente_id = OLD.dipendente_id;
    INSERT INTO app_hr.organigramma_audit (actor_email, azione, payload)
      VALUES ('trigger', 'sync-remove', jsonb_build_object('ruolo_id', v_ruolo_id, 'dipendente_id', OLD.dipendente_id, 'source', 'mansioni_dipendente.delete'));
  END IF;
  RETURN OLD;
END;
$fn$;

-- D) TRIGGER (idempotenti: drop+create) — timing/eventi identici allo standalone
-- updated_at su tabelle app_hr
DROP TRIGGER IF EXISTS competenze_updated_at ON app_hr.competenze;
CREATE TRIGGER competenze_updated_at BEFORE UPDATE ON app_hr.competenze FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS competenze_dipendente_updated_at ON app_hr.competenze_dipendente;
CREATE TRIGGER competenze_dipendente_updated_at BEFORE UPDATE ON app_hr.competenze_dipendente FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS config_updated_at ON app_hr.configurazioni;
CREATE TRIGGER config_updated_at BEFORE UPDATE ON app_hr.configurazioni FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS wiki_updated_at ON app_hr.contenuti_wiki;
CREATE TRIGGER wiki_updated_at BEFORE UPDATE ON app_hr.contenuti_wiki FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS onb_dip_updated_at ON app_hr.onboarding_dipendente;
CREATE TRIGGER onb_dip_updated_at BEFORE UPDATE ON app_hr.onboarding_dipendente FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS onb_ds_updated_at ON app_hr.onboarding_dipendente_step;
CREATE TRIGGER onb_ds_updated_at BEFORE UPDATE ON app_hr.onboarding_dipendente_step FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS onb_modelli_updated_at ON app_hr.onboarding_modelli;
CREATE TRIGGER onb_modelli_updated_at BEFORE UPDATE ON app_hr.onboarding_modelli FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS onb_step_updated_at ON app_hr.onboarding_step;
CREATE TRIGGER onb_step_updated_at BEFORE UPDATE ON app_hr.onboarding_step FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS reparti_updated_at ON app_hr.reparti;
CREATE TRIGGER reparti_updated_at BEFORE UPDATE ON app_hr.reparti FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
-- updated_at su nucleo hr
DROP TRIGGER IF EXISTS dipendenti_updated_at ON hr.dipendenti;
CREATE TRIGGER dipendenti_updated_at BEFORE UPDATE ON hr.dipendenti FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS fa_updated_at ON hr.funzioni_aziendali;
CREATE TRIGGER fa_updated_at BEFORE UPDATE ON hr.funzioni_aziendali FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
DROP TRIGGER IF EXISTS sedi_updated_at ON hr.sedi;
CREATE TRIGGER sedi_updated_at BEFORE UPDATE ON hr.sedi FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();
-- (cdg.societa: SALTATO — colonna updated_at assente)

-- audit (REGISTRO AUDIT) su app_hr + nucleo hr
DROP TRIGGER IF EXISTS trg_audit_configurazioni ON app_hr.configurazioni;
CREATE TRIGGER trg_audit_configurazioni AFTER INSERT OR DELETE OR UPDATE ON app_hr.configurazioni FOR EACH ROW EXECUTE FUNCTION app_hr.fn_audit_log();
DROP TRIGGER IF EXISTS trg_audit_documenti_assegnati ON app_hr.documenti_assegnati;
CREATE TRIGGER trg_audit_documenti_assegnati AFTER INSERT OR DELETE OR UPDATE ON app_hr.documenti_assegnati FOR EACH ROW EXECUTE FUNCTION app_hr.fn_audit_log();
DROP TRIGGER IF EXISTS trg_audit_documenti_master ON app_hr.documenti_master;
CREATE TRIGGER trg_audit_documenti_master AFTER INSERT OR DELETE OR UPDATE ON app_hr.documenti_master FOR EACH ROW EXECUTE FUNCTION app_hr.fn_audit_log();
DROP TRIGGER IF EXISTS trg_audit_onboarding_modelli ON app_hr.onboarding_modelli;
CREATE TRIGGER trg_audit_onboarding_modelli AFTER INSERT OR DELETE OR UPDATE ON app_hr.onboarding_modelli FOR EACH ROW EXECUTE FUNCTION app_hr.fn_audit_log();
DROP TRIGGER IF EXISTS trg_audit_dipendenti ON hr.dipendenti;
CREATE TRIGGER trg_audit_dipendenti AFTER INSERT OR DELETE OR UPDATE ON hr.dipendenti FOR EACH ROW EXECUTE FUNCTION app_hr.fn_audit_log();
DROP TRIGGER IF EXISTS trg_audit_mansioni_dipendente ON hr.mansioni_dipendente;
CREATE TRIGGER trg_audit_mansioni_dipendente AFTER INSERT OR DELETE OR UPDATE ON hr.mansioni_dipendente FOR EACH ROW EXECUTE FUNCTION app_hr.fn_audit_log();
DROP TRIGGER IF EXISTS trg_audit_kpi_master ON hr.kpi_master;
CREATE TRIGGER trg_audit_kpi_master AFTER INSERT OR DELETE OR UPDATE ON hr.kpi_master FOR EACH ROW EXECUTE FUNCTION app_hr.fn_audit_log();

-- sync FA principale + organigramma
DROP TRIGGER IF EXISTS tr_sync_dip_fa_principale ON app_hr.dipendente_funzione_aziendale;
CREATE TRIGGER tr_sync_dip_fa_principale AFTER INSERT OR UPDATE OF is_principale, fa_codice ON app_hr.dipendente_funzione_aziendale FOR EACH ROW EXECUTE FUNCTION app_hr.fn_sync_dip_fa_principale();
DROP TRIGGER IF EXISTS tr_sync_organigramma_md_insert ON hr.mansioni_dipendente;
CREATE TRIGGER tr_sync_organigramma_md_insert AFTER INSERT ON hr.mansioni_dipendente FOR EACH ROW EXECUTE FUNCTION app_hr.fn_sync_organigramma_on_md_insert();
DROP TRIGGER IF EXISTS tr_sync_organigramma_md_update ON hr.mansioni_dipendente;
CREATE TRIGGER tr_sync_organigramma_md_update AFTER UPDATE ON hr.mansioni_dipendente FOR EACH ROW EXECUTE FUNCTION app_hr.fn_sync_organigramma_on_md_update();
DROP TRIGGER IF EXISTS tr_sync_organigramma_md_delete ON hr.mansioni_dipendente;
CREATE TRIGGER tr_sync_organigramma_md_delete AFTER DELETE ON hr.mansioni_dipendente FOR EACH ROW EXECUTE FUNCTION app_hr.fn_sync_organigramma_on_md_delete();

-- E) identity mancante per il cron qnet-sync
ALTER TABLE app_hr.hr_qnet_sync_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;
