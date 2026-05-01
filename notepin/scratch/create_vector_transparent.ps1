Add-Type -AssemblyName System.Drawing
$sourceFile = "C:\Users\Admin\.gemini\antigravity\brain\82e587b9-62fc-4585-a550-7eaf6984cdf3\notepin_vector_raw_1777669431596.png"
$destRoot = "d:\APPS By nRn World\Chrome\NotePin\notepin\public\icons"

function Create-TransparentIcon-Black($sourcePath, $targetWidth, $targetHeight, $outputPath) {
    $src = [System.Drawing.Bitmap]::FromFile($sourcePath)
    $dest = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    
    # Set high quality resize
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Draw scaled image
    $g.DrawImage($src, 0, 0, $targetWidth, $targetHeight)
    
    # Transparency: treat pixels that are very dark (near black) as transparent
    # We use a loop for better precision than MakeTransparent
    for ($y = 0; $y -lt $dest.Height; $y++) {
        for ($x = 0; $x -lt $dest.Width; $x++) {
            $pixel = $dest.GetPixel($x, $y)
            # Threshold for "near black" background
            if ($pixel.R -lt 15 -and $pixel.G -lt 15 -and $pixel.B -lt 15) {
                $dest.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
    
    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $src.Dispose()
    $dest.Dispose()
}

Create-TransparentIcon-Black $sourceFile 128 128 "$destRoot\icon128.png"
Create-TransparentIcon-Black $sourceFile 48 48 "$destRoot\icon48.png"
Create-TransparentIcon-Black $sourceFile 16 16 "$destRoot\icon16.png"
