$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$entry = [IO.Path]::GetFullPath((Join-Path $project 'server.mjs'))
$servers = @(Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Replace('/','\').IndexOf($entry,[StringComparison]::OrdinalIgnoreCase) -ge 0 })
if ($servers.Count -gt 1) { throw 'Multiple game servers found; inspect before enabling watchdog.' }
$node = (Get-Command node.exe).Source
$watch = Join-Path $PSScriptRoot 'server-watchdog.mjs'
$lock = Join-Path $project 'data/watchdog.lock'
if (Test-Path -LiteralPath $lock) {
 try {
  $owner = Get-Content -LiteralPath $lock -Raw | ConvertFrom-Json
  $running = Get-CimInstance Win32_Process -Filter ("ProcessId = " + [int]$owner.pid)
  if ($running -and $running.CommandLine -and $running.CommandLine.Replace('/','\').IndexOf($watch,[StringComparison]::OrdinalIgnoreCase) -ge 0) {
   if ($servers.Count -eq 1) { @{pid=$servers[0].ProcessId} | ConvertTo-Json -Compress | Set-Content -LiteralPath (Join-Path $project 'data/watchdog-adopt.json') -Encoding ASCII }
   Write-Host "Watchdog already active: $($owner.pid)"
   return
  }
 } catch {}
}
$arguments = '"' + $watch + '"'
if ($servers.Count -eq 1) { $arguments += ' ' + $servers[0].ProcessId }
$started = Start-Process -FilePath $node -ArgumentList $arguments -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput (Join-Path $project 'data/watchdog-launch.log') -RedirectStandardError (Join-Path $project 'data/watchdog-launch-error.log') -PassThru
Write-Host 'Watchdog enabled. Existing LIVE server is retained. Status: data/watchdog-status.json'
