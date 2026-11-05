@echo off
cd /d "%~dp0"
powershell -NoProfile -Command "if (Test-Path data\web-tunnel.pid) { $id=[int](Get-Content data\web-tunnel.pid); $q=Get-CimInstance Win32_Process -Filter ('ProcessId='+$id); if ($q -and $q.Name -eq 'cloudflared.exe') { Stop-Process -Id $id -Force; 'Da tat link web.' } else { 'Link web khong chay.' } } else { 'Link web khong chay.' }"
pause
