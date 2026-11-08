# Run manually from the project folder after reviewing. Saves both worlds before restarting.
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$node = (Get-Command node.exe).Source
$base = 'http://127.0.0.1:4317'
$serverFile = [IO.Path]::GetFullPath((Join-Path $project 'server.mjs'))
# Match this project's absolute entrypoint, never unrelated ./server.mjs processes.
$servers = @(Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Replace('/','\').IndexOf($serverFile,[StringComparison]::OrdinalIgnoreCase) -ge 0 })
if ($servers.Count -gt 1) { throw 'Multiple server processes found. Stop and inspect before restarting.' }
if ($servers.Count -eq 0) {
 $existing = $null
 try { $existing = Invoke-RestMethod "$base/api/state?world=live" -TimeoutSec 3 } catch {}
 if ($existing) { throw 'Port 4317 is occupied, but its process cannot be identified safely. Original server left running.' }
}
$pauseFile = Join-Path $project 'data/watchdog.pause'
Set-Content -LiteralPath $pauseFile -Value ([DateTimeOffset]::Now.ToUnixTimeMilliseconds())
try {
$bufferPath = Join-Path $project "data/gift-handover-race-gift-$stamp.json"
if ($servers.Count -eq 1) {
 $live = Invoke-RestMethod "$base/api/export?world=live"
 $disk = Get-Content -LiteralPath 'data/live.json' -Raw -Encoding UTF8 | ConvertFrom-Json
 if ($live.createdAt -ne $disk.createdAt) { throw 'Running server belongs to a different data folder.' }
 $buffer = Start-Process -FilePath $node -ArgumentList @('scripts/capture-restart-gifts.mjs',"data/gift-handover-race-gift-$stamp.json") -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput "data/race-gift-buffer-$stamp.log" -RedirectStandardError "data/race-gift-buffer-$stamp-error.log" -PassThru
 Start-Sleep -Milliseconds 700
 $buffer.Refresh()
 $status = Invoke-RestMethod "$base/api/state?world=live"
 if ($status.connection.status -eq 'connected' -and $buffer.HasExited) { throw 'Gift buffer failed; original server left running.' }
 foreach ($world in @('live','demo')) { Invoke-WebRequest "$base/api/export?world=$world" -UseBasicParsing -OutFile "data/$world-pre-race-gift-$stamp.json" }
 $serverId = $servers[0].ProcessId
 $workers = @(Get-CimInstance Win32_Process -Filter "ParentProcessId = $serverId" | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -match 'vieneu_worker.py' })
 Stop-Process -Id $serverId
 foreach ($worker in $workers) { Stop-Process -Id $worker.ProcessId -ErrorAction SilentlyContinue }
 foreach ($world in @('live','demo')) { Copy-Item -LiteralPath "data/$world-pre-race-gift-$stamp.json" -Destination "data/$world.json" }
 $env:VAN_HAI_RECOVERY_FILE = $bufferPath
}
$env:WEB_PROFILE_ONLY = '1'
$env:PORT = '4317'
$env:VAN_HAI_TTS = 'vieneu'
$env:VAN_HAI_TTS_THREADS = '2'
$process = Start-Process -FilePath $node -ArgumentList ('"' + $serverFile + '"') -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput "data/server-race-gift-$stamp.log" -RedirectStandardError "data/server-race-gift-$stamp-error.log" -PassThru
$ready = $false
for ($attempt=0; $attempt -lt 30; $attempt++) {
 $process.Refresh()
 if ($process.HasExited) { throw "New server exited. Check data/server-race-gift-$stamp-error.log; no success reported." }
 try {
  $status = Invoke-RestMethod "$base/api/state?world=live" -TimeoutSec 2
  if ($status.bondRulesVersion -eq 1) { $ready=$true; break }
 } catch {}
 Start-Sleep -Milliseconds 500
}
if (!$ready) { throw "Server did not start. Check data/server-race-gift-$stamp-error.log" }
Write-Host "Server ready, PID $($process.Id). Open $base/?world=live#events and reload the LIVE Studio Link source."
Write-Host "Updated: race gifts boost only (no qi)."

} finally {
 if (Test-Path -LiteralPath $pauseFile) { Remove-Item -LiteralPath $pauseFile }
}
powershell.exe -NoProfile -File (Join-Path $PSScriptRoot 'start-watchdog.ps1')

