param(
  [string]$ContractorsSource = "C:\Users\excj\Downloads\contractors",
  [string]$JobsSource = "C:\Users\excj\Downloads\jobs",
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Get-SortedPngFiles {
  param([string]$Path, [int]$ExpectedCount, [string]$Label)

  if (-not (Test-Path -Path $Path)) {
    throw "$Label source folder not found: $Path"
  }

  $files = @(Get-ChildItem -Path $Path -File -Filter *.png | Sort-Object Name)
  if ($files.Count -ne $ExpectedCount) {
    throw "$Label source folder expected $ExpectedCount PNG files, found $($files.Count): $Path"
  }

  return $files
}

function Save-CenterCroppedJpeg {
  param(
    [string]$SourcePath,
    [string]$DestinationPath,
    [int]$TargetWidth,
    [int]$TargetHeight,
    [int]$Quality
  )

  $image = [System.Drawing.Image]::FromFile($SourcePath)
  try {
    $scale = [Math]::Max($TargetWidth / $image.Width, $TargetHeight / $image.Height)
    $scaledWidth = [Math]::Ceiling($image.Width * $scale)
    $scaledHeight = [Math]::Ceiling($image.Height * $scale)
    $offsetX = [Math]::Floor(($TargetWidth - $scaledWidth) / 2)
    $offsetY = [Math]::Floor(($TargetHeight - $scaledHeight) / 2)

    $bitmap = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($image, $offsetX, $offsetY, $scaledWidth, $scaledHeight)

        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
        if (-not $encoder) {
          throw "JPEG encoder not available in System.Drawing."
        }

        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        try {
          $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)
          $bitmap.Save($DestinationPath, $encoder, $encoderParams)
        } finally {
          $encoderParams.Dispose()
        }
      } finally {
        $graphics.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $image.Dispose()
  }
}

$contractorFiles = Get-SortedPngFiles -Path $ContractorsSource -ExpectedCount 4 -Label "Contractors"
$jobFiles = Get-SortedPngFiles -Path $JobsSource -ExpectedCount 7 -Label "Jobs"

$avatarsOutput = Join-Path $RepoRoot "apps/mobile/assets/demo/avatars"
$projectsOutput = Join-Path $RepoRoot "apps/mobile/assets/demo/projects"
New-Item -ItemType Directory -Path $avatarsOutput -Force | Out-Null
New-Item -ItemType Directory -Path $projectsOutput -Force | Out-Null

$contractorTargets = @(
  "contractor_mock_01.jpg",
  "contractor_mock_02.jpg",
  "contractor_mock_03.jpg",
  "contractor_mock_04.jpg"
)

$jobTargets = @(
  "job_mock_01_before.jpg",
  "job_mock_01_after.jpg",
  "job_mock_02_before.jpg",
  "job_mock_02_after.jpg",
  "job_mock_03_before.jpg",
  "job_mock_03_after.jpg",
  "job_mock_04_showcase.jpg"
)

$importResults = @()

for ($index = 0; $index -lt $contractorFiles.Count; $index++) {
  $sourceFile = $contractorFiles[$index]
  $targetName = $contractorTargets[$index]
  $destinationFile = Join-Path $avatarsOutput $targetName
  Save-CenterCroppedJpeg -SourcePath $sourceFile.FullName -DestinationPath $destinationFile -TargetWidth 512 -TargetHeight 512 -Quality 82
  $importResults += [PSCustomObject]@{
    Type = "contractor"
    Source = $sourceFile.Name
    Target = $targetName
  }
}

for ($index = 0; $index -lt $jobFiles.Count; $index++) {
  $sourceFile = $jobFiles[$index]
  $targetName = $jobTargets[$index]
  $destinationFile = Join-Path $projectsOutput $targetName
  Save-CenterCroppedJpeg -SourcePath $sourceFile.FullName -DestinationPath $destinationFile -TargetWidth 1440 -TargetHeight 1024 -Quality 78
  $importResults += [PSCustomObject]@{
    Type = "job"
    Source = $sourceFile.Name
    Target = $targetName
  }
}

Write-Host ""
Write-Host "Imported mock demo assets successfully."
$importResults | Format-Table -AutoSize

