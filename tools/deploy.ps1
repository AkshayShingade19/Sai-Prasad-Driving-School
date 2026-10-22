# ============================================================================
#  deploy.ps1  -  Deploys the backend to Render and the frontend to Vercel.
#
#  Usage:
#     $env:VERCEL_TOKEN  = "your-vercel-token"
#     $env:RENDER_API_KEY = "rnd_xxx..."
#     $env:MONGODB_URI    = "mongodb+srv://..."
#     powershell -ExecutionPolicy Bypass -File .\tools\deploy.ps1
#
#  Order of operations:
#     1. Backend  -> Render  (blueprint-equivalent service definition)
#     2. Read the assigned *.onrender.com URL
#     3. Point frontend/vercel.json at that URL (same-origin /api proxy)
#     4. Frontend -> Vercel  (production)
#     5. Set CLIENT_URL on Render to the Vercel origin (CORS safety net)
#     6. Print the final public URL
# ============================================================================

$ErrorActionPreference = 'Stop'
$root     = 'C:\Users\Admin\Desktop\SAI PRASAD DRIVING SCHOOL MANAGEMENT SYSTEM'
$frontend = Join-Path $root 'frontend'
$repo     = 'AkshayShingade19/Sai-Prasad-Driving-School'
$svcName  = 'sai-prasad-driving-school-api'

function Need($name, $value) {
  if (-not $value) {
    Write-Host ''
    Write-Host "  MISSING: `$env:$name" -ForegroundColor Red
    Write-Host "  Set it and run this script again." -ForegroundColor Yellow
    exit 1
  }
}

Need 'VERCEL_TOKEN'   $env:VERCEL_TOKEN
Need 'RENDER_API_KEY' $env:RENDER_API_KEY
Need 'MONGODB_URI'    $env:MONGODB_URI

$renderHeaders = @{
  Authorization = "Bearer $env:RENDER_API_KEY"
  Accept        = 'application/json'
  'Content-Type' = 'application/json'
}

# ---------------------------------------------------------------- 1. backend
Write-Host ''
Write-Host '[1/6] Creating Render service (backend)...' -ForegroundColor Cyan

$existing = Invoke-RestMethod -Uri "https://api.render.com/v1/services?limit=200" -Headers $renderHeaders -Method Get
$svc = $existing | Where-Object { $_.service.name -eq $svcName } | Select-Object -First 1

if ($svc) {
  Write-Host "      service already exists (id $($svc.id)) - reusing" -ForegroundColor DarkGray
  $serviceId = $svc.id
  $renderUrl = "https://$($svc.service.name).onrender.com"
} else {
  $body = @{
    type               = 'web'
    name               = $svcName
    repo               = $repo
    branch             = 'main'
    rootDir            = 'backend'
    buildCommand       = 'npm ci --include=dev && npm run build'
    startCommand       = 'npm run start:prod'
    healthCheckPath   = '/api/health'
    plan               = 'free'
    region             = 'singapore'
    autoDeployTrigger  = 'commit'
    pullRequestPreviewsEnabled = $false
  } | ConvertTo-Json -Depth 5

  $created = Invoke-RestMethod -Uri 'https://api.render.com/v1/services' -Headers $renderHeaders -Method Post -Body $body
  $serviceId = $created.id
  $renderUrl = "https://$svcName.onrender.com"
  Write-Host "      created: $renderUrl" -ForegroundColor Green
}

# --------------------------------------------------- 2. env vars on Render
Write-Host '[2/6] Setting environment variables on Render...' -ForegroundColor Cyan

$vars = @(
  @{ key = 'NODE_VERSION';      value = '22.11.0' },
  @{ key = 'NODE_ENV';          value = 'production' },
  @{ key = 'JWT_SECRET';        value = $env:JWT_SECRET },
  @{ key = 'JWT_EXPIRES_IN';    value = '7d' },
  @{ key = 'MONGODB_URI';       value = $env:MONGODB_URI },
  @{ key = 'BUSINESS_TIMEZONE';  value = 'Asia/Kolkata' },
  @{ key = 'RATE_LIMIT_MAX';    value = '200' },
  @{ key = 'BIND_ADDRESS';      value = '0.0.0.0' },
  @{ key = 'CLIENT_URL';        value = $env:CLIENT_URL }
)

foreach ($v in $vars) {
  if (-not $v.value) { continue }
  $payload = @{ key = $v.key; value = $v.value } | ConvertTo-Json
  try {
    Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/env-vars/$($v.key)" `
      -Headers $renderHeaders -Method Put -Body $payload | Out-Null
    Write-Host "      set $($v.key)"
  } catch {
    Write-Host "      WARN could not set $($v.key): $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

# ------------------------------------- 3. point vercel.json at the backend
Write-Host '[3/6] Pointing frontend /api proxy at the Render backend...' -ForegroundColor Cyan
$vercelJsonPath = Join-Path $frontend 'vercel.json'
$vj = Get-Content $vercelJsonPath -Raw | ConvertFrom-Json
$vj.rewrites[0].destination = "$renderUrl/api/:path*"
$vj | ConvertTo-Json -Depth 10 | Set-Content $vercelJsonPath
Write-Host "      /api -> $renderUrl/api" -ForegroundColor DarkGray

# --------------------------------------------------------- 4. frontend
Write-Host '[4/6] Deploying frontend to Vercel (production)...' -ForegroundColor Cyan
Push-Location $frontend
$vercelOut = & vercel --prod --yes --token $env:VERCEL_TOKEN 2>&1
Pop-Location
$vercelOut | Select-Object -Last 8 | ForEach-Object { Write-Host "      $_" }

# pull the deployment URL out of the CLI output
$vercelUrl = $null
foreach ($line in $vercelOut) {
  if ($line -match 'https://[a-z0-9.-]+\.vercel\.app') { $vercelUrl = $Matches[0] }
}

# ------------------------------------------- 5. CORS safety net on Render
if ($vercelUrl) {
  Write-Host '[5/6] Adding the Vercel origin to Render CLIENT_URL...' -ForegroundColor Cyan
  $payload = @{ key = 'CLIENT_URL'; value = $vercelUrl } | ConvertTo-Json
  try {
    Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/env-vars/CLIENT_URL" `
      -Headers $renderHeaders -Method Put -Body $payload | Out-Null
    Write-Host "      CLIENT_URL = $vercelUrl" -ForegroundColor DarkGray
  } catch {
    Write-Host "      WARN: $($_.Exception.Message)" -ForegroundColor Yellow
  }
} else {
  Write-Host '[5/6] Could not read the Vercel URL - set CLIENT_URL on Render manually' -ForegroundColor Yellow
}

# ---------------------------------------------------------------- 6. report
Write-Host ''
Write-Host '============================================================' -ForegroundColor Green
Write-Host '  DEPLOYMENT COMPLETE' -ForegroundColor Green
Write-Host ''
Write-Host "  Frontend (share with the client): $vercelUrl" -ForegroundColor White
Write-Host "  Backend API                   : $renderUrl" -ForegroundColor White
Write-Host "  Swagger                       : $renderUrl/api/docs" -ForegroundColor DarkGray
Write-Host "  Health                        : $renderUrl/api/health" -ForegroundColor DarkGray
Write-Host '============================================================' -ForegroundColor Green
Write-Host ''
Write-Host '  Note: Render free tier sleeps after 15 min idle (first request ~50s).'
Write-Host ''
