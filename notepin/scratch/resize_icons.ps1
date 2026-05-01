Add-Type -AssemblyName System.Drawing
$sourceFile = "C:\Users\Admin\.gemini\antigravity\brain\82e587b9-62fc-4585-a550-7eaf6984cdf3\notepin_icon_128_1777668535893.png"
$dest128 = "d:\APPS By nRn World\Chrome\NotePin\notepin\public\icons\icon128.png"
$dest48 = "d:\APPS By nRn World\Chrome\NotePin\notepin\public\icons\icon48.png"
$dest16 = "d:\APPS By nRn World\Chrome\NotePin\notepin\public\icons\icon16.png"

function Resize-Image($path, $outputPath, $width, $height) {
    $img = [System.Drawing.Image]::FromFile($path)
    $newImg = new-object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($newImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $width, $height)
    $newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $img.Dispose()
    $newImg.Dispose()
}

Resize-Image $sourceFile $dest128 128 128
Resize-Image $sourceFile $dest48 48 48
Resize-Image $sourceFile $dest16 16 16
