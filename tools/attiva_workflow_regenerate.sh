#!/usr/bin/env bash
# Attiva il workflow regenerate-json in 1 colpo solo.
# Da lanciare DAL TUO TERMINALE (Claude usa un PAT senza scope 'workflow',
# quindi non può fare il push dei file dentro .github/workflows/).
#
# USO:
#   cd /Users/enricoferrante/Desktop/STW
#   bash tools/attiva_workflow_regenerate.sh
#
set -e

cd "$(dirname "$0")/.." || exit 1
REPO_ROOT="$(pwd)"

echo "▶ Attivo workflow regenerate-json da $REPO_ROOT"
echo

# 1. Trova .env.supabase (può stare in repo principale o nel worktree)
ENV_FILE=""
for candidate in \
    "$REPO_ROOT/.env.supabase" \
    "$REPO_ROOT/.claude/worktrees/vigorous-shirley-2ebbe8/.env.supabase" \
    "$HOME/Desktop/STW/.env.supabase"; do
  if [ -f "$candidate" ]; then ENV_FILE="$candidate"; break; fi
done

if [ -z "$ENV_FILE" ]; then
  echo "⚠ Non trovo .env.supabase. Controllato:"
  echo "   $REPO_ROOT/.env.supabase"
  echo "   $REPO_ROOT/.claude/worktrees/vigorous-shirley-2ebbe8/.env.supabase"
  echo "   $HOME/Desktop/STW/.env.supabase"
  echo "Aggiungi a mano le secrets su GitHub e rilancia, oppure crea il file."
  exit 1
fi
echo "✓ env trovato: $ENV_FILE"

# 2. Verifica template esista
TEMPLATE="$REPO_ROOT/tools/regenerate-json.workflow.yml.template"
if [ ! -f "$TEMPLATE" ]; then
  echo "⚠ Manca $TEMPLATE — fai prima 'git pull origin main'."
  exit 1
fi

# 3. Verifica branch + working tree pulito (solo per i file che tocco io)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "✓ branch corrente: $BRANCH"
if git status --porcelain .github/workflows/ 2>/dev/null | grep -q .; then
  echo "⚠ Ci sono già modifiche pendenti dentro .github/workflows/. Verifica con 'git status .github/workflows/'."
  exit 1
fi

# 4. Copia + commit
mkdir -p .github/workflows
cp "$TEMPLATE" .github/workflows/regenerate-json.yml
git add .github/workflows/regenerate-json.yml

if git diff --staged --quiet; then
  echo "ℹ Il workflow è già presente identico, salto il commit."
else
  git commit -m "Workflow regenerate-json (cron 15min Supabase→JSON)"
  echo "✓ Commit creato."
fi

# 5. Push
echo
echo "▶ Push verso origin/$BRANCH ..."
if ! git push; then
  echo
  echo "⚠ Push fallito. Se ti dice 'workflow scope', il tuo PAT non basta:"
  echo "  rigenera un PAT su https://github.com/settings/tokens con scope 'workflow'."
  exit 1
fi

# 6. Mostra le secrets per copia/incolla manuale
echo
echo "✅ Workflow pushato. Ultimo step: imposta le 2 secrets su GitHub."
echo
echo "   Apro la pagina secrets nel browser..."
open "https://github.com/aienricoferrante-2026/QG/settings/secrets/actions/new" 2>/dev/null || true
echo
echo "   ── COPIA & INCOLLA ─────────────────────────────────────────"
echo "   Secret 1 di 2:"
echo "     Name : SUPABASE_URL"
echo "     Value: $(grep ^SUPABASE_URL= "$ENV_FILE" | head -1 | cut -d= -f2-)"
echo
echo "   Secret 2 di 2:"
echo "     Name : SUPABASE_SERVICE_ROLE_KEY"
echo "     Value: $(grep ^SUPABASE_SERVICE_ROLE_KEY= "$ENV_FILE" | head -1 | cut -d= -f2-)"
echo "   ────────────────────────────────────────────────────────────"
echo
echo "   Dopo aver salvato entrambe, vai su Actions e clicca 'Run workflow'"
echo "   per testare: https://github.com/aienricoferrante-2026/QG/actions"
