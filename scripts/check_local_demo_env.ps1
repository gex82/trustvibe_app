[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Write-Ok([string]$Message) {
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
  Write-Host "[FAIL] $Message" -ForegroundColor Red
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$mobileEnvPath = Join-Path $repoRoot "apps/mobile/.env.local"
$firebaseConfigPath = Join-Path $repoRoot "firebase.json"
$packageJsonPath = Join-Path $repoRoot "package.json"
$seedDataPath = Join-Path $repoRoot "data/demo/users.json"
$requiredPorts = @(4000, 5001, 8080, 9099, 9199)
$hasErrors = $false

Write-Host "Checking local demo environment..." -ForegroundColor Cyan

if (-not (Test-Path $firebaseConfigPath)) {
  Write-Fail "Missing firebase.json at $firebaseConfigPath"
  exit 1
}

if (-not (Test-Path $packageJsonPath)) {
  Write-Fail "Missing package.json at $packageJsonPath"
  exit 1
}

if (-not (Test-Path $seedDataPath)) {
  Write-Fail "Missing seed data at $seedDataPath"
  $hasErrors = $true
}

try {
  $packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
  if ($null -eq $packageJson.scripts.emulators) {
    Write-Fail "Missing npm script: emulators"
    $hasErrors = $true
  } else {
    Write-Ok "npm script 'emulators' found"
  }

  if ($null -eq $packageJson.scripts.seed) {
    Write-Fail "Missing npm script: seed"
    $hasErrors = $true
  } else {
    Write-Ok "npm script 'seed' found"
  }
} catch {
  Write-Fail "Unable to parse package.json: $($_.Exception.Message)"
  $hasErrors = $true
}

try {
  $firebaseConfig = Get-Content -Path $firebaseConfigPath -Raw | ConvertFrom-Json
  $emulators = $firebaseConfig.emulators
  $hostChecks = @(
    @{ Name = "auth"; Host = $emulators.auth.host },
    @{ Name = "firestore"; Host = $emulators.firestore.host },
    @{ Name = "functions"; Host = $emulators.functions.host },
    @{ Name = "storage"; Host = $emulators.storage.host },
    @{ Name = "ui"; Host = $emulators.ui.host }
  )

  foreach ($check in $hostChecks) {
    if ($check.Host -eq "0.0.0.0") {
      Write-Ok "firebase.json emulators.$($check.Name).host is 0.0.0.0"
    } else {
      Write-Fail "firebase.json emulators.$($check.Name).host is '$($check.Host)' (expected 0.0.0.0)"
      $hasErrors = $true
    }
  }
} catch {
  Write-Fail "Unable to parse firebase.json: $($_.Exception.Message)"
  exit 1
}

if (-not (Test-Path $mobileEnvPath)) {
  Write-Fail "Missing apps/mobile/.env.local"
  $hasErrors = $true
} else {
  $envLines = Get-Content -Path $mobileEnvPath
  $emulatorHostLine = $envLines | Where-Object { $_ -match "^EXPO_PUBLIC_EMULATOR_HOST=" } | Select-Object -First 1
  $useEmulatorLine = $envLines | Where-Object { $_ -match "^EXPO_PUBLIC_USE_EMULATORS=" } | Select-Object -First 1

  if (-not $emulatorHostLine) {
    Write-Fail "EXPO_PUBLIC_EMULATOR_HOST is missing in apps/mobile/.env.local"
    $hasErrors = $true
  } else {
    $emulatorHost = ($emulatorHostLine -split "=", 2)[1].Trim()
    if ($emulatorHost -in @("127.0.0.1", "localhost", "::1")) {
      Write-Fail "EXPO_PUBLIC_EMULATOR_HOST is $emulatorHost. Use your Windows LAN IPv4 for physical iPhone testing."
      $hasErrors = $true
    } else {
      Write-Ok "EXPO_PUBLIC_EMULATOR_HOST is set to $emulatorHost"
    }

    $localIPs = Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -ne "0.0.0.0" } |
      Select-Object -ExpandProperty IPAddress -Unique

    if ($localIPs -contains $emulatorHost) {
      Write-Ok "EXPO_PUBLIC_EMULATOR_HOST matches a local IPv4 interface"
    } else {
      Write-Warn "EXPO_PUBLIC_EMULATOR_HOST does not match a detected local IPv4 interface"
      Write-Host "Detected local IPv4 addresses: $($localIPs -join ', ')" -ForegroundColor DarkYellow
    }
  }

  if (-not $useEmulatorLine) {
    Write-Warn "EXPO_PUBLIC_USE_EMULATORS not set in apps/mobile/.env.local"
  } else {
    $useEmulators = ($useEmulatorLine -split "=", 2)[1].Trim().ToLowerInvariant()
    if ($useEmulators -eq "true") {
      Write-Ok "EXPO_PUBLIC_USE_EMULATORS=true"
    } else {
      Write-Warn "EXPO_PUBLIC_USE_EMULATORS is '$useEmulators' (expected true for local demos)"
    }
  }
}

$listening = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue
foreach ($port in $requiredPorts) {
  $matches = $listening | Where-Object { $_.LocalPort -eq $port }
  if (-not $matches) {
    Write-Warn "Port $port is not currently listening (start emulators first)."
    continue
  }

  $onAnyIPv4 = $matches | Where-Object { $_.LocalAddress -eq "0.0.0.0" }
  $onAnyIPv6 = $matches | Where-Object { $_.LocalAddress -eq "::" }
  if ($onAnyIPv4) {
    Write-Ok "Port $port is listening on 0.0.0.0"
  } elseif ($onAnyIPv6) {
    Write-Ok "Port $port is listening on :: (IPv6 any)."
  } else {
    $addresses = $matches.LocalAddress | Select-Object -Unique
    Write-Warn "Port $port is listening on $($addresses -join ', ') (expected 0.0.0.0 or :: for device demos)"
  }
}

if (-not $env:FIRESTORE_EMULATOR_HOST) {
  Write-Warn "FIRESTORE_EMULATOR_HOST not set in this shell (required for npm run seed and integration tests)."
} else {
  Write-Ok "FIRESTORE_EMULATOR_HOST is set to $($env:FIRESTORE_EMULATOR_HOST)"
}

if (-not $env:GCLOUD_PROJECT) {
  Write-Warn "GCLOUD_PROJECT not set in this shell (seed defaults to trustvibe-dev)."
} else {
  Write-Ok "GCLOUD_PROJECT is set to $($env:GCLOUD_PROJECT)"
}

if ($hasErrors) {
  Write-Host ""
  Write-Fail "Local demo environment checks failed."
  exit 1
}

Write-Host ""
Write-Ok "Local demo environment checks completed."
exit 0
