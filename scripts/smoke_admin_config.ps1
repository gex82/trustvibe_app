[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$functionsDir = Join-Path $repoRoot 'functions'

if (-not (Test-Path $functionsDir)) {
  throw "Functions workspace not found at $functionsDir"
}

if (-not $env:FIRESTORE_EMULATOR_HOST) {
  $env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
}

if (-not $env:FIREBASE_AUTH_EMULATOR_HOST) {
  $env:FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
}

if (-not $env:GCLOUD_PROJECT) {
  $env:GCLOUD_PROJECT = 'trustvibe-dev'
}

Write-Host "Running admin config smoke test against emulators..." -ForegroundColor Cyan
Write-Host "FIRESTORE_EMULATOR_HOST=$($env:FIRESTORE_EMULATOR_HOST)"
Write-Host "FIREBASE_AUTH_EMULATOR_HOST=$($env:FIREBASE_AUTH_EMULATOR_HOST)"
Write-Host "GCLOUD_PROJECT=$($env:GCLOUD_PROJECT)"

$nodeScript = @'
const { adminSetConfigHandler, getCurrentConfigHandler } = require('./src/http/handlers');

function req(uid, role, data) {
  return {
    auth: { uid, token: { role } },
    data,
  };
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name} mismatch. Expected ${expected}, got ${actual}`);
  }
}

async function run() {
  const adminUid = 'admin-001';
  const before = await getCurrentConfigHandler(req(adminUid, 'admin', {}));
  const baseline = before.featureFlags || {};

  const toggled = {
    recommendationsEnabled: !Boolean(baseline.recommendationsEnabled),
    growthEnabled: !Boolean(baseline.growthEnabled),
    milestonePaymentsEnabled: !Boolean(baseline.milestonePaymentsEnabled),
  };

  await adminSetConfigHandler(req(adminUid, 'admin', { featureFlags: toggled }));
  const after = await getCurrentConfigHandler(req(adminUid, 'admin', {}));

  assertEqual(
    'recommendationsEnabled',
    Boolean(after.featureFlags?.recommendationsEnabled),
    toggled.recommendationsEnabled
  );
  assertEqual('growthEnabled', Boolean(after.featureFlags?.growthEnabled), toggled.growthEnabled);
  assertEqual(
    'milestonePaymentsEnabled',
    Boolean(after.featureFlags?.milestonePaymentsEnabled),
    toggled.milestonePaymentsEnabled
  );

  await adminSetConfigHandler(
    req(adminUid, 'admin', {
      featureFlags: {
        recommendationsEnabled: Boolean(baseline.recommendationsEnabled),
        growthEnabled: Boolean(baseline.growthEnabled),
        milestonePaymentsEnabled: Boolean(baseline.milestonePaymentsEnabled),
      },
    })
  );

  const restored = await getCurrentConfigHandler(req(adminUid, 'admin', {}));
  assertEqual(
    'restore.recommendationsEnabled',
    Boolean(restored.featureFlags?.recommendationsEnabled),
    Boolean(baseline.recommendationsEnabled)
  );
  assertEqual('restore.growthEnabled', Boolean(restored.featureFlags?.growthEnabled), Boolean(baseline.growthEnabled));
  assertEqual(
    'restore.milestonePaymentsEnabled',
    Boolean(restored.featureFlags?.milestonePaymentsEnabled),
    Boolean(baseline.milestonePaymentsEnabled)
  );

  console.log('Admin config smoke test passed.');
  console.log('Toggled values:', toggled);
}

run().catch((error) => {
  console.error('Admin config smoke test failed:', error);
  process.exit(1);
});
'@

$previousLocation = Get-Location
Push-Location $functionsDir
try {
  $nodeScript | node -r ts-node/register - | Out-Host
} finally {
  Pop-Location
}

if ($LASTEXITCODE -ne 0) {
  throw "Admin config smoke test failed with exit code $LASTEXITCODE"
}

Write-Host "Admin config smoke test passed." -ForegroundColor Green
