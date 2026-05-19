# GitHub Secrets richieste per `regenerate-json.yml`

> ⚠ Il file workflow è in `tools/regenerate-json.workflow.yml.template`
> (non in `.github/workflows/` perché il PAT di Claude non ha lo scope
> `workflow`). Prima di poterlo usare devi spostarlo a mano:
>
> ```bash
> mkdir -p .github/workflows
> cp tools/regenerate-json.workflow.yml.template .github/workflows/regenerate-json.yml
> git add .github/workflows/regenerate-json.yml
> git commit -m "Workflow regenerate-json (cron 15min Supabase→JSON)"
> git push
> ```

Poi gira ogni 15 min e rigenera i JSON statici delle dashboard pescando
da Supabase. Per farlo funzionare devi anche impostare due secrets sul
repository GitHub.

## Setup veloce (UI GitHub)

1. Vai su `Settings → Secrets and variables → Actions → New repository secret`
2. Crea due secrets con questi nomi (i valori sono nel tuo `.env.supabase` locale):

   | Nome                          | Valore                              |
   |-------------------------------|-------------------------------------|
   | `SUPABASE_URL`                | es. `https://xxxx.supabase.co`      |
   | `SUPABASE_SERVICE_ROLE_KEY`   | la service role key (lunga, eyJ...) |

3. Esegui un run manuale dal tab `Actions → Rigenera JSON dashboard da Supabase → Run workflow` per verificare.

## Setup via `gh` CLI (se installata)

```bash
cd /Users/enricoferrante/Desktop/STW
source .env.supabase
gh secret set SUPABASE_URL --body "$SUPABASE_URL"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SUPABASE_SERVICE_ROLE_KEY"
```

## Costo cron `*/15 * * * *`

GitHub Actions free per repository pubblico = illimitato. Per repo privato
ci sono 2000 min/mese inclusi. Il job dura ~30s → ~96 run/giorno × 0.5
min = 48 min/giorno ≈ 1440 min/mese. Sotto la soglia free anche se privato.

Se vuoi ridurre, edita il cron in `.github/workflows/regenerate-json.yml`:
- ogni 30 min: `*/30 * * * *`
- ogni ora:    `0 * * * *`
