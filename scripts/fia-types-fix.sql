
DROP VIEW IF EXISTS app_fia.v_fonti_stato;
DROP VIEW IF EXISTS app_fia.incentivi;
DROP VIEW IF EXISTS app_fia.fonti;
DROP VIEW IF EXISTS app_fia.ai_valutazioni;
ALTER TABLE fia.incentivi ALTER COLUMN canali TYPE text[]
  USING (case when canali is null or canali='' then null else translate(canali,'[]"','{}')::text[] end);
ALTER TABLE fia.fonti ALTER COLUMN canali TYPE text[]
  USING (case when canali is null or canali='' then null else translate(canali,'[]"','{}')::text[] end);
ALTER TABLE fia.ai_valutazioni ALTER COLUMN campi_mancanti TYPE text[]
  USING (case when campi_mancanti is null or campi_mancanti='' then null else translate(campi_mancanti,'[]"','{}')::text[] end);
ALTER TABLE fia.incentivi ALTER COLUMN tipologia_ente_pubblico TYPE text[]
  USING (case when tipologia_ente_pubblico is null or tipologia_ente_pubblico='' then null else translate(tipologia_ente_pubblico,'[]"','{}')::text[] end);

CREATE VIEW app_fia.incentivi AS SELECT * FROM fia.incentivi;
CREATE VIEW app_fia.fonti AS SELECT * FROM fia.fonti;
CREATE VIEW app_fia.ai_valutazioni AS SELECT * FROM fia.ai_valutazioni;
CREATE VIEW app_fia.v_fonti_stato AS SELECT f.id,
    f.source_name,
    f.nome,
    f.url_base,
    f.url_lista,
    f.tipo,
    f.canali,
    f.attiva,
    f.metodo,
    f.email_report,
    sr.status AS ultimo_stato,
    sr.started_at AS ultimo_avvio,
    sr.completed_at AS ultimo_completamento,
    sr.visitata,
    sr.ha_risultati,
    sr.bandi_estratti,
    sr.bandi_inseriti,
    sr.bandi_aggiornati,
    sr.errori_count,
    sr.duration_seconds
   FROM app_fia.fonti f
     LEFT JOIN LATERAL ( SELECT s.id,
            s.fonte_id,
            s.source_name,
            s.task_id,
            s.status,
            s.started_at,
            s.completed_at,
            s.duration_seconds,
            s.visitata,
            s.ha_risultati,
            s.bandi_estratti,
            s.bandi_inseriti,
            s.bandi_aggiornati,
            s.bandi_saltati,
            s.errori_count,
            s.pagine_elaborate,
            s.errori_dettaglio,
            s.mapping_errors,
            s.report_email_inviato,
            s.created_at
           FROM app_fia.scraping_reports s
          WHERE s.source_name = f.source_name
          ORDER BY s.started_at DESC
         LIMIT 1) sr ON true;
