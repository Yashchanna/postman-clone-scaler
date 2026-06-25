$bytes = [System.IO.File]::ReadAllBytes("e:\Scaler Project\Scaler assignment.pdf")
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$clean = $text -replace '[^\x20-\x7E\r\n\t]', ' '
$clean = $clean -replace '\s{3,}', "`n"
$lines = $clean -split "`n" | Where-Object { $_.Trim().Length -gt 2 } | Select-Object -First 300
$lines -join "`n"
