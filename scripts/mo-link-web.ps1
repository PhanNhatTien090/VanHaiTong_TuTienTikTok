$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
& (Join-Path $PSScriptRoot 'check-profile-host.ps1')
# Only expose the verified profile service on port 4320.
# Tắt link cũ (nếu có) rồi mở link mới, chạy nền độc lập.
if (Test-Path data\web-tunnel.pid) { $old = [int](Get-Content data\web-tunnel.pid); $q = Get-CimInstance Win32_Process -Filter "ProcessId=$old"; if ($q -and $q.Name -eq 'cloudflared.exe') { Stop-Process -Id $old -Force } }
Remove-Item data\web-tunnel.log, data\web-link.txt -ErrorAction SilentlyContinue
$p = Start-Process -FilePath (Resolve-Path tools\cloudflared.exe) -ArgumentList 'tunnel','--no-autoupdate','--url','http://127.0.0.1:4320','--logfile',(Join-Path (Get-Location) 'data\web-tunnel.log') -WindowStyle Hidden -PassThru
Set-Content data\web-tunnel.pid $p.Id
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep 1
  $m = Select-String -Path data\web-tunnel.log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($m) { $u = $m.Matches[0].Value; Set-Content data\web-link.txt $u; Write-Host ''; Write-Host "  LINK WEB: $u" -ForegroundColor Green; Write-Host '  (da luu vao data\web-link.txt - gui link nay cho nguoi choi)'; Write-Host '  Link chay nen, dong cua so nay khong sao. Tat link: TAT-LINK-WEB.cmd'; exit 0 }
}
Write-Host 'Khong lay duoc link. Xem data\web-tunnel.log' -ForegroundColor Red
