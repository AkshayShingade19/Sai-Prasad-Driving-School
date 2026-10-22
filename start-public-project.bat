@echo off
REM ============================================================================
REM  start-public-project.bat
REM  Sai Prasad Driving School - Local development + public HTTPS tunnel
REM
REM  Starts:  backend (NestJS) -> frontend (Vite) -> Cloudflare Tunnel
REM  Public URL: https://<random>.trycloudflare.com
REM
REM  The tunnel publishes ONLY the frontend port. The Vite dev server acts as
REM  a same-origin reverse proxy for /api, so the backend port and the
REM  MongoDB port are never exposed to the internet.
REM ============================================================================

setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "ROOT=%CD%"
set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend"
set "TOOLS_DIR=%ROOT%\.tools"
set "CLOUDFLARED=%TOOLS_DIR%\cloudflared.exe"
set "LOG_DIR=%ROOT%\.logs"

set "FRONTEND_PORT=5173"
set "BACKEND_PORT=3000"
set "TUNNEL_LOG=%LOG_DIR%\tunnel.log"
set "URL_FILE=%LOG_DIR%\public-url.txt"

echo.
echo  ============================================================
echo   SAI PRASAD DRIVING SCHOOL - Public URL Launcher
echo  ============================================================
echo.

REM ---------------------------------------------------------------- checks
where node >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] Node.js is not installed or not on PATH.
  echo          Install the LTS build from https://nodejs.org and reopen this window.
  goto :fail
)

if not exist "%CLOUDFLARED%" (
  echo  [ERROR] cloudflared.exe was not found at:
  echo          %CLOUDFLARED%
  echo          Run:  tools\setup-cloudflared.bat
  goto :fail
)

if not exist "%BACKEND_DIR%\node_modules" (
  echo  [ERROR] Backend dependencies are missing. Installing...
  pushd "%BACKEND_DIR%"
  call npm install
  if errorlevel 1 ( popd & goto :fail )
  popd
)

if not exist "%FRONTEND_DIR%\node_modules" (
  echo  [ERROR] Frontend dependencies are missing. Installing...
  pushd "%FRONTEND_DIR%"
  call npm install
  if errorlevel 1 ( popd & goto :fail )
  popd
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%" >nul 2>&1

REM ------------------------------------------------- free the required ports
echo  [1/4] Freeing ports %BACKEND_PORT% and %FRONTEND_PORT%...
for %%P in (%BACKEND_PORT% %FRONTEND_PORT%) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)
timeout /t 2 /nobreak >nul

REM ------------------------------------------------------------- database
echo  [2/4] Checking MongoDB on 127.0.0.1:27017...
netstat -ano | findstr ":27017 " | findstr "LISTENING" >nul
if errorlevel 1 (
  echo        [WARN] MongoDB is not listening on 27017.
  echo               The backend will fail to connect. Start MongoDB, then re-run.
) else (
  echo        MongoDB is running.
)

REM --------------------------------------------------------------- backend
echo  [3/4] Starting backend on 127.0.0.1:%BACKEND_PORT%...
start "Sai Prasad API" /D "%BACKEND_DIR%" cmd /k "npx nest start"
timeout /t 12 /nobreak >nul

REM -------------------------------------------------------------- frontend
echo        Starting frontend on 0.0.0.0:%FRONTEND_PORT%...
start "Sai Prasad Web" /D "%FRONTEND_DIR%" cmd /k "npx vite --host"

REM Wait for the frontend to answer before pointing the tunnel at it
echo        Waiting for the frontend to become ready...
set /a TRIES=0
:wait_frontend
set /a TRIES+=1
timeout /t 2 /nobreak >nul
curl -s -o nul -w "" http://127.0.0.1:%FRONTEND_PORT% 2>nul
if not errorlevel 1 goto :frontend_ready
if %TRIES% lss 30 goto :wait_frontend
echo        [WARN] Frontend did not respond on port %FRONTEND_PORT% within 60s.
echo               Check the "Sai Prasad Web" window for errors.
goto :frontend_ready

:frontend_ready
echo        Frontend is up.

REM --------------------------------------------------------------- tunnel
echo  [4/4] Starting Cloudflare Tunnel -> http://127.0.0.1:%FRONTEND_PORT%
echo        (public URL will be printed below - it may take ~20 seconds)

del "%TUNNEL_LOG%" >nul 2>&1
start "Sai Prasad Tunnel" /D "%ROOT%" cmd /c ""%CLOUDFLARED%" tunnel --url http://127.0.0.1:%FRONTEND_PORT% --no-autoupdate > "%TUNNEL_LOG%" 2>&1"

echo.
echo        Fetching the public URL...
set /a TTRIES=0
:wait_tunnel
set /a TTRIES+=1
timeout /t 3 /nobreak >nul
set "PUBLIC_URL="
for /f "tokens=4" %%u in ('findstr /R /C:"https://[a-z0-9-]*\.trycloudflare\.com" "%TUNNEL_LOG%" 2^>nul') do set "PUBLIC_URL=%%u"
if defined PUBLIC_URL goto :tunnel_ready
if %TTRIES% lss 30 goto :wait_tunnel
echo        [WARN] Could not read the public URL from the log.
echo               Open the "Sai Prasad Tunnel" window to see it.
goto :summary

:tunnel_ready
echo %PUBLIC_URL% > "%URL_FILE%"
echo.
echo  ============================================================
echo   PUBLIC URL IS LIVE
echo.
echo     %PUBLIC_URL%
echo.
echo   Frontend : http://localhost:%FRONTEND_PORT%
echo   Backend  : http://localhost:%BACKEND_PORT%  ^(not public^)
echo   Database : mongodb://127.0.0.1:27017  ^(not public^)
echo  ============================================================
echo.
echo   Open the URL on any phone or laptop.
echo   Keep this window and your computer switched on.
echo.
echo   The URL is also saved to: %URL_FILE%
echo.

:summary
echo  To STOP everything:
echo     1. Close the "Sai Prasad Tunnel" window
echo     2. Close the "Sai Prasad Web" window
echo     3. Close the "Sai Prasad API" window
echo     4. Or run:  stop-public-project.bat
echo.
echo  Logs: %LOG_DIR%
echo.
pause
exit /b 0

:fail
echo.
echo  [FAILED] Setup did not complete. See the error above.
echo.
pause
exit /b 1
