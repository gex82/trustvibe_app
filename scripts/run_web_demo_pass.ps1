[CmdletBinding()]
param(
  [string]$MobileUrl = 'http://localhost:8081',
  [string]$AdminUrl = 'http://localhost:3000'
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

function Resolve-LoggedAdminUrl([string]$LogPath) {
  if (-not (Test-Path $LogPath)) {
    return $null
  }

  $content = Get-Content -Path $LogPath -Raw -ErrorAction SilentlyContinue
  if (-not $content) {
    return $null
  }

  $match = [regex]::Match($content, 'http://localhost:\d+')
  if ($match.Success) {
    return $match.Value
  }

  return $null
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$runDir = Join-Path $repoRoot "artifacts/demo-pass/$timestamp"
$logsDir = Join-Path $runDir 'logs'
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
$playwrightChannel = if ($env:PW_CHANNEL) { $env:PW_CHANNEL } else { 'chromium' }
$playwrightBrowser = if ($env:PW_BROWSER) { $env:PW_BROWSER } else { 'chromium' }

$meta = [ordered]@{
  timestamp = $timestamp
  runDir = $runDir
  bootstrapSuccess = $false
  envCheckSuccess = $false
  emulatorsReady = $false
  mobileReachable = $false
  adminReachable = $false
  adminResolvedUrl = $AdminUrl
  playwrightChannel = $playwrightChannel
  playwrightBrowserName = $playwrightBrowser
  playwrightExitCode = -1
}

$mobileProc = $null
$adminProc = $null
$adminLog = Join-Path $logsDir 'admin-web.log'
$resolvedAdminUrl = $AdminUrl

try {
  Write-Step 'Running bootstrap:demo'
  Set-Location $repoRoot
  npm run bootstrap:demo
  if ($LASTEXITCODE -ne 0) {
    throw 'bootstrap:demo failed'
  }
  $meta.bootstrapSuccess = $true
  $meta.emulatorsReady = $true
  Write-Ok 'bootstrap:demo completed'

  Write-Step 'Running local environment checks'
  powershell -ExecutionPolicy Bypass -File .\scripts\check_local_demo_env.ps1
  if ($LASTEXITCODE -ne 0) {
    throw 'check_local_demo_env.ps1 failed'
  }
  $meta.envCheckSuccess = $true
  Write-Ok 'Environment checks passed'

  Write-Step 'Stopping existing listeners on ports 8081 and 3000'
  Stop-PortListenerProcesses -Port 8081
  Stop-PortListenerProcesses -Port 3000

  Write-Step 'Starting mobile web server'
  $mobileLog = Join-Path $logsDir 'mobile-web.log'
  $mobileCommand = "Set-Location `"$repoRoot\\apps\\mobile`"; `$env:EXPO_NO_DOCTOR='1'; npx expo start --clear --web --offline --port 8081 *>> `"$mobileLog`""
  $mobileProc = Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile', '-WindowStyle', 'Minimized', '-Command', $mobileCommand -PassThru

  Write-Step 'Starting admin web server'
  $adminCommand = "Set-Location `"$repoRoot`"; `$env:NEXT_PUBLIC_DEMO_ADMIN_BYPASS='true'; `$env:PORT='3000'; npm run dev -w @trustvibe/admin *>> `"$adminLog`""
  $adminProc = Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile', '-WindowStyle', 'Minimized', '-Command', $adminCommand -PassThru

  Write-Step "Waiting for $MobileUrl"
  if (-not (Wait-HttpReady -Url $MobileUrl -TimeoutSeconds 240)) {
    throw "Mobile URL did not become ready: $MobileUrl"
  }
  $meta.mobileReachable = $true
  Write-Ok 'Mobile web is ready'

  Write-Step "Waiting for admin web URL ($AdminUrl)"
  if (-not (Wait-HttpReady -Url $AdminUrl -TimeoutSeconds 240)) {
    $loggedAdminUrl = Resolve-LoggedAdminUrl -LogPath $adminLog
    if ($loggedAdminUrl -and (Wait-HttpReady -Url $loggedAdminUrl -TimeoutSeconds 30)) {
      $resolvedAdminUrl = $loggedAdminUrl
      Write-Ok "Admin web is ready on fallback URL: $resolvedAdminUrl"
    } else {
      throw "Admin URL did not become ready: $AdminUrl"
    }
  } else {
    Write-Ok 'Admin web is ready'
  }

  $meta.adminReachable = $true
  $meta.adminResolvedUrl = $resolvedAdminUrl

  Write-Step "Running Playwright web pass (browser=$playwrightBrowser, channel=$playwrightChannel)"
  $env:DEMO_PASS_DIR = $runDir
  $env:MOBILE_WEB_URL = $MobileUrl
  $env:ADMIN_WEB_URL = $resolvedAdminUrl
  npx playwright test --config=playwright.config.ts
  $meta.playwrightExitCode = $LASTEXITCODE

  # Persist run metadata before report generation so checklist mapping
  # can reliably evaluate environment/bootstrap status.
  $metaJsonPath = Join-Path $runDir 'run-meta.json'
  $meta | ConvertTo-Json -Depth 4 | Set-Content -NoNewline -Path $metaJsonPath

  Write-Step 'Generating web manual pass report'
  node scripts/generate_web_manual_pass_report.cjs --runDir "$runDir"
  $reportExit = $LASTEXITCODE

  if ($meta.playwrightExitCode -ne 0) {
    throw "Playwright web pass failed with exit code $($meta.playwrightExitCode)"
  }

  if ($reportExit -ne 0) {
    throw "Report generation failed with exit code $reportExit"
  }

  Write-Host ''
  Write-Ok "Web demo pass completed. Artifacts: $runDir"
}
finally {
  $metaJsonPath = Join-Path $runDir 'run-meta.json'
  $meta | ConvertTo-Json -Depth 4 | Set-Content -NoNewline -Path $metaJsonPath

  if ($mobileProc -and -not $mobileProc.HasExited) {
    Stop-Process -Id $mobileProc.Id -Force -ErrorAction SilentlyContinue
  }

  if ($adminProc -and -not $adminProc.HasExited) {
    Stop-Process -Id $adminProc.Id -Force -ErrorAction SilentlyContinue
  }
}
