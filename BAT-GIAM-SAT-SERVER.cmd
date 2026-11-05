@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -File "%~dp0scripts\start-watchdog.ps1"
pause
