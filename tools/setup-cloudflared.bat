@echo off
REM ============================================================================
REM  setup-cloudflared.bat
REM  Downloads the official Cloudflare Tunnel client (cloudflared) into
REM  .tools\ in this project. No admin rights and no system-wide install.
REM ============================================================================

setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "TOOLS_DIR=%CD%\.tools"
set "CLOUDFLARED=%TOOLS_DIR%\cloudflared.exe"
set "URL=https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

if exist "%CLOUDFLARED%" (
  echo  cloudflared already present at:
  echo    %CLOUDFLARED%
  "%CLOUDFLARED%" --version
  goto :done
)

if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%" >nul 2>&1

echo  Downloading cloudflared (official Cloudflare release)...
echo    %URL%
echo.

curl -L -C - --retry 5 --retry-delay 3 --connect-timeout 20 --max-time 900 -o "%CLOUDFLARED%" "%URL%"
if errorlevel 1 (
  echo.
  echo  [ERROR] Download failed.
  echo          Check your internet connection and retry, or download manually from:
  echo          https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
  goto :fail
)

:done
echo.
echo  Verifying...
"%CLOUDFLARED%" --version
if errorlevel 1 (
  echo  [ERROR] The downloaded file is not a valid executable.
  echo          Delete %CLOUDFLARED% and run this script again.
  goto :fail
)

echo.
echo  cloudflared is ready.
echo  Now run:  start-public-project.bat
echo.
pause
exit /b 0

:fail
echo.
pause
exit /b 1
