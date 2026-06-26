# 🗺️ Topologia DB reale — 27/06/2026 (verificata dai .env)

> Questo è il fatto che cambia tutto il piano di pulizia. Letto direttamente dai file `.env.local` di ogni app, non a memoria.

## Quale DB usa ogni app

| App | DB primario (dati) | DB login (auth) |
|---|---|---|
| bp | `jwzenyppci…` (dedicato) | `bqyqr…` |
| cdg | `oentbubus…` (dedicato) | `bqyqr…` |
| fia | `oawroqmq…` (dedicato) | `bqyqr…` |
| **for** | **`lkkknwas…` (CONDIVISO)** | — |
| hr | `hsoovytr…` (dedicato) | `bqyqr…` |
| **hub** | **`bqyqr…` (CONDIVISO)** | — |
| iso | `vaczrsvo…` (dedicato) | `bqyqr…` |
| qcont | `eqprzkde…` (dedicato) | `bqyqr…` |
| quaimed | `pbbaehis…` (dedicato) | — |
| **qwork** | **`bqyqr…` (CONDIVISO)** | — |
| sales | `vqtqccn…` (dedicato) | `bqyqr…` |
| sgi | `aofnbsmf…` (dedicato) | — |
| **sic** | **`lkkknwas…` (CONDIVISO)** | `bqyqr…` |
| soa | `jxgwsxos…` (dedicato) | — |

## Le 3 zone di rischio (in ordine)

**🔴 ZONA 1 — Tabelle di login in `bqyqr…` (utenti, ruoli, accessi).**
Un rename qui tocca il **login di 10 app** (bp, cdg, fia, hr, iso, qcont, sales, sic + hub + qwork). È la zona più pericolosa in assoluto. Mai un rename casuale qui.

**🟠 ZONA 2 — Le 2 coppie che condividono il DB primario:**
- **hub + qwork** → stesso DB `bqyqr…`, entrambi leggono `utenti`/`contatti`. Un rename va deployato sulle DUE app insieme. E qwork ha **zero test**.
- **for + sic** → stesso DB `lkkknwas…`. Un rename sul DB colpisce entrambe. Per la sicurezza-corsi attenzione al filtro categoria (rischio leak corsi FOR↔SIC).

**🟢 ZONA 3 — App con DB dedicato (rename isolato):**
cdg, qcont, sales, hr, bp, fia, iso, sgi, soa, quaimed. Qui "una app alla volta = blast radius isolato" è **vero** (per questo le fasi C1/C2 su cdg/commesse sono andate lisce). Queste sono le app dove possiamo lavorare con più serenità.

## Conseguenza sul piano
La regola del piano v1 "una app alla volta = isolato" è **vera solo per la Zona 3**. Per Zona 1 e 2 serve trattamento speciale (deploy coordinato su entrambe le app della coppia; le tabelle auth mai toccate se non in un cantiere dedicato a sé). Il piano v2 lo recepisce.
