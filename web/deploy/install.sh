#!/usr/bin/env bash
set -euo pipefail
umask 077
[[ $EUID -eq 0 ]] || { echo 'Run as root or sudo'; exit 1; }
domain=${1:?Usage: install.sh game.example.com}
[[ $domain =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ && $domain == *.* && ${#domain} -le 253 ]] || { echo 'Invalid domain'; exit 1; }
release=$(cd -- "$(dirname -- "$0")/../.." && pwd)
[[ $release == /opt/van-hai-web/releases/* ]] || { echo 'Extract under /opt/van-hai-web/releases/<version> first'; exit 1; }
command -v node >/dev/null || { echo 'Install supported Node.js LTS (24 or newer) first'; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<24)process.exit(1);require("node:sqlite")'
command -v nginx >/dev/null || { echo 'Install nginx first'; exit 1; }
command -v certbot >/dev/null || { echo 'Install certbot and python3-certbot-nginx first'; exit 1; }
[[ ! -e /etc/van-hai-web.env && ! -e /opt/van-hai-web/current ]] || { echo 'Existing install found; use upgrade.sh to preserve it'; exit 1; }
id vanhai-web >/dev/null 2>&1 || useradd --system --home-dir /var/lib/van-hai-web --create-home --shell /usr/sbin/nologin vanhai-web
install -d -m 700 -o vanhai-web -g vanhai-web /var/lib/van-hai-web
cd "$release"
npm ci --omit=dev --ignore-scripts
node web/deploy/verify-bundle.mjs
sync_secret=$(openssl rand -hex 32)
printf 'WEB_CLOUD_DATA_DIR=/var/lib/van-hai-web\nWEB_PORT=4320\nWEB_SYNC_SECRET=%s\n' "$sync_secret" >/etc/van-hai-web.env
chmod 600 /etc/van-hai-web.env
ln -s "$release" /opt/van-hai-web/current
install -m 644 web/deploy/van-hai-web.service /etc/systemd/system/van-hai-web.service
sed "s/__DOMAIN__/$domain/g" web/deploy/nginx.conf >/etc/nginx/sites-available/van-hai-web
[[ ! -e /etc/nginx/sites-enabled/van-hai-web ]] && ln -s /etc/nginx/sites-available/van-hai-web /etc/nginx/sites-enabled/van-hai-web
nginx -t
systemctl daemon-reload
echo 'Installed but NOT started. Import the existing private account snapshot before starting the service.'
echo 'Then: systemctl enable --now van-hai-web; systemctl reload nginx'
echo 'After DNS points here: certbot --nginx -d <domain> --redirect'
echo 'Keep /etc/van-hai-web.env private; use its secret in the local agent configuration.'
