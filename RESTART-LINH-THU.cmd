@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -File "%~dp0scripts\restart-pets.ps1"
pause
