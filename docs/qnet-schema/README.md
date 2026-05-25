# Mappatura Qnet API V2 · per Ciro

## Cos'è

Excel pre-compilato da inviare a **Ciro Cacciapuoti** (autore Qnet) per
sapere, per ogni campo che usiamo nelle nostre dashboard / webapp, come
si chiama davvero nel database Qnet, in che tabella sta, di che tipo è
e su quale endpoint API V2 si trova.

## File

- `qnet-fields-template-per-ciro.xlsx` — l'Excel da mandare (168 righe)

## Composizione

| Sezione | Campi | Note |
|---|---:|---|
| `common` | 51 | comuni a 10+ BU (id, cliente, status, ricavi, ecc.) |
| ISO | 24 | isoEnte, isoScopoProposto, isoStatoCert, ecc. |
| FOR | 21 | anticipo*/saldo* (regione), corso, codClasse, ecc. |
| GAR | 19 | garCIG, garImporto, garEsito, ecc. |
| OPP_FOR | 13 | operatore, cpi, corsoInteresse, ecc. |
| AVV | 9 | avvCIG, avvCategoria, avvClassifica, ecc. |
| SOA | 8 | soaAttestante, consorzio*, enteCert9001 |
| OFFERTE | 6 | opportunita, totale, dataContratto |
| APL_RES | 5 | aplProfilo, aplNumeroRisorse, ecc. |
| GDPR | 4 | gdprAccordo, gdprInsoluti |
| APL_PAL, FIA, IST, SIC | 2-2 | residui dopo i comuni |
| **TOTALE** | **168** | |

## Cosa chiediamo a Ciro di compilare (5 colonne in giallo)

| Colonna | Esempio |
|---|---|
| Tabella Qnet | `orders`, `ord_progress`, `tasks` |
| Nome campo SQL | `soa_certifier_id`, `amount_consulting` |
| Tipo SQL | `varchar(255)`, `decimal(10,2)`, `FK→users.id` |
| Endpoint API V2 | `GET /api/v2/orders` |
| Note | "FK joinata con users.full_name", "deprecato dal 2025", ecc. |

## Rigenerare

```bash
python3 tools/generate_ciro_template.py
```

## Quando Ciro restituisce l'Excel compilato

1. Salvalo qui come `qnet-fields-template-per-ciro-COMPILATO-<data>.xlsx`
2. Lancio uno script che lo legge e produce:
   - `docs/qnet-schema/_qnet-mapping.json` — mappa nome-Qnet → camelCase
   - `docs/qnet-schema/<tabella>.md` — un file per tabella Qnet con tutti i campi
3. Da lì posso scrivere il sync automatico Qnet API V2 → Supabase
