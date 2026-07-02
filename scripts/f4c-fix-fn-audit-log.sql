CREATE OR REPLACE FUNCTION app_hr.fn_audit_log()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE v_actor TEXT; v_old JSONB; v_new JSONB; v_id TEXT; v_keys TEXT[];
BEGIN
  BEGIN v_actor := current_setting('app.current_user_email', true); EXCEPTION WHEN OTHERS THEN v_actor := NULL; END;
  IF v_actor = '' THEN v_actor := NULL; END IF;
  IF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
    SELECT array_agg(key ORDER BY key) INTO v_keys FROM (
      SELECT key FROM jsonb_each(v_new) EXCEPT SELECT key FROM jsonb_each(v_old)
      UNION
      SELECT k.key FROM jsonb_each(v_old) k JOIN jsonb_each(v_new) n ON k.key = n.key
      WHERE k.value IS DISTINCT FROM n.value) sub
    WHERE key NOT IN ('updated_at', 'created_at');
    IF v_keys IS NULL OR array_length(v_keys, 1) IS NULL THEN RETURN NEW; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
  END IF;
  -- robusto per tabelle senza colonna id (es. configurazioni: PK=chiave)
  v_id := COALESCE(v_new->>'id', v_old->>'id', v_new->>'chiave', v_old->>'chiave');
  IF v_actor IS NULL THEN v_actor := COALESCE(v_new->>'updated_by', v_old->>'updated_by'); END IF;
  INSERT INTO app_hr.audit_log (table_name, record_id, operation, actor_email, old_data, new_data, changed_keys)
  VALUES (TG_TABLE_NAME, v_id, TG_OP, v_actor, v_old, v_new, v_keys);
  RETURN COALESCE(NEW, OLD);
END;
$fn$;
