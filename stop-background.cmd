@echo off
cd /d "%~dp0"
powershell -NoProfile -Command "$projectPath = (Get-Location).Path; $pidFile = Join-Path $projectPath 'data\server.pid'; if (-not (Test-Path -LiteralPath $pidFile)) { Write-Host 'No background server PID. Close the server window with Ctrl+C.'; exit 1 }; $taskProcessId = [int](Get-Content -LiteralPath $pidFile); $taskProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $taskProcessId); $expectedScript = Join-Path $projectPath 'server.mjs'; if ($taskProcess -and $taskProcess.Name -eq 'node.exe' -and $taskProcess.CommandLine.Contains($expectedScript)) { Stop-Process -Id $taskProcessId; Write-Host 'Stopped Van Hai Tong background server.' } else { Write-Host 'PID does not match this project. No process stopped.' }"
pause
