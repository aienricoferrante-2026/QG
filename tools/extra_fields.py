"""Mapping dei campi Excel → JSON specifici delle BU complesse.

Tenuti separati da convert_sectors.FIELD_MAP per due motivi:
  1. il convert li applica per TUTTI i settori (lookup in cascata) senza
     impattare le BU che non hanno queste colonne;
  2. mantiene il file principale snello e leggibile.

ISO non vive qui: ha il suo iso_parser.FIELD_MAP_EXTRA perché aggiunge anche
parser del Titolo e date keys numerose.
"""

# --- SOA (Attestazioni) ---
SOA = {
    "Soa Attestante": "soaAttestante",
    "SOA Attestante": "soaAttestante",
    "Nome dell'Ente di Certiifcazione 9001": "enteCert9001",
    "Nome dell'Ente di Certificazione 9001": "enteCert9001",
    "Scadenza Ente di Certiifcazione 9001": "scadenzaCert",
    "Scadenza Ente di Certificazione 9001": "scadenzaCert",
    "Aggiornamento Settimanale": "aggSettimanale",
    "Data Firma Contratto": "dataFirmaContratto",
    "Appartenenza Consorzio": "consorzioFlag",
    "Nome del Consorzio": "consorzio",
    "Ultima Chiamata": "ultimaChiamata",
    "Invio Contratto": "invioContratto",
}

# --- GAR (Gare d'appalto) ---
GAR = {
    "Protocollo": "garProtocollo",
    "Data Inserimento": "garDataInserimento",
    "Oggetto": "garOggetto",
    "Importo Gara": "garImporto",
    "CIG": "garCIG",
    "Data scadenza": "garDataScadenza",
    "Ora scadenza": "garOraScadenza",
    "Categoria e Classe Servizi": "garCategoria",
    "Ente Appaltante": "garEnte",
    "Imponibile": "garImponibile",
    "Offerta al Ribasso %": "garRibassoPct",
    "Offerta al Ribasso": "garRibasso",
    "Offerta": "garOfferta",
    "Esito": "garEsito",
    "Aggiudicataria": "garAggiudicataria",
    "Aggiudicataria Ribasso": "garAggiudicatariaRibasso",
    "Aggiudicataria Ribasso %": "garAggiudicatariaRibassoPct",
    "Aggiudicataria Punti Ric. P.T.": "garAggiudicatariaPunti",
    "Note Esito": "garNoteEsito",
}

# --- APL_RES (PAL Risorse) ---
APL_RES = {
    "Data Inizio Lavorazione": "aplDataInizioLav",
    "Data Fine Lavorazione": "aplDataFineLav",
    "Numero Risorse": "aplNumeroRisorse",
    "Profilo Risorse": "aplProfilo",
    "Requisiti Profilo": "aplRequisiti",
    "Data Richiamo": "aplDataRichiamo",
    "Variazione Ricerca": "aplVariazioneRicerca",
    "Candidati Selezionati": "aplCandidati",
}

# --- GDPR (Privacy) ---
GDPR = {
    "Stato Pagamento": "gdprStatoPag",
    "Accordo sui Pagamenti": "gdprAccordo",
    "Insoluti": "gdprInsoluti",
    "Data Ultima Chiamata": "gdprDataUltimaChiamata",
    "Data Ultimo Richiamo": "gdprDataUltimoRichiamo",
}

# Union unico esportato a convert_sectors.
ALL = {**SOA, **GAR, **APL_RES, **GDPR}

# Date keys raggruppate per settore (utile per il check in parse_row)
DATE_KEYS = {
    # SOA
    "dataFirmaContratto", "scadenzaCert", "ultimaChiamata",
    "invioContratto", "aggSettimanale",
    # GAR
    "garDataInserimento", "garDataScadenza",
    # APL_RES
    "aplDataInizioLav", "aplDataFineLav", "aplDataRichiamo",
    # GDPR
    "gdprDataUltimaChiamata", "gdprDataUltimoRichiamo",
}

# Numeric keys delle BU complesse
NUMERIC_KEYS = {
    "garImporto", "garImponibile", "garRibasso", "garRibassoPct",
    "garOfferta", "garAggiudicatariaRibasso",
    "garAggiudicatariaRibassoPct", "garAggiudicatariaPunti",
    "aplNumeroRisorse", "aplCandidati",
}
