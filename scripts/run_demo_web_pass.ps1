[CmdletBinding()]
param(
  [string]$DemoWebUrl = 'http://localhost:5174'
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
  Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Test-HttpReady([string]$Url) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Wait-HttpReady([string]$Url, [int]$TimeoutSeconds = 180) {
  $watch = [System.Diagnostics.Stopwatch]::StartNew()
  while ($watch.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
    if (Test-HttpReady -Url $Url) {
      return $true
    }
    Start-Sleep -Milliseconds 1000
  }
  return $false
}

function Stop-PortListenerProcesses([int]$Port) {
  $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $listeners) {
    return
  }

  $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $pids) {
    if ($processId -and $processId -ne $PID) {
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$runDir = Join-Path $repoRoot "artifacts/demo-pass/$timestamp"
$logsDir = Join-Path $runDir 'logs'
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

$meta = [ordered]@{
  timestamp = $timestamp
  runDir = $runDir
  bootstrapSuccess = $false
  envCheckSuccess = $false
  demoWebReachable = $false
  playwrightExitCode = -1
}

$demoWebProc = $null

try {
  Write-Step 'Running bootstrap:demo'
  Set-Location $repoRoot
  npm run bootstrap:demo
  if ($LASTEXITCODE -ne 0) {
    throw 'bootstrap:demo failed'
  }
  $meta.bootstrapSuccess = $true
  Write-Ok 'bootstrap:demo completed'

  Write-Step 'Running local environment checks'
  powershell -ExecutionPolicy Bypass -File .\scripts\check_local_demo_env.ps1
  if ($LASTEXITCODE -ne 0) {
    throw 'check_local_demo_env.ps1 failed'
  }
  $meta.envCheckSuccess = $true
  Write-Ok 'Environment checks passed'

  Write-Step 'Stopping existing listener on port 5174'
  Stop-PortListenerProcesses -Port 5174

  Write-Step 'Starting demo-web server'
  $demoWebLog = Join-Path $logsDir 'demo-web.log'
  $demoWebCommand = "Set-Location `"$repoRoot`"; npm run dev:demo-web *>> `"$demoWebLog`""
  $demoWebProc = Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile', '-WindowStyle', 'Minimized', '-Command', $demoWebCommand -PassThru

  Write-Step "Waiting for $DemoWebUrl"
  if (-not (Wait-HttpReady -Url $DemoWebUrl -TimeoutSeconds 240)) {
    throw "Demo-web URL did not become ready: $DemoWebUrl"
  }
  $meta.demoWebReachable = $true
  Write-Ok 'Demo-web is ready'

  Write-Step 'Running demo-web localization gates'
  npm run check:demo-web:localization
  if ($LASTEXITCODE -ne 0) {
    throw 'check:demo-web:localization failed'
  }
  Write-Ok 'Localization checks passed'

  Write-Step 'Running Playwright demo-web pass'
  $env:DEMO_PASS_DIR = $runDir
  $env:DEMO_WEB_URL = $DemoWebUrl
  npx playwright test --config=playwright.demo-web.config.ts
  $meta.playwrightExitCode = $LASTEXITCODE
  if ($meta.playwrightExitCode -ne 0) {
    throw "Playwright demo-web pass failed with exit code $($meta.playwrightExitCode)"
  }

  Write-Host ''
  Write-Ok "Demo-web pass completed. Artifacts: $runDir"
}
finally {
  $metaJsonPath = Join-Path $runDir 'run-meta.json'
  $meta | ConvertTo-Json -Depth 4 | Set-Content -NoNewline -Path $metaJsonPath

  if ($demoWebProc -and -not $demoWebProc.HasExited) {
    Stop-Process -Id $demoWebProc.Id -Force -ErrorAction SilentlyContinue
  }
}
