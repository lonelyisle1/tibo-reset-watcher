param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $ProjectRoot "icons"
$storeDirectory = Join-Path $ProjectRoot "store\assets"
New-Item -ItemType Directory -Force -Path $iconDirectory, $storeDirectory | Out-Null

function New-SquareIcon {
  param([string]$Path, [int]$Size, [System.Drawing.Color]$Background, [string]$Symbol = "T")
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear($Background)
  $fontSize = [Math]::Max(8, [Math]::Round($Size * 0.55))
  $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $graphics.DrawString($Symbol, $font, $brush, (New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)), $format)
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $format.Dispose(); $brush.Dispose(); $font.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}

$green = [System.Drawing.Color]::FromArgb(20, 112, 80)
foreach ($size in @(16, 32, 48, 128)) {
  New-SquareIcon -Path (Join-Path $iconDirectory "icon-$size.png") -Size $size -Background $green -Symbol "T"
}

New-SquareIcon -Path (Join-Path $iconDirectory "notification-urgent.png") -Size 128 -Background ([System.Drawing.Color]::FromArgb(201, 48, 42)) -Symbol "!"
New-SquareIcon -Path (Join-Path $iconDirectory "notification-possible.png") -Size 128 -Background ([System.Drawing.Color]::FromArgb(218, 139, 25)) -Symbol "?"
New-SquareIcon -Path (Join-Path $iconDirectory "notification-completed.png") -Size 128 -Background ([System.Drawing.Color]::FromArgb(30, 137, 82)) -Symbol "OK"
New-SquareIcon -Path (Join-Path $iconDirectory "notification-change.png") -Size 128 -Background ([System.Drawing.Color]::FromArgb(35, 105, 178)) -Symbol "+"
New-SquareIcon -Path (Join-Path $iconDirectory "notification-system.png") -Size 128 -Background ([System.Drawing.Color]::FromArgb(83, 103, 96)) -Symbol "i"
New-SquareIcon -Path (Join-Path $storeDirectory "edge-store-logo-300.png") -Size 300 -Background $green -Symbol "T"

$tile = New-Object System.Drawing.Bitmap(440, 280)
$g = [System.Drawing.Graphics]::FromImage($tile)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(239, 247, 243))
$logo = [System.Drawing.Image]::FromFile((Join-Path $storeDirectory "edge-store-logo-300.png"))
$g.DrawImage($logo, 28, 56, 120, 120)
$titleFont = New-Object System.Drawing.Font("Segoe UI", 27, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$bodyFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 58, 47))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(74, 103, 92))
$g.DrawString("Tibo Reset Watcher", $titleFont, $darkBrush, 171, 76)
$g.DrawString("Codex / ChatGPT quota alerts", $bodyFont, $mutedBrush, 173, 119)
$g.DrawString("Edge-first - Local - Privacy-friendly", $bodyFont, $mutedBrush, 173, 148)
$tile.Save((Join-Path $storeDirectory "small-promotional-tile-440x280.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$mutedBrush.Dispose(); $darkBrush.Dispose(); $bodyFont.Dispose(); $titleFont.Dispose(); $logo.Dispose(); $g.Dispose(); $tile.Dispose()
