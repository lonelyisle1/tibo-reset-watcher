param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [string]$Destination = (Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) "tibo-reset-watcher-edge-v0.5.0.zip")
)

$items = @(
  "manifest.json",
  "background.js",
  "content.js",
  "_locales",
  "icons",
  "lib",
  "options",
  "popup",
  "README.md",
  "README.en.md",
  "PRIVACY.md",
  "PRIVACY.en.md",
  "LICENSE"
) | ForEach-Object { Join-Path $ProjectRoot $_ }

Compress-Archive -Path $items -DestinationPath $Destination -CompressionLevel Optimal -Force
Write-Output $Destination
