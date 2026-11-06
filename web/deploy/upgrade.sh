#!/usr/bin/env bash
set -euo pipefail
umask 022
[[ $(id -u) -eq 0 ]] || { echo 'Run as root'; exit 1; }
install_root=${VANHAI_INSTALL_ROOT:-/opt/van-hai-web}
data_dir=${VANHAI_DATA_DIR:-/var/lib/van-hai-web}
lock_file=${VANHAI_UPGRADE_LOCK:-/run/lock/van-hai-web-upgrade.lock}
exec 9>"$lock_file"
flock -n 9 || { echo 'Another deployment is running'; exit 1; }
release=$(cd -- "$(dirname -- "$0")/../.." && pwd)
[[ $release == "$install_root"/releases/* && -L "$install_root/current" ]] || { echo 'Complete initial installation first'; exit 1; }
previous=$(readlink -f "$install_root/current")
[[ $previous != "$release" ]] || { echo 'Already using this release'; exit 1; }
cd "$release"
node web/deploy/verify-bundle.mjs
node web/deploy/release-operations.mjs check "$previous" "$release" "$data_dir"
# Reuse immutable dependency files when both package declarations match.
if [[ ! -e node_modules ]]; then
  if [[ -d "$previous/node_modules" ]] && cmp -s package.json "$previous/package.json" && cmp -s package-lock.json "$previous/package-lock.json"; then
    cp -al "$previous/node_modules" node_modules
  else
    npm ci --omit=dev --ignore-scripts
  fi
fi
service_stopped=0
success=0
pointer="$install_root/.current-$$"
switch_to() { ln -s "$1" "$pointer"; mv -Tf "$pointer" "$install_root/current"; }
cleanup() {
  result=$?
  trap - EXIT HUP INT TERM
  rm -f "$pointer"
  if [[ $success -eq 0 && $service_stopped -eq 1 ]]; then
    echo 'Deployment failed; restoring previous code. Database is preserved.' >&2
    systemctl stop van-hai-web || true
    if switch_to "$previous"; then
      systemctl start van-hai-web || echo 'Previous code restored, but service restart failed; inspect systemctl status.' >&2
    else
      echo 'CRITICAL: could not restore previous code symlink.' >&2
    fi
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
service_stopped=1
systemctl stop van-hai-web
# Recheck after stopping to catch a login racing the preflight check.
node web/deploy/release-operations.mjs check "$previous" "$release" "$data_dir"
runuser -u vanhai-web -- "$(command -v node)" "$previous/web/cloud/cli.mjs" backup --data "$data_dir"
switch_to "$release"
systemctl start van-hai-web
for attempt in $(seq 1 15); do
  if curl -fsS --max-time 3 http://127.0.0.1:4320/healthz | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const v=JSON.parse(s);if(!v.ok||!v.cloud)process.exitCode=1}catch{process.exitCode=1}})'; then
    success=1
    echo 'Upgraded; previous code retained. Database was not rolled back.'
    exit 0
  fi
  sleep 1
done
echo 'New release did not become healthy' >&2
exit 1
