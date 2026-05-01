Add-Type -AssemblyName System.Drawing
$sourceFile = "C:\Users\Admin\.gemini\antigravity\brain\82e587b9-62fc-4585-a550-7eaf6984cdf3\notepin_icon_transparent_raw_1777668778301.png"
$destRoot = "d:\APPS By nRn World\Chrome\NotePin\notepin\public\icons"

function Create-TransparentIcon($sourcePath, $targetWidth, $targetHeight, $outputPath) {
    $src = [System.Drawing.Bitmap]::FromFile($sourcePath)
    $dest = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    
    # Set high quality resize
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Draw scaled image
    $g.DrawImage($src, 0, 0, $targetWidth, $targetHeight)
    
    # Simple transparency: treat pixels close to white as transparent
    # To speed up, we can use MakeTransparent on a specific color, 
    # but AI images have gradients. We'll try to just use MakeTransparent(White) first.
    $dest.MakeTransparent([System.Drawing.Color]::White)
    
    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $src.Dispose()
    $dest.Dispose()
}

Create-TransparentIcon $sourceFile 128 128 "$destRoot\icon128.png"
Create-TransparentIcon $sourceFile 48 48 "$destRoot\icon48.png"
Create-TransparentIcon $sourceFile 16 16 "$destRoot\icon16.png"
