#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $EUID -eq 0 ]] || { echo 'Run as root'; exit 1; }
release=$(cd -- "$(dirname -- "$0")/../.." && pwd)
[[ $release == /opt/van-hai-web/releases/* && -L /opt/van-hai-web/current ]] || exit 1
previous=$(readlink -f /opt/van-hai-web/current)
[[ $previous != "$release" ]] || { echo 'Already using this release'; exit 1; }
cd "$release"
npm ci --omit=dev --ignore-scripts
node web/deploy/verify-bundle.mjs
systemctl stop van-hai-web
trap 'ln -sfn "$previous" /opt/van-hai-web/current; systemctl start van-hai-web' ERR
runuser -u vanhai-web -- /usr/bin/node "$previous/web/cloud/cli.mjs" backup --data /var/lib/van-hai-web
ln -sfn "$release" /opt/van-hai-web/current
systemctl start van-hai-web
for attempt in $(seq 1 15); do if curl -fsS http://127.0.0.1:4320/healthz >/dev/null; then trap - ERR; echo 'Upgraded; previous code retained for rollback. Database was not rolled back.'; exit 0; fi; sleep 1; done
echo 'New release did not become healthy'; exit 1
