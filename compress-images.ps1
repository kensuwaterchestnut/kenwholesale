# 圖片壓縮腳本
Add-Type -AssemblyName System.Drawing

$imgFolder = "img"
$files = Get-ChildItem $imgFolder -Filter "*.jpg"

foreach ($file in $files) {
    $size = (Get-Item $file.FullName).Length / 1MB
    
    # 只壓縮大於 1MB 的圖片
    if ($size -gt 1) {
        Write-Host "壓縮: $($file.Name) ($([math]::Round($size, 2)) MB)"
        
        try {
            # 載入圖片
            $img = [System.Drawing.Image]::FromFile($file.FullName)
            
            # 計算新尺寸（最長邊 1200px）
            $maxSize = 1200
            $ratio = [Math]::Min($maxSize / $img.Width, $maxSize / $img.Height)
            
            if ($ratio -lt 1) {
                $newWidth = [int]($img.Width * $ratio)
                $newHeight = [int]($img.Height * $ratio)
                
                # 建立新圖片
                $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
                $graphics = [System.Drawing.Graphics]::FromImage($newImg)
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
                
                # 儲存（品質 85）
                $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
                $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                    [System.Drawing.Imaging.Encoder]::Quality, 85L
                )
                
                $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | 
                    Where-Object { $_.MimeType -eq 'image/jpeg' }
                
                $img.Dispose()
                $newImg.Save($file.FullName, $jpegCodec, $encoderParams)
                $newImg.Dispose()
                $graphics.Dispose()
                
                $newSize = (Get-Item $file.FullName).Length / 1MB
                Write-Host "  完成: $([math]::Round($newSize, 2)) MB (壓縮 $([math]::Round(($size - $newSize) / $size * 100, 1))%)"
            } else {
                $img.Dispose()
                Write-Host "  跳過（已經夠小）"
            }
        } catch {
            Write-Host "  錯誤: $_" -ForegroundColor Red
        }
    }
}

Write-Host "`n壓縮完成！"
