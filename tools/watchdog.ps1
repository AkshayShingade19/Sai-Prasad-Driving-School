# ============================================================================
#  watchdog.ps1  -  Keeps the whole stack alive.
#
#  A Cloudflare quick tunnel dies whenever the machine sleeps, loses network,
#  or the process is killed. This supervisor checks every few seconds and
#  restarts whatever is down, so the public URL stays reachable.
#
#  Start it:   powershell -ExecutionPolicy Bypass -File .\tools\watchdog.ps1
#  Stop it:    close the window, or run tools\stop-public-project.bat
# ============================================================================

$ErrorActionPreference = 'Continue'
$root     = 'C:\Users\Admin\Desktop\SAI PRASAD DRIVING SCHOOL MANAGEMENT SYSTEM'
$backend  = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$logDir   = Join-Path $root '.logs'
$tools    = Join-Path $root '.tools'
$cloudflared = Join-Path $tools 'cloudflared.exe'

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-Log([string]$msg) {
  $ts = (Get-Date).ToString('HH:mm:ss')
  $line = "[$ts] $msg"
  Write-Host $line
  Add-Content -Path (Join-Path $logDir 'watchdog.log') -Value $line
}

function Test-Port([int]$port) {
  try {
    $null = Invoke-WebRequest "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 4
    return $true
  } catch { return $false }
}

function Test-Api {
  try {
    $null = Invoke-WebRequest 'http://127.0.0.1:3000/api/health' -UseBasicParsing -TimeoutSec 5
    return $true
  } catch { return $false }
}

function Test-Tunnel {
  $f = Join-Path $logDir 'watchdog-url.txt'
  if (-not (Test-Path $f)) { return $false }
  $u = (Get-Content $f -Raw).Trim()
  if (-not $u) { return $false }
  try {
    $null = Invoke-WebRequest "$u/api/health" -UseBasicParsing -TimeoutSec 12
    return $true
  } catch { return $false }
}

function Start-Backend {
  Write-Log 'starting backend...'
  Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/c', ('npx nest start > "{0}" 2>&1' -f (Join-Path $logDir 'backend.log')) `
    -WorkingDirectory $backend -WindowStyle Hidden | Out-Null
}

function Start-Frontend {
  Write-Log 'starting frontend...'
  Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/c', ('npx vite --host > "{0}" 2>&1' -f (Join-Path $logDir 'frontend.log')) `
    -WorkingDirectory $frontend -WindowStyle Hidden | Out-Null
}

function Start-Tunnel {
  Write-Log 'starting cloudflared tunnel...'
  Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  $out = Join-Path $logDir 'tunnel.log'
  $err = Join-Path $logDir 'tunnel.err.log'
  Remove-Item $out,$err -Force -ErrorAction SilentlyContinue
  Remove-Item (Join-Path $logDir 'watchdog-url.txt') -Force -ErrorAction SilentlyContinue

  Start-Process -FilePath $cloudflared `
    -ArgumentList 'tunnel', '--url', 'http://127.0.0.1:5173', '--no-autoupdate' `
    -WorkingDirectory $root -WindowStyle Hidden `
    -RedirectStandardOutput $out -RedirectStandardError $err | Out-Null

  # discover the URL (cloudflared prints it to stderr)
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    foreach ($f in @($out, $err)) {
      if (Test-Path $f) {
        $m = Select-String -Path $f -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches -ErrorAction SilentlyContinue
        if ($m) {
          $url = ($m.Matches | Select-Object -First 1).Value
          Set-Content -Path (Join-Path $logDir 'watchdog-url.txt') -Value $url
          Set-Content -Path (Join-Path $logDir 'public-url.txt') -Value $url
          Write-Log "public URL: $url"
          return $url
        }
      }
    }
  }
  Write-Log 'could not read the tunnel URL'
  return $null
}

Write-Host ''
Write-Host '  Sai Prasad - Stack Watchdog' -ForegroundColor Cyan
Write-Host '  Keeps backend, frontend and the public tunnel alive.' -ForegroundColor DarkGray
Write-Host '  Press Ctrl+C to stop.' -ForegroundColor DarkGray
Write-Host ''

$lastUrl = $null

while ($true) {
  if (-not (Test-Api)) { Start-Backend; Start-Sleep -Seconds 12 }
  if (-not (Test-Port 5173)) { Start-Frontend; Start-Sleep -Seconds 8 }

  if (-not (Test-Tunnel)) {
    Write-Log 'tunnel down - restarting...'
    $lastUrl = Start-Tunnel
  }

  if ($lastUrl) {
    Write-Host ''
    Write-Host '  PUBLIC URL FOR THE CLIENT:' -ForegroundColor Green
    Write-Host ''
    Write-Host "    $lastUrl" -ForegroundColor White
    Write-Host ''
    Write-Host "    Admin panel    : $lastUrl/admin/login" -ForegroundColor DarkGray
    Write-Host "    Student portal : $lastUrl/student/login" -ForegroundColor DarkGray
    Write-Host "    API docs       : $lastUrl/api/docs" -ForegroundColor DarkGray
    Write-Host ''
  }

  Start-Sleep -Seconds 20
}
