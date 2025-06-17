@echo off
echo Building CC Timer for Windows...
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if cargo is installed
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Rust/Cargo is not installed. Please install from https://rustup.rs/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the app
echo Building application...
npm run build

if %errorlevel% equ 0 (
    echo.
    echo Build successful!
    echo The executable can be found in: src-tauri\target\release\
    echo Look for cc-timer.exe
) else (
    echo.
    echo Build failed. Please check the error messages above.
)

pause