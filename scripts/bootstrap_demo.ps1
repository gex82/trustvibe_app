[CmdletBinding()]
param(
  [string]$ProjectId = "trustvibe-dev",
  [string]$EmulatorHost = "127.0.0.1",
  [switch]$NoStartEmulators
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Test-ListeningPort([int]$Port) {
  $match = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Port } | Select-Object -First 1
  return $null -ne $match
}

function Wait-ForPort([int]$Port, [int]$TimeoutSeconds = 90) {
  $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
  while ($stopwatch.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
    if (Test-ListeningPort -Port $Port) {
      return $true
    }
    Start-Sleep -Milliseconds 500
  }
  return $false
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $repoRoot "logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

Write-Step "Bootstrapping TrustVibe demo environment"
Write-Host "Project: $ProjectId"
Write-Host "Emulator host: $EmulatorHost"
Write-Host ""

$requiredPorts = @(4000, 5001, 8080, 9099, 9199)
$allPortsReady = $true
foreach ($port in $requiredPorts) {
  if (-not (Test-ListeningPort -Port $port)) {
    $allPortsReady = $false
    break
  }
}

if (-not $NoStartEmulators -and -not $allPortsReady) {
  Write-Step "Starting Firebase emulators in background"
  $logPath = Join-Path $logsDir "bootstrap_emulators.log"
  $command = "Set-Location `"$repoRoot`"; npm run emulators *>> `"$logPath`""
  Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-WindowStyle", "Minimized", "-Command", $command | Out-Null
  Write-Ok "Emulator process started. Logs: $logPath"
} elseif ($NoStartEmulators) {
  Write-Warn "Skipping emulator startup because -NoStartEmulators was provided."
} else {
  Write-Ok "Emulator ports already listening; startup skipped."
}

Write-Step "Waiting for emulator ports"
foreach ($port in $requiredPorts) {
  if (Wait-ForPort -Port $port -TimeoutSeconds 90) {
    Write-Ok "Port $port is ready"
  } else {
    throw "Port $port did not become ready in time. Check emulator logs under logs/bootstrap_emulators.log."
  }
}

Write-Step "Seeding deterministic demo data"
$env:FIRESTORE_EMULATOR_HOST = "$EmulatorHost`:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST = "$EmulatorHost`:9099"
$env:FIREBASE_STORAGE_EMULATOR_HOST = "$EmulatorHost`:9199"
$env:GCLOUD_PROJECT = $ProjectId
npm run seed
Write-Ok "Seed completed"

Write-Step "Applying demo config profile"
@'
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const projectId = process.env.GCLOUD_PROJECT || 'trustvibe-dev';
if (!getApps().length) {
  initializeApp({ projectId });
}

const db = getFirestore();

async function run() {
  const now = new Date().toISOString();
  await db.collection('config').doc('featureFlags').set(
    {
      stripeConnectEnabled: false,
      estimateDepositsEnabled: true,
      milestonePaymentsEnabled: true,
      changeOrdersEnabled: true,
      credentialVerificationEnabled: true,
      schedulingEnabled: true,
      reliabilityScoringEnabled: true,
      subscriptionsEnabled: true,
      highTicketConciergeEnabled: true,
      recommendationsEnabled: true,
      growthEnabled: true,
      updatedAt: now,
      updatedBy: 'bootstrap_demo.ps1',
    },
    { merge: true }
  );

  await db.collection('config').doc('demoProfile').set(
    {
      name: 'demo_critical_v2',
      seededBy: 'bootstrap_demo.ps1',
      seededAt: now,
      personas: {
        customer: 'customer-001',
        contractor: 'contractor-001',
        admin: 'admin-001',
      },
      projectId: 'project-001',
    },
    { merge: true }
  );
}

run()
  .then(() => {
    console.log('Demo config profile applied.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
'@ | node -
Write-Ok "Demo config profile applied"

Write-Host ""
Write-Host "Demo bootstrap complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1) Run mobile app: npm run dev -w @trustvibe/mobile"
Write-Host "2) Run admin app:  npm run dev -w @trustvibe/admin"
Write-Host "3) Review credentials in docs/demo_credentials.md"
Write-Host "4) Validate environment: powershell -ExecutionPolicy Bypass -File .\\scripts\\check_local_demo_env.ps1"
