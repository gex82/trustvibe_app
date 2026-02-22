param(
  [string]$ProjectName = "trustvibe-demo-only",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$appDir = Join-Path $repoRoot "apps/demo-web"

Write-Host "[deploy] Verifying Cloudflare authentication..."
npx wrangler whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Cloudflare auth check failed. Run: npx wrangler login"
}

# Force browser-safe production defaults at build-time.
$env:VITE_USE_EMULATORS = "false"
$env:VITE_DEMO_DATA_FALLBACK = "true"

Push-Location $repoRoot
try {
  Write-Host "[deploy] Building @trustvibe/demo-web..."
  npm run build -w @trustvibe/demo-web
  if ($LASTEXITCODE -ne 0) {
    throw "Build failed."
  }
}
finally {
  Pop-Location
}

Push-Location $appDir
try {
  Write-Host "[deploy] Deploying ./dist to project '$ProjectName' (branch '$Branch')..."
  npx wrangler pages deploy dist --project-name $ProjectName --branch $Branch
  if ($LASTEXITCODE -ne 0) {
    throw "Deploy failed."
  }
}
finally {
  Pop-Location
}
