#!/bin/bash
set -e

export MPLADS_AUTH_DISABLED=1
export MPLADS_LOG_LEVEL=INFO
export PYTHONPATH="/app:$PYTHONPATH"

DB_PATH="data/processed/mplads.db"
GZ_PATH="data/processed/mplads.db.gz"

if [ ! -f "$DB_PATH" ] && [ -f "$GZ_PATH" ]; then
    echo "==> Extracting prebuilt database from $GZ_PATH..."
    python -c "import gzip, shutil; shutil.copyfileobj(gzip.open('$GZ_PATH', 'rb'), open('$DB_PATH', 'wb'))"
    echo "==> Database extracted successfully."
fi

echo "==> Starting API server on port ${PORT:-8080}..."
exec uvicorn backend.api.main:app --host 0.0.0.0 --port "${PORT:-8080}" --workers 1 --access-log --no-use-colors