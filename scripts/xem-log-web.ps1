# Gom log bản web (VPS) + agent đồng bộ và LIVE server (máy này) vào một file để soát lỗi.
# Chỉ đọc, không sửa gì. Kết quả lưu ở data\web-logs\web-log-<thời gian>.txt (không lên Git).
param([int]$Lines = 40, [string]$Key = (Join-Path $env:USERPROFILE '.ssh\vanhai-admin.pem'), [string]$VpsHost = '103.82.26.70')
$ErrorActionPreference = 'Continue'
$project = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $project 'data\web-logs'; New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$outFile = Join-Path $outDir ('web-log-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.txt')
$knownHosts = Join-Path $env:USERPROFILE '.ssh\vanhai-cloudfly-known_hosts'
$out = New-Object System.Collections.Generic.List[string]
function Add([string]$text) { $out.Add($text) }

Add "######## VPS $VpsHost ($(Get-Date -Format 'dd/MM/yyyy HH:mm:ss'))"
$remote = @'
F=/var/lib/van-hai-web/logs/web-errors.jsonl
echo "== healthz"; curl -s -m 5 http://127.0.0.1:4320/healthz; echo
echo "== service"; systemctl show van-hai-web -p ActiveState,SubState,NRestarts,ActiveEnterTimestamp --no-pager
echo "== loi web moi nhat (web-errors.jsonl)"
if [ -f "$F" ]; then tail -n __N__ "$F" | node -e 'let b="";process.stdin.on("data",d=>b+=d).on("end",()=>{for(const l of b.split("\n").filter(Boolean)){try{const e=JSON.parse(l);const t=new Date(e.at).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"});console.log(`${t} [${e.kind}] ${e.route||e.page||e.name||""} ${e.message||""}${e.repeated?` (lap lai ${e.repeated} lan)`:""}${e.source?` @ ${e.source}${e.line?":"+e.line:""}`:""}${e.user?` user=${e.user}`:""}`);if(e.stack&&e.kind!=="start")console.log("    "+e.stack.split("\n").slice(0,4).join("\n    "));}catch{console.log(l.slice(0,300));}}})'; else echo "(chua co loi nao duoc ghi)"; fi
echo "== journal: canh bao/loi 24h"; journalctl -u van-hai-web --since -24h --no-pager | grep -iE 'error|fail|exception|warn|killed|exited' | tail -n 30 || true
echo "== nginx: phan hoi 5xx 24h (khong ghi IP)"; awk '$9 ~ /^5/ {print $4, $6, $7, $9}' /var/log/nginx/access.log 2>/dev/null | tail -n 20
echo "== nginx error.log"; tail -n 10 /var/log/nginx/error.log 2>/dev/null | sed -E 's/client: [0-9a-f.:]+/client: */'
echo "== may chu"; df -h / | tail -1; free -m | sed -n 2p; uptime
'@
$remote = $remote.Replace('__N__', [string]$Lines)
if (Test-Path -LiteralPath $Key) {
 $OutputEncoding = New-Object System.Text.UTF8Encoding $false
 $sshArgs = @('-i', $Key, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', "UserKnownHostsFile=$knownHosts", '-o', 'ConnectTimeout=10')
 $result = $remote | & ssh @sshArgs "root@$VpsHost" "sed '1s/^\xEF\xBB\xBF//' | tr -d '\r' | bash -s" 2>&1
 foreach ($l in $result) { Add ([string]$l) }
 if ($LASTEXITCODE -ne 0) { Add "!! SSH loi (ma $LASTEXITCODE)" }
} else { Add "!! Khong thay khoa SSH: $Key" }

Add ''; Add '######## MAY NAY'
$agentDir = Join-Path $project 'data\web-cloud-agent'
Add '== agent dong bo (loi gan nhat)'
foreach ($f in 'agent.err.log','agent.out.log') { $p = Join-Path $agentDir $f; if (Test-Path $p) { Add "-- $f"; Get-Content $p -Tail $(if ($f -like '*err*') { 20 } else { 3 }) -Encoding UTF8 | ForEach-Object { Add $_ } } }
$agentPid = Join-Path $agentDir 'agent.pid'
if (Test-Path $agentPid) { $id = [int](Get-Content $agentPid -Raw); Add ("agent PID $id dang chay: " + [bool](Get-Process -Id $id -ErrorAction SilentlyContinue)) }
Add '== watchdog'; $w = Join-Path $project 'data\watchdog-status.json'; if (Test-Path $w) { Add (Get-Content $w -Raw) }
Add '== LIVE server: su co gan nhat (server-lifecycle.jsonl)'
$life = Join-Path $project 'data\server-lifecycle.jsonl'
if (Test-Path $life) { Get-Content $life -Tail 400 -Encoding UTF8 | Where-Object { $_ -match '"type":"(fatal|exit)"' } | Select-Object -Last 6 | ForEach-Object { Add $_.Substring(0, [Math]::Min(600, $_.Length)) } }
$errLog = Get-ChildItem (Join-Path $project 'data') -Filter 'server-*-error.log' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($errLog -and $errLog.Length -gt 0) { Add "-- $($errLog.Name)"; Get-Content $errLog.FullName -Tail 15 -Encoding UTF8 | ForEach-Object { Add $_ } }

[IO.File]::WriteAllLines($outFile, $out, [Text.UTF8Encoding]::new($false))
$out | ForEach-Object { Write-Host $_ }
Write-Host ''; Write-Host "Da luu: $outFile"
