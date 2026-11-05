@echo off
cd /d "%~dp0"
title Van Hai Tong - LINK WEB
echo Dang mo link cong khai cho ban web Van Hai Tong...
echo (Server LIVE phai dang chay va da bat BAT-WEB.cmd)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\mo-link-web.ps1"
pause
