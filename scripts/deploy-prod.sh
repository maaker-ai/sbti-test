#!/usr/bin/env bash
# Deploy current branch to maaker.cn (production)
# Usage: ./scripts/deploy-prod.sh

set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "ERROR: production deploys only from main branch (current: $BRANCH)"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: working tree not clean. Commit or stash first."
  exit 1
fi

echo "==> Building (prod schema: sbti)..."
NEXT_PUBLIC_SBTI_SCHEMA=sbti npm run build

echo "==> Deploying to maaker.cn..."
rsync -az --delete \
  --exclude='.DS_Store' \
  out/ \
  xiaopang@1.15.12.53:/tmp/maaker-cn-prod-staging/

ssh xiaopang@1.15.12.53 '
  echo "123edcxZAQ" | sudo -S bash -c "
    rsync -a --delete /tmp/maaker-cn-prod-staging/ /var/www/maaker-cn/
    chown -R www-data:www-data /var/www/maaker-cn/
    rm -rf /tmp/maaker-cn-prod-staging
  "
'

echo "==> Done: https://maaker.cn/sbti"
