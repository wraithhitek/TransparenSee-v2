#!/bin/bash
set -e

export MPLADS_AUTH_DISABLED=1
export MPLADS_LOG_LEVEL=INFO
export PYTHONPATH="/app:$PYTHONPATH"

DB_PATH="data/processed/mplads.db"

has_tables=0
if [ -f "$DB_PATH" ]; then
  echo "==> Checking database..."
  if python -c "import sqlite3; conn = sqlite3.connect('$DB_PATH'); cursor = conn.cursor(); cursor.execute('SELECT count(*) FROM dim_mp'); res = cursor.fetchone(); conn.close(); exit(0 if res and res[0] > 0 else 1)" 2>/dev/null; then
    echo "==> Database verified with active tables. Skipping rebuild."
    has_tables=1
  else
    echo "==> Database exists but is incomplete. Removing and rebuilding..."
    rm -f "$DB_PATH"
  fi
fi

if [ "$has_tables" -eq 0 ]; then
  echo "==> Database not found. Running pipeline (lightweight mode)..."
  python scripts/run_pipeline.py --offline --skip-eda --skip-dashboard --skip-duplicates
  echo "==> Pipeline complete."
fi

echo "==> Starting API server on port ${PORT:-8000}..."
exec uvicorn backend.api.main:app --host 0.0.0.0 --port "${PORT:-8000}" --access-log --no-use-colors
