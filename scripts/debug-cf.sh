#!/bin/bash
# Debug Cloudflare API access
# Usage: CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... bash scripts/debug-cf.sh

echo "=== Verify Token ==="
curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq .

echo ""
echo "=== List Pages Projects ==="
curl -s "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq '.result[]?.name // "No Pages projects found"'

echo ""
echo "=== List Workers Scripts ==="
curl -s "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq '.result[]?.id // "No Workers scripts found"'
