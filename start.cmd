@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Can cai Node.js truoc khi chay.
  pause
  exit /b 1
)
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:4317/api/state' -TimeoutSec 2; if ($r.StatusCode -eq 200 -and ($r.Content -match 'sectQi')) { exit 0 } else { exit 1 } } catch { exit 1 }"
if not errorlevel 1 (
  start "" http://127.0.0.1:4317
  exit /b 0
)
if not exist node_modules\ws (
  call npm.cmd install
  if errorlevel 1 (
    echo Khong cai duoc thu vien. Kiem tra ket noi mang.
    pause
    exit /b 1
  )
)
start "" http://127.0.0.1:4317
node server.mjs
pause
