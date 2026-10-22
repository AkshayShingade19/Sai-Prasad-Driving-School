# Launches all services as DETACHED Windows processes so they survive the
# terminal / assistant session ending. Re-runnable.
#
#   powershell -ExecutionPolicy Bypass -File .\tools\start-detached.ps1

$ErrorActionPreference = 'Continue'
$root    = 'C:\Users\Admin\Desktop\SAI PRASAD DRIVING SCHOOL MANAGEMENT SYSTEM'
$backend = Join-Path $root 'backend'
$frontend= Join-Path $root 'frontend'
$logDir  = Join-Path $root '.logs'
$tools   = Join-Path $root '.tools'

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Stop-Port([int]$port) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq 'Listen' } |
    ForEach-Object {
      $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
      if ($p -and $p.ProcessName -eq 'node') { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
    }
}

Write-Host '[0/3] stopping any previous run'
Stop-Port 3000
Stop-Port 5173
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ---- backend -----------------------------------------------------------
$backendLog = Join-Path $logDir 'backend.log'
$backendErr = Join-Path $logDir 'backend.err.log'
Write-Host '[1/3] backend  -> 127.0.0.1:3000'
$p1 = Start-Process -FilePath 'cmd.exe' `
  -ArgumentList '/c', ('npx nest start > "{0}" 2>&1' -f $backendLog) `
  -WorkingDirectory $backend -WindowStyle Hidden -PassThru
Write-Host ('      pid {0}' -f $p1.Id)

# ---- frontend ----------------------------------------------------------
$frontendLog = Join-Path $logDir 'frontend.log'
Write-Host '[2/3] frontend -> 0.0.0.0:5173'
$p2 = Start-Process -FilePath 'cmd.exe' `
  -ArgumentList '/c', ('npx vite --host > "{0}" 2>&1' -f $frontendLog) `
  -WorkingDirectory $frontend -WindowStyle Hidden -PassThru
Write-Host ('      pid {0}' -f $p2.Id)

# ---- wait for both -----------------------------------------------------
Write-Host '      waiting for services...'
$okFrontend = $false
$okBackend = $false
for ($i = 0; $i -lt 45; $i++) {
  Start-Sleep -Seconds 1
  if (-not $okFrontend) {
    try { $null = Invoke-WebRequest 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 3; $okFrontend = $true } catch {}
  }
  if (-not $okBackend) {
    try { $null = Invoke-WebRequest 'http://127.0.0.1:3000/api/health' -UseBasicParsing -TimeoutSec 3; $okBackend = $true } catch {}
  }
  if ($okFrontend -and $okBackend) { break }
}
Write-Host ('      frontend: {0}  backend: {1}' -f $(if($okFrontend){'UP'}else{'DOWN'}), $(if($okBackend){'UP'}else{'DOWN'}))

# ---- tunnel ------------------------------------------------------------
Write-Host '[3/3] cloudflared tunnel -> http://127.0.0.1:5173'
$tunnelLog = Join-Path $logDir 'tunnel.log'
$tunnelErr = Join-Path $logDir 'tunnel.err.log'
Remove-Item $tunnelLog -Force -ErrorAction SilentlyContinue
$p3 = Start-Process -FilePath (Join-Path $tools 'cloudflared.exe') `
  -ArgumentList 'tunnel', '--url', 'http://127.0.0.1:5173', '--no-autoupdate' `
  -WorkingDirectory $root -WindowStyle Hidden -PassThru `
  -RedirectStandardOutput $tunnelLog -RedirectStandardError $tunnelErr
Write-Host ('      pid {0}' -f $p3.Id)

# ---- discover the public URL -------------------------------------------
# cloudflared writes its banner to stderr, so scan BOTH streams.
$url = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 2
  foreach ($f in @($tunnelLog, $tunnelErr)) {
    if (Test-Path $f) {
      $m = Select-String -Path $f -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches -ErrorAction SilentlyContinue
      if ($m) { $url = ($m.Matches | Select-Object -First 1).Value; break }
    }
  }
  if ($url) { break }
}

Write-Host ''
Write-Host '============================================================'
if ($url) {
  Set-Content -Path (Join-Path $logDir 'public-url.txt') -Value $url
  Write-Host '  PUBLIC URL IS LIVE'
  Write-Host ''
  Write-Host ('    {0}' -f $url)
} else {
  Write-Host '  [WARN] URL not found yet - check .logs\tunnel.log'
}
Write-Host ''
Write-Host '  Local frontend : http://localhost:5173'
Write-Host '  Local backend  : http://127.0.0.1:3000 (not public)'
Write-Host '  Database       : mongodb://127.0.0.1:27017 (not public)'
Write-Host '============================================================'
Write-Host ''
