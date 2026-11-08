# Restart LIVE server + watchdog so both carry WEB_SYNC_SECRET (read from the private agent config, never stored here).
# Saves both worlds and buffers incoming gifts before stopping. Run only when not streaming.
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$node = (Get-Command node.exe).Source
$base = 'http://127.0.0.1:4317'
$configFile = Join-Path $project 'data/web-cloud-agent.json'
$cfg = Get-Content -LiteralPath $configFile -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $cfg.secret -or $cfg.secret.Length -lt 48) { throw 'Cloud secret missing in data/web-cloud-agent.json' }
$env:WEB_SYNC_SECRET = $cfg.secret
$serverFile = [IO.Path]::GetFullPath((Join-Path $project 'server.mjs'))
$watchFile = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'server-watchdog.mjs'))
$procs = @(Get-CimInstance Win32_Process -Filter "name = 'node.exe'")
$servers = @($procs | Where-Object { $_.CommandLine -and $_.CommandLine.Replace('/','\').IndexOf($serverFile,[StringComparison]::OrdinalIgnoreCase) -ge 0 })
$watchers = @($procs | Where-Object { $_.CommandLine -and $_.CommandLine.Replace('/','\').IndexOf($watchFile,[StringComparison]::OrdinalIgnoreCase) -ge 0 })
if ($servers.Count -gt 1) { throw 'Multiple server processes found. Stop and inspect before restarting.' }
if ($servers.Count -eq 0) {
 $existing = $null
 try { $existing = Invoke-RestMethod "$base/api/state?world=live" -TimeoutSec 3 } catch {}
 if ($existing) { throw 'Port 4317 is occupied, but its process cannot be identified safely.' }
}
$pauseFile = Join-Path $project 'data/watchdog.pause'
Set-Content -LiteralPath $pauseFile -Value ([DateTimeOffset]::Now.ToUnixTimeMilliseconds())
try {
 foreach ($w in $watchers) { Stop-Process -Id $w.ProcessId }
 $bufferPath = Join-Path $project "data/gift-handover-cloud-sync-$stamp.json"
 if ($servers.Count -eq 1) {
  $live = Invoke-RestMethod "$base/api/export?world=live"
  $disk = Get-Content -LiteralPath 'data/live.json' -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($live.createdAt -ne $disk.createdAt) { throw 'Running server belongs to a different data folder.' }
  $buffer = Start-Process -FilePath $node -ArgumentList @('scripts/capture-restart-gifts.mjs',"data/gift-handover-cloud-sync-$stamp.json") -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput "data/cloud-sync-buffer-$stamp.log" -RedirectStandardError "data/cloud-sync-buffer-$stamp-error.log" -PassThru
  Start-Sleep -Milliseconds 700
  $buffer.Refresh()
  $status = Invoke-RestMethod "$base/api/state?world=live"
  if ($status.connection.status -eq 'connected' -and $buffer.HasExited) { throw 'Gift buffer failed; original server left running.' }
  foreach ($world in @('live','demo')) { Invoke-WebRequest "$base/api/export?world=$world" -UseBasicParsing -OutFile "data/$world-pre-cloud-sync-$stamp.json" }
  $serverId = $servers[0].ProcessId
  $workers = @(Get-CimInstance Win32_Process -Filter "ParentProcessId = $serverId" | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -match 'vieneu_worker.py' })
  Stop-Process -Id $serverId
  foreach ($worker in $workers) { Stop-Process -Id $worker.ProcessId -ErrorAction SilentlyContinue }
  foreach ($world in @('live','demo')) { Copy-Item -LiteralPath "data/$world-pre-cloud-sync-$stamp.json" -Destination "data/$world.json" }
  $env:VAN_HAI_RECOVERY_FILE = $bufferPath
 }
 $env:WEB_PROFILE_ONLY = '1'
 $env:PORT = '4317'
 $env:VAN_HAI_TTS = 'vieneu'
 $env:VAN_HAI_TTS_THREADS = '2'
 $process = Start-Process -FilePath $node -ArgumentList ('"' + $serverFile + '"') -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput "data/server-cloud-sync-$stamp.log" -RedirectStandardError "data/server-cloud-sync-$stamp-error.log" -PassThru
 $ready = $false
 for ($attempt=0; $attempt -lt 40; $attempt++) {
  $process.Refresh()
  if ($process.HasExited) { throw "New server exited. Check data/server-cloud-sync-$stamp-error.log" }
  try { $status = Invoke-RestMethod "$base/api/state?world=live" -TimeoutSec 2; if ($status.bondRulesVersion -eq 1) { $ready=$true; break } } catch {}
  Start-Sleep -Milliseconds 500
 }
 if (!$ready) { throw "Server did not start. Check data/server-cloud-sync-$stamp-error.log" }
 Remove-Item Env:VAN_HAI_RECOVERY_FILE -ErrorAction SilentlyContinue
 Write-Host "Server ready, PID $($process.Id), cloud transfer secret loaded."
} finally {
 if (Test-Path -LiteralPath $pauseFile) { Remove-Item -LiteralPath $pauseFile }
}
# Watchdog inherits WEB_SYNC_SECRET from this process, so any automatic respawn keeps cloud transfers working.
powershell.exe -NoProfile -File (Join-Path $PSScriptRoot 'start-watchdog.ps1')
