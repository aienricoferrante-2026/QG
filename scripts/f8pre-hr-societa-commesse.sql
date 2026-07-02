-- F8-pre: societa e commesse in forma HR nel nucleo hr + repoint viste app_hr
-- (le consolidate cdg.societa / commesse.commesse restano intatte per le altre app)

CREATE TABLE IF NOT EXISTS hr.societa (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  codice text NOT NULL,
  denominazione text NOT NULL,
  partita_iva text,
  codice_fiscale text,
  id_qnet text,
  attivo boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  codice_azienda_payroll text,
  alias_denominazioni_payroll text[] DEFAULT ARRAY[]::text[],
  CONSTRAINT hr_societa_pkey PRIMARY KEY (id),
  CONSTRAINT hr_societa_codice_uniq UNIQUE (codice)
);
ALTER TABLE hr.societa ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS societa_updated_at ON hr.societa;
CREATE TRIGGER societa_updated_at BEFORE UPDATE ON hr.societa FOR EACH ROW EXECUTE FUNCTION app_hr.set_updated_at();

CREATE TABLE IF NOT EXISTS hr.commesse (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  codice text NOT NULL,
  cliente text,
  descrizione text,
  fa_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT hr_commesse_pkey PRIMARY KEY (id),
  CONSTRAINT hr_commesse_fa_id_fkey FOREIGN KEY (fa_id) REFERENCES hr.funzioni_aziendali(id)
);
ALTER TABLE hr.commesse ENABLE ROW LEVEL SECURITY;

-- repoint viste (forma diversa → drop+create)
DROP VIEW IF EXISTS app_hr.societa;
CREATE VIEW app_hr.societa AS SELECT * FROM hr.societa;
DROP VIEW IF EXISTS app_hr.commesse;
CREATE VIEW app_hr.commesse AS SELECT * FROM hr.commesse;
