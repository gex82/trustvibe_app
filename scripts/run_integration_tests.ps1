[CmdletBinding()]
param(
  [string]$ProjectId = 'trustvibe-dev',
  [string]$FirestoreEmulatorHost = '127.0.0.1:8080',
  [string]$AuthEmulatorHost = '127.0.0.1:9099',
  [switch]$SkipPreflight,
  [switch]$RunSeed
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
  Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Test-PortListening([int]$Port) {
  try {
    return [bool](Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
  } catch {
    return $false
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$requiredPorts = @(
  4000, # emulator UI
  5001, # functions emulator
  8080, # firestore emulator
  9099, # auth emulator
  9199  # storage emulator
)

Write-Step 'Preparing emulator-aware integration run'
if (-not $SkipPreflight) {
  Write-Step 'Running local environment checks'
  powershell -ExecutionPolicy Bypass -File "$repoRoot/scripts/check_local_demo_env.ps1"
  if ($LASTEXITCODE -ne 0) {
    throw 'Environment preflight failed. Fix check failures and rerun.'
  }
}

foreach ($port in $requiredPorts) {
  if (-not (Test-PortListening -Port $port)) {
    Write-Warn "Emulator port $port is not listening yet."
  }
}

if ($RunSeed) {
  Write-Step 'Running seed before integration tests'
  Set-Location $repoRoot
  npm run seed -w @trustvibe/functions
  if ($LASTEXITCODE -ne 0) {
    throw 'Seed command failed.'
  }
}

Write-Step "Setting emulator env vars (project: $ProjectId)"
$env:FIRESTORE_EMULATOR_HOST = $FirestoreEmulatorHost
$env:FIREBASE_AUTH_EMULATOR_HOST = $AuthEmulatorHost
$env:GCLOUD_PROJECT = $ProjectId

Set-Location $repoRoot
Write-Step 'Running integration tests'
npm run test:integration
if ($LASTEXITCODE -ne 0) {
  throw "npm run test:integration failed with code $LASTEXITCODE"
}

Write-Ok 'Integration tests completed successfully.'
