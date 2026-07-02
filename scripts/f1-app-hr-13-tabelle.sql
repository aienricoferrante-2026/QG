-- F1: 13 tabelle HR mancanti → app_hr (generato da introspezione standalone 02/07)
-- Adattamenti: enum→text, uuid_generate_v4→gen_random_uuid, FK→hr./app_hr., RLS ON
CREATE TABLE IF NOT EXISTS app_hr.competenze (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  codice text,
  nome text NOT NULL,
  categoria text,
  descrizione text,
  attiva boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE app_hr.competenze ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.competenze_dipendente (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  dipendente_id uuid NOT NULL,
  competenza_id uuid NOT NULL,
  livello_attuale integer NOT NULL,
  data_valutazione date DEFAULT CURRENT_DATE NOT NULL,
  valutato_da text,
  note text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE app_hr.competenze_dipendente ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.competenze_mansione (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  mansione_id uuid NOT NULL,
  competenza_id uuid NOT NULL,
  livello_richiesto integer NOT NULL,
  obbligatoria boolean DEFAULT true NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE app_hr.competenze_mansione ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.contenuti_wiki (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  slug text NOT NULL,
  titolo text NOT NULL,
  categoria text NOT NULL,
  utenze text[] DEFAULT '{}'::text[] NOT NULL,
  urgenza text DEFAULT 'informativo'::text NOT NULL,
  tags text[] DEFAULT '{}'::text[],
  hook text NOT NULL,
  numeri_chiave jsonb DEFAULT '[]'::jsonb NOT NULL,
  action_summary text[] DEFAULT '{}'::text[] NOT NULL,
  callouts jsonb DEFAULT '[]'::jsonb NOT NULL,
  step jsonb DEFAULT '[]'::jsonb NOT NULL,
  faq jsonb DEFAULT '[]'::jsonb NOT NULL,
  takeaway text[] DEFAULT '{}'::text[] NOT NULL,
  chip_correlati text[] DEFAULT '{}'::text[],
  ultima_revisione date,
  autore text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE app_hr.contenuti_wiki ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.corsi_assegnati (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  dipendente_id uuid NOT NULL,
  corso_master_id uuid NOT NULL,
  stato text DEFAULT 'non_iniziato'::text NOT NULL,
  data_assegnazione date DEFAULT CURRENT_DATE NOT NULL,
  data_completamento date,
  percentuale_completamento integer DEFAULT 0
);
ALTER TABLE app_hr.corsi_assegnati ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.kpi_compilati (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  kpi_master_id uuid NOT NULL,
  dipendente_id uuid NOT NULL,
  periodo text NOT NULL,
  valore text NOT NULL,
  compilato_da uuid,
  validato_da uuid,
  data_compilazione timestamp with time zone DEFAULT now() NOT NULL,
  data_validazione timestamp with time zone,
  commento_validatore text
);
ALTER TABLE app_hr.kpi_compilati ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.mansioni_dipendente_attivita_esclusa (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  mansioni_dipendente_id uuid NOT NULL,
  attivita_id uuid NOT NULL,
  motivo text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by text
);
ALTER TABLE app_hr.mansioni_dipendente_attivita_esclusa ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.onboarding_modelli (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nome text NOT NULL,
  descrizione text,
  is_default boolean DEFAULT false NOT NULL,
  attivo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by text
);
ALTER TABLE app_hr.onboarding_modelli ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.onboarding_step_completamenti (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  dipendente_step_id uuid NOT NULL,
  data_completamento date NOT NULL,
  data_scadenza date,
  note text,
  completato_da text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE app_hr.onboarding_step_completamenti ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.utenti_cancellati (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  auth_user_id uuid NOT NULL,
  email text NOT NULL,
  nome text,
  cognome text,
  ruolo_precedente text,
  motivo text,
  snapshot_auth jsonb,
  snapshot_dipendente jsonb,
  cancellato_da text NOT NULL,
  cancellato_at timestamp with time zone DEFAULT now() NOT NULL,
  ripristinabile boolean DEFAULT true NOT NULL
);
ALTER TABLE app_hr.utenti_cancellati ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.voce_extra_mese (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  dipendente_id uuid NOT NULL,
  anno integer NOT NULL,
  mese integer NOT NULL,
  tipo text NOT NULL,
  importo numeric(12,2) NOT NULL,
  descrizione text,
  commessa_progetto_id uuid,
  inserito_da text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE app_hr.voce_extra_mese ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.voci_extra_mese (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  dipendente_id uuid NOT NULL,
  anno integer NOT NULL,
  mese integer NOT NULL,
  tipo text NOT NULL,
  importo numeric(10,2) NOT NULL,
  descrizione text,
  data_evento date,
  ricorrente_mensile boolean DEFAULT false NOT NULL,
  inserito_da uuid,
  data_inserimento timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  stato text DEFAULT 'oda_bozza'::text NOT NULL,
  data_passaggio_oda timestamp with time zone,
  data_passaggio_ftp timestamp with time zone,
  numero_documento text,
  data_documento date,
  importo_iva numeric(10,2),
  link_fattura_passiva text,
  note_documento text,
  numero_protocollo text,
  commessa_id uuid,
  aliquota_iva numeric(5,2),
  fase text,
  metodo_pagamento text,
  data_scadenza date,
  conto_mastro text,
  conto text,
  sottoconto text,
  societa_sede text
);
ALTER TABLE app_hr.voci_extra_mese ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS app_hr.segnatempo (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  dipendente_id uuid NOT NULL,
  data date NOT NULL,
  titolo text NOT NULL,
  durata_ore numeric(5,2) NOT NULL,
  commessa_id uuid,
  task text,
  note text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE app_hr.segnatempo ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_hr.competenze ADD CONSTRAINT competenze_codice_key UNIQUE (codice);
ALTER TABLE app_hr.competenze ADD CONSTRAINT competenze_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.competenze_dipendente ADD CONSTRAINT competenze_dipendente_dipendente_id_competenza_id_key UNIQUE (dipendente_id, competenza_id);
ALTER TABLE app_hr.competenze_dipendente ADD CONSTRAINT competenze_dipendente_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.competenze_dipendente ADD CONSTRAINT competenze_dipendente_livello_attuale_check CHECK (((livello_attuale >= 1) AND (livello_attuale <= 5)));
ALTER TABLE app_hr.competenze_mansione ADD CONSTRAINT competenze_mansione_mansione_id_competenza_id_key UNIQUE (mansione_id, competenza_id);
ALTER TABLE app_hr.competenze_mansione ADD CONSTRAINT competenze_mansione_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.competenze_mansione ADD CONSTRAINT competenze_mansione_livello_richiesto_check CHECK (((livello_richiesto >= 1) AND (livello_richiesto <= 5)));
ALTER TABLE app_hr.contenuti_wiki ADD CONSTRAINT contenuti_wiki_slug_key UNIQUE (slug);
ALTER TABLE app_hr.contenuti_wiki ADD CONSTRAINT contenuti_wiki_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.corsi_assegnati ADD CONSTRAINT corsi_assegnati_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.corsi_assegnati ADD CONSTRAINT corsi_assegnati_percentuale_completamento_check CHECK (((percentuale_completamento >= 0) AND (percentuale_completamento <= 100)));
ALTER TABLE app_hr.kpi_compilati ADD CONSTRAINT kpi_compilati_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.mansioni_dipendente_attivita_esclusa ADD CONSTRAINT mansioni_dipendente_attivita__mansioni_dipendente_id_attivi_key UNIQUE (mansioni_dipendente_id, attivita_id);
ALTER TABLE app_hr.mansioni_dipendente_attivita_esclusa ADD CONSTRAINT mansioni_dipendente_attivita_esclusa_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.onboarding_modelli ADD CONSTRAINT onboarding_modelli_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.onboarding_step_completamenti ADD CONSTRAINT onboarding_step_completamenti_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.segnatempo ADD CONSTRAINT segnatempo_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.utenti_cancellati ADD CONSTRAINT utenti_cancellati_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.voce_extra_mese ADD CONSTRAINT voce_extra_mese_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.voce_extra_mese ADD CONSTRAINT voce_extra_mese_mese_check CHECK (((mese >= 1) AND (mese <= 12)));
ALTER TABLE app_hr.voce_extra_mese ADD CONSTRAINT voce_extra_mese_tipo_check CHECK ((tipo = ANY (ARRAY['premio'::text, 'straordinario'::text, 'bonus'::text, 'rimborso'::text, 'altro'::text])));
ALTER TABLE app_hr.voci_extra_mese ADD CONSTRAINT voci_extra_mese_pkey PRIMARY KEY (id);
ALTER TABLE app_hr.voci_extra_mese ADD CONSTRAINT voci_extra_mese_mese_check CHECK (((mese >= 1) AND (mese <= 12)));
ALTER TABLE app_hr.competenze_dipendente ADD CONSTRAINT competenze_dipendente_competenza_id_fkey FOREIGN KEY (competenza_id) REFERENCES app_hr.competenze(id) ON DELETE CASCADE;
ALTER TABLE app_hr.competenze_dipendente ADD CONSTRAINT competenze_dipendente_dipendente_id_fkey FOREIGN KEY (dipendente_id) REFERENCES hr.dipendenti(id) ON DELETE CASCADE;
ALTER TABLE app_hr.competenze_mansione ADD CONSTRAINT competenze_mansione_mansione_id_fkey FOREIGN KEY (mansione_id) REFERENCES hr.mansioni(id) ON DELETE CASCADE;
ALTER TABLE app_hr.competenze_mansione ADD CONSTRAINT competenze_mansione_competenza_id_fkey FOREIGN KEY (competenza_id) REFERENCES app_hr.competenze(id) ON DELETE CASCADE;
ALTER TABLE app_hr.corsi_assegnati ADD CONSTRAINT corsi_assegnati_corso_master_id_fkey FOREIGN KEY (corso_master_id) REFERENCES app_hr.corsi_master(id);
ALTER TABLE app_hr.corsi_assegnati ADD CONSTRAINT corsi_assegnati_dipendente_id_fkey FOREIGN KEY (dipendente_id) REFERENCES hr.dipendenti(id) ON DELETE CASCADE;
ALTER TABLE app_hr.kpi_compilati ADD CONSTRAINT kpi_compilati_validato_da_fkey FOREIGN KEY (validato_da) REFERENCES hr.dipendenti(id);
ALTER TABLE app_hr.kpi_compilati ADD CONSTRAINT kpi_compilati_compilato_da_fkey FOREIGN KEY (compilato_da) REFERENCES hr.dipendenti(id);
ALTER TABLE app_hr.kpi_compilati ADD CONSTRAINT kpi_compilati_dipendente_id_fkey FOREIGN KEY (dipendente_id) REFERENCES hr.dipendenti(id) ON DELETE CASCADE;
ALTER TABLE app_hr.kpi_compilati ADD CONSTRAINT kpi_compilati_kpi_master_id_fkey FOREIGN KEY (kpi_master_id) REFERENCES hr.kpi_master(id);
ALTER TABLE app_hr.mansioni_dipendente_attivita_esclusa ADD CONSTRAINT mansioni_dipendente_attivita_esclus_mansioni_dipendente_id_fkey FOREIGN KEY (mansioni_dipendente_id) REFERENCES hr.mansioni_dipendente(id) ON DELETE CASCADE;
ALTER TABLE app_hr.mansioni_dipendente_attivita_esclusa ADD CONSTRAINT mansioni_dipendente_attivita_esclusa_attivita_id_fkey FOREIGN KEY (attivita_id) REFERENCES app_hr.attivita(id) ON DELETE CASCADE;
ALTER TABLE app_hr.onboarding_step_completamenti ADD CONSTRAINT onboarding_step_completamenti_dipendente_step_id_fkey FOREIGN KEY (dipendente_step_id) REFERENCES app_hr.onboarding_dipendente_step(id) ON DELETE CASCADE;
ALTER TABLE app_hr.segnatempo ADD CONSTRAINT segnatempo_commessa_id_fkey FOREIGN KEY (commessa_id) REFERENCES commesse.commesse(id);
ALTER TABLE app_hr.segnatempo ADD CONSTRAINT segnatempo_dipendente_id_fkey FOREIGN KEY (dipendente_id) REFERENCES hr.dipendenti(id) ON DELETE CASCADE;
ALTER TABLE app_hr.voce_extra_mese ADD CONSTRAINT voce_extra_mese_commessa_progetto_id_fkey FOREIGN KEY (commessa_progetto_id) REFERENCES app_hr.commessa_progetto(id) ON DELETE SET NULL;
ALTER TABLE app_hr.voce_extra_mese ADD CONSTRAINT voce_extra_mese_dipendente_id_fkey FOREIGN KEY (dipendente_id) REFERENCES hr.dipendenti(id) ON DELETE CASCADE;
ALTER TABLE app_hr.voci_extra_mese ADD CONSTRAINT voci_extra_mese_dipendente_id_fkey FOREIGN KEY (dipendente_id) REFERENCES hr.dipendenti(id) ON DELETE CASCADE;
ALTER TABLE app_hr.voci_extra_mese ADD CONSTRAINT voci_extra_mese_inserito_da_fkey FOREIGN KEY (inserito_da) REFERENCES hr.dipendenti(id);
ALTER TABLE app_hr.voci_extra_mese ADD CONSTRAINT voci_extra_mese_commessa_id_fkey FOREIGN KEY (commessa_id) REFERENCES commesse.commesse(id);
CREATE INDEX idx_competenze_categoria ON app_hr.competenze USING btree (categoria);
CREATE INDEX idx_cd_competenza ON app_hr.competenze_dipendente USING btree (competenza_id);
CREATE INDEX idx_cd_dipendente ON app_hr.competenze_dipendente USING btree (dipendente_id);
CREATE INDEX idx_cm_competenza ON app_hr.competenze_mansione USING btree (competenza_id);
CREATE INDEX idx_cm_mansione ON app_hr.competenze_mansione USING btree (mansione_id);
CREATE INDEX idx_wiki_categoria ON app_hr.contenuti_wiki USING btree (categoria);
CREATE INDEX idx_ca_dip ON app_hr.corsi_assegnati USING btree (dipendente_id);
CREATE INDEX idx_ca_master ON app_hr.corsi_assegnati USING btree (corso_master_id);
CREATE INDEX idx_ca_stato ON app_hr.corsi_assegnati USING btree (stato);
CREATE INDEX idx_kpic_dip ON app_hr.kpi_compilati USING btree (dipendente_id);
CREATE INDEX idx_kpic_periodo ON app_hr.kpi_compilati USING btree (periodo);
CREATE INDEX idx_mdae_att ON app_hr.mansioni_dipendente_attivita_esclusa USING btree (attivita_id);
CREATE INDEX idx_mdae_md ON app_hr.mansioni_dipendente_attivita_esclusa USING btree (mansioni_dipendente_id);
CREATE UNIQUE INDEX idx_onb_modelli_default_unique ON app_hr.onboarding_modelli USING btree (is_default) WHERE (is_default = true);
CREATE INDEX idx_onb_sc_step ON app_hr.onboarding_step_completamenti USING btree (dipendente_step_id);
CREATE INDEX idx_st_commessa ON app_hr.segnatempo USING btree (commessa_id);
CREATE INDEX idx_st_data ON app_hr.segnatempo USING btree (data);
CREATE INDEX idx_st_dip ON app_hr.segnatempo USING btree (dipendente_id);
CREATE INDEX idx_utenti_cancellati_data ON app_hr.utenti_cancellati USING btree (cancellato_at DESC);
CREATE INDEX idx_utenti_cancellati_email ON app_hr.utenti_cancellati USING btree (email);
CREATE INDEX voce_extra_commessa_idx ON app_hr.voce_extra_mese USING btree (commessa_progetto_id) WHERE (commessa_progetto_id IS NOT NULL);
CREATE INDEX voce_extra_dip_idx ON app_hr.voce_extra_mese USING btree (dipendente_id, anno, mese);
CREATE INDEX voce_extra_periodo_idx ON app_hr.voce_extra_mese USING btree (anno, mese);
CREATE INDEX idx_voci_commessa ON app_hr.voci_extra_mese USING btree (commessa_id);
CREATE INDEX idx_voci_dip ON app_hr.voci_extra_mese USING btree (dipendente_id);
CREATE INDEX idx_voci_periodo ON app_hr.voci_extra_mese USING btree (anno, mese);
CREATE INDEX idx_voci_protocollo ON app_hr.voci_extra_mese USING btree (numero_protocollo);
CREATE INDEX idx_voci_scadenza ON app_hr.voci_extra_mese USING btree (data_scadenza);
CREATE INDEX idx_voci_stato ON app_hr.voci_extra_mese USING btree (stato);
CREATE INDEX idx_voci_tipo ON app_hr.voci_extra_mese USING btree (tipo);
