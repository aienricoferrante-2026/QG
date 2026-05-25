# OFFERTE · Campi disponibili
_File JSON sorgente: `dashboard_offerte/data/offerte.json` · 14767 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 10360/14767 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `anno` | integer | Anno | 14767/14767 | `"2022"` | Anno offerta |
| `categoria` | string | Categoria | 14767/14767 | `"ISO"` | Categoria offerta |
| `cliente` | string | Cliente | 14732/14767 | `"Maes S.r.l."` | Ragione sociale cliente |
| `data` | string | Data | 14767/14767 | `"2022-03"` | Data offerta |
| `dataFull` | date (dd-mm-yyyy) | _(no alias)_ | 14767/14767 | `"23-03-2022"` | Data offerta completa |
| `funzione` | string | Funzione aziendale, Funzione | 417/14767 | `"GDPR, SICUREZZA"` | Funzione aziendale (linea di business) |
| `id` | integer | ID | 14767/14767 | `"1"` | ID univoco Qnet della commessa |
| `sede` | string | Sede | 14752/14767 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeOp` | string | Sede Operativa | 14767/14767 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 556/14767 | `"Levrini Paola"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 14752/14767 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `status` | string | Status, Stato | 14767/14767 | `"Offerta Contrattualizzata"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipo` | string | Tipo | 14766/14767 | `"ISO_9001_14001"` | Tipo offerta |
| `totale` | number | Totale | 14767/14767 | `4400.0` | Totale offerta (€) |
