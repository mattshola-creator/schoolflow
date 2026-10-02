#!/usr/bin/env bash
set -euo pipefail

umask 077

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL is required and must not be committed or logged." >&2
  exit 2
fi

backup_root="${SCHOOLFLOW_BACKUP_DIR:-./backups}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
destination="${backup_root%/}/${timestamp}/database"
mkdir -p "$destination"

pnpm exec supabase db dump --db-url "$SUPABASE_DB_URL" --role-only \
  --file "$destination/roles.sql"
pnpm exec supabase db dump --db-url "$SUPABASE_DB_URL" \
  --file "$destination/schema.sql"
pnpm exec supabase db dump --db-url "$SUPABASE_DB_URL" --data-only --use-copy \
  --file "$destination/data.sql"

(
  cd "$destination"
  sha256sum roles.sql schema.sql data.sql > SHA256SUMS
)

echo "Database backup created at $destination"
echo "Copy the timestamped parent directory to the approved encrypted off-site destination."
