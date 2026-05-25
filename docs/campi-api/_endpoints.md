# Endpoint API suggeriti
[← Indice](README.md)

Base path proposto: `https://api.qualificagroup.org/v1/`

| Risorsa | Endpoint | Schema campi |
|---|---|---|
| Commesse APL_PAL | `GET /commesse/apl-pal` | [APL_PAL](apl-pal.md) |
| Commesse APL_RES | `GET /commesse/apl-res` | [APL_RES](apl-res.md) |
| Commesse AVV | `GET /commesse/avv` | [AVV](avv.md) |
| Commesse FIA | `GET /commesse/fia` | [FIA](fia.md) |
| Commesse FOR | `GET /commesse/for` | [FOR](for.md) |
| Commesse GAR | `GET /commesse/gar` | [GAR](gar.md) |
| Commesse GDPR | `GET /commesse/gdpr` | [GDPR](gdpr.md) |
| Commesse ISO | `GET /commesse/iso` | [ISO](iso.md) |
| Commesse IST | `GET /commesse/ist` | [IST](ist.md) |
| Commesse SIC | `GET /commesse/sic` | [SIC](sic.md) |
| Commesse SOA | `GET /commesse/soa` | [SOA](soa.md) |
| Commesse OFFERTE | `GET /commesse/offerte` | [OFFERTE](offerte.md) |
| Commesse OPP_FOR | `GET /commesse/opp-for` | [OPP_FOR](opp-for.md) |

## Filtri standard (query string)
- `?status=In%20Lavorazione`
- `?from=2026-01-01&to=2026-12-31` — range data inizio
- `?fine_from=2026-01-01&fine_to=2026-12-31` — range data fine
- `?cliente=<nome>` `?agente=<nome>`
- `?limit=1000&offset=0` — paginazione
