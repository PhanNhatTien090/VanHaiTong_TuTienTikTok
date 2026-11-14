@echo off
setlocal
cd /d "%~dp0"
echo Dang cap nhat may chu LIVE cong 4317...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\restart-cloud-sync.ps1" -RequiredArtifact hac-kim-hoa-dao
if errorlevel 1 (
  echo Chua xac nhan cap nhat. Xem thong bao ben tren.
  pause
  exit /b 1
)
echo Da nap Dau De Tieu Viem. Mo tab Su kien de bat dau.
start "" "http://127.0.0.1:4317/?world=live#events"
pause
