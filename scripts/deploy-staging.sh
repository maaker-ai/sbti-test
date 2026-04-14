#!/usr/bin/env bash
# Deploy current branch to staging.maaker.cn
# Usage: ./scripts/deploy-staging.sh

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building (staging schema: sbti_staging)..."
NEXT_PUBLIC_SBTI_SCHEMA=sbti_staging npm run build

echo "==> Deploying to staging.maaker.cn..."
rsync -az --delete \
  --exclude='.DS_Store' \
  out/ \
  xiaopang@1.15.12.53:/tmp/maaker-cn-staging-staging/

ssh xiaopang@1.15.12.53 '
  echo "123edcxZAQ" | sudo -S bash -c "
    rsync -a --delete /tmp/maaker-cn-staging-staging/ /var/www/maaker-cn-staging/
    chown -R www-data:www-data /var/www/maaker-cn-staging/
    rm -rf /tmp/maaker-cn-staging-staging
  "
'

echo "==> Done: https://staging.maaker.cn/sbti"
