#!/bin/bash
# Apply D1 migrations via Cloudflare REST API
# Usage: CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... D1_DATABASE_ID=... ./scripts/migrate.sh

set -e

API_BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query"

# Read SQL file and split into individual statements
SQL_FILE="migrations/0001_init.sql"

# Remove comments and empty lines, split by semicolons
statements=$(sed 's/--.*$//' "$SQL_FILE" | tr '\n' ' ' | sed 's/;/;\n/g' | grep -v '^\s*$')

echo "Applying migrations..."

while IFS= read -r stmt; do
  # Trim whitespace
  stmt=$(echo "$stmt" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
  if [ -z "$stmt" ] || [ "$stmt" = ";" ]; then
    continue
  fi

  echo "  Executing: $(echo "$stmt" | head -c 60)..."

  response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg sql "$stmt" '{sql: $sql}')")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 400 ]; then
    echo "  ERROR (HTTP $http_code): $body"
    exit 1
  fi

  echo "  OK"
done <<< "$statements"

echo "All migrations applied successfully."
