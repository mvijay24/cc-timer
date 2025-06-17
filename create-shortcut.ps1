$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\CC Timer.lnk")
$Shortcut.TargetPath = "C:\ChromeExtensions\CC timer\CC Timer.vbs"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,13"
$Shortcut.Description = "Claude Code Session Timer"
$Shortcut.WorkingDirectory = "C:\ChromeExtensions\CC timer"
$Shortcut.Save()
Write-Host "Desktop shortcut created successfully!"