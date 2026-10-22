@echo off
REM ============================================================================
REM  stop-public-project.bat
REM  Stops the backend, frontend and Cloudflare Tunnel started by
REM  start-public-project.bat. MongoDB is left running.
REM ============================================================================

setlocal
cd /d "%~dp0"

echo  Stopping Sai Prasad Driving School services...
echo.

REM --- cloudflared (match the process by its own executable path) ---
taskkill /F /IM cloudflared.exe >nul 2>&1
if errorlevel 1 (echo   [skip] cloudflared not running) else (echo   [stop] cloudflared tunnel)

REM --- node processes that hold the project ports ---
for %%P in (3000 5173) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo   [stop] process %%a on port %%P
  )
)

echo.
echo  All services stopped. MongoDB was left running.
echo.
timeout /t 3 /nobreak >nul
exit /b 0
