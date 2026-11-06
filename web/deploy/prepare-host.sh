#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Can chay bang root'; exit 1; }
umask 022
revision=${1:?Missing setup revision}
[[ $revision =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid revision'; exit 1; }
site=/etc/nginx/sites-available/van-hai-web
[[ ! -e /etc/van-hai-web.env && ! -e /opt/van-hai-web/current ]] || { echo 'Da co ban cai game; dung lai de tranh ghi de'; exit 1; }
install -d -m 755 /var/www/van-hai-web-waiting
status_file=/var/www/van-hai-web-waiting/setup-status.json
printf '{"https_prepared":false,"phase":"preparing","revision":"%s"}\n' "$revision" > "$status_file"
cleanup() {
  result=$?
  trap - EXIT HUP INT TERM
  if [[ $result -ne 0 ]]; then
    printf '{"https_prepared":false,"phase":"failed","revision":"%s","exit_code":%s}\n' "$revision" "$result" > "$status_file"
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
cat > /var/www/van-hai-web-waiting/index.html <<'HTML'
<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vân Hải Tông</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#111827;color:#f9fafb;font:18px system-ui;text-align:center}main{padding:24px}p{color:#cbd5e1}</style><main><h1>Vân Hải Tông</h1><p>Game đang được chuẩn bị. Vui lòng quay lại sau.</p></main></html>
HTML
if [[ ! -e $site ]]; then
cat > "$site" <<'NGINX'
# vanhai-waiting-bootstrap
server {
    listen 80;
    server_name vanhaitong.duckdns.org;
    root /var/www/van-hai-web-waiting;
    index index.html;
    location / { try_files $uri /index.html; }
}
NGINX
else
  grep -Fq '# vanhai-waiting-bootstrap' "$site" || { echo 'Cau hinh nginx da ton tai; can kiem tra truoc'; exit 1; }
fi
ln -sfn "$site" /etc/nginx/sites-enabled/van-hai-web
nginx -t
systemctl reload nginx
certbot --nginx -d vanhaitong.duckdns.org --non-interactive --agree-tos --register-unsafely-without-email --redirect --reinstall
systemctl enable --now certbot.timer
printf '{"https_prepared":true,"game_ready":false,"phase":"waiting-for-live-data","revision":"%s"}\n' "$revision" > "$status_file"
echo 'HTTPS DA SAN SANG - CHI LA TRANG CHO, CHUA MO GAME'
