# Regenerates icons/icon{16,32,48,128}.png (on) and icons/off-{16,32,48,128}.png (grey,
# shown in the toolbar while typing on pages is paused). Windows PowerShell 5.1 (System.Drawing).
# Run from the repo root:  powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1

Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Force $outDir | Out-Null

$glyph = [string][char]0x0D85  # අ
$variants = @(
    @{ Prefix = 'icon'; Bg = [System.Drawing.Color]::FromArgb(255, 138, 21, 56) },
    @{ Prefix = 'off-'; Bg = [System.Drawing.Color]::FromArgb(255, 150, 146, 152) }
)

foreach ($variant in $variants) {
$bg = $variant.Bg
foreach ($size in 16, 32, 48, 128) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear([System.Drawing.Color]::Transparent)

    # Rounded square background
    $r = [Math]::Max(2, [int]($size * 0.22))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $w = $size - 1
    $path.AddArc(0, 0, $r * 2, $r * 2, 180, 90)
    $path.AddArc($w - $r * 2, 0, $r * 2, $r * 2, 270, 90)
    $path.AddArc($w - $r * 2, $w - $r * 2, $r * 2, $r * 2, 0, 90)
    $path.AddArc(0, $w - $r * 2, $r * 2, $r * 2, 90, 90)
    $path.CloseFigure()
    $g.FillPath((New-Object System.Drawing.SolidBrush $bg), $path)

    $fontName = 'Iskoola Pota'
    if (-not ((New-Object System.Drawing.Text.InstalledFontCollection).Families.Name -contains $fontName)) {
        $fontName = 'Nirmala UI'
    }
    # Centre the letter on its ink, not the font's line box (which leaves it low and
    # to the right). DrawString keeps hinting, so the 16px icon stays crisp; we draw
    # once off-screen, measure where the pixels landed, then draw shifted into place.
    $font = New-Object System.Drawing.Font $fontName, ([float]($size * 0.62)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'
    $fmt.LineAlignment = 'Center'
    $probe = New-Object System.Drawing.Bitmap $size, $size
    $pg = [System.Drawing.Graphics]::FromImage($probe)
    $pg.TextRenderingHint = 'AntiAliasGridFit'
    $pg.DrawString($glyph, $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 0, 0, $size, $size), $fmt)
    $pg.Dispose()
    $minX = $size; $minY = $size; $maxX = -1; $maxY = -1
    for ($y = 0; $y -lt $size; $y++) {
        for ($x = 0; $x -lt $size; $x++) {
            if ($probe.GetPixel($x, $y).A -gt 200) {  # solid ink only; faint AA edges skew it
                if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $probe.Dispose()
    $dx = [Math]::Round($w / 2 - ($minX + $maxX) / 2)
    $dy = [Math]::Round($w / 2 - ($minY + $maxY) / 2)
    $rect = New-Object System.Drawing.RectangleF ([float]$dx), ([float]$dy), $size, $size
    $g.DrawString($glyph, $font, [System.Drawing.Brushes]::White, $rect, $fmt)

    $file = Join-Path $outDir "$($variant.Prefix)$size.png"
    $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Output "wrote $file"
}
}
