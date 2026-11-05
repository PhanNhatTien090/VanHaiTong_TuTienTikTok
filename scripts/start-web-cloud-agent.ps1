param([Parameter(Mandatory=$true)][string]$ConfigFile)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$configPath = (Resolve-Path -LiteralPath $ConfigFile).Path
$agentPath = Join-Path $projectRoot 'web\cloud\agent.mjs'
$runtimeDir = Join-Path $projectRoot 'data\web-cloud-agent'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$pidFile = Join-Path $runtimeDir 'agent.pid'
if (Test-Path -LiteralPath $pidFile) {
    $agentProcessId = [int](Get-Content -LiteralPath $pidFile -Raw)
    $existing = Get-CimInstance Win32_Process -Filter "ProcessId=$agentProcessId"
    if ($existing -and $existing.CommandLine -like '*web*cloud*agent.mjs*') { Write-Output 'Agent is already running'; exit 0 }
}
$nodePath = (Get-Command node.exe).Source
$process = Start-Process -FilePath $nodePath -ArgumentList @('"' + $agentPath + '"','--config','"' + $configPath + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDir 'agent.out.log') -RedirectStandardError (Join-Path $runtimeDir 'agent.err.log')
Set-Content -LiteralPath $pidFile -Value $process.Id
Write-Output 'Cloud sync agent started. LIVE server was not restarted.'
