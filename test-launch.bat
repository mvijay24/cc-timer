@echo off
echo Testing CC Timer...
echo.
echo Opening in Edge App Mode...
start msedge --app="file:///C:/ChromeExtensions/CC%%20timer/src/index.html" --window-size=1000,800
echo.
echo If the window doesn't open, check:
echo 1. Edge is installed
echo 2. Path is correct: C:\ChromeExtensions\CC timer\src\index.html
echo.
pause