@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Van Hai Tong - BAT LIVE
powershell -NoProfile -Command "try { $r = Invoke-RestMethod 'http://127.0.0.1:4317/api/state?world=live' -TimeoutSec 3; if ($r) { exit 0 } } catch { exit 1 }"
if errorlevel 1 (
  echo Dang bat server LIVE + dong bo web...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\restart-cloud-sync.ps1"
  if errorlevel 1 (
    echo Khong bat duoc server. Xem log trong thu muc data\.
    pause
    exit /b 1
  )
) else (
  echo Server LIVE da chay san.
)
set "OVERLAY=http://127.0.0.1:4317/?overlay=1&world=live&stage=world&sound=1&voice=1&idle=1&quality=auto#tiktok.studio"
powershell -NoProfile -Command "Set-Clipboard -Value $env:OVERLAY"
start "" "http://127.0.0.1:4317/?world=live"
echo.
echo San sang. Link nguon LIVE Studio (da copy vao clipboard):
echo !OVERLAY!
echo.
pause
