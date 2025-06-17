# Quick Start Guide - CC Timer

## Prerequisites Installation

### 1. Install Node.js
Download from: https://nodejs.org/
- Choose LTS version
- Run installer with default settings

### 2. Install Rust
Download from: https://rustup.rs/
- Run the installer
- Follow prompts (default installation)

### 3. Install Visual Studio Build Tools (Windows)
Download from: https://visualstudio.microsoft.com/downloads/
- Download "Build Tools for Visual Studio"
- In installer, select "Desktop development with C++"
- Install

## First Time Setup

1. Open Command Prompt in project directory
2. Run: `npm install`

## Development

To run the app in development mode:
```
npm run dev
```

## Build for Production

Double-click `build-windows.bat` or run:
```
npm run build
```

## Troubleshooting

### Icons Missing Error
Create dummy icon files in `src-tauri/icons/`:
- Create empty text files and rename them to:
  - icon.ico
  - icon.png
  - 32x32.png
  - 128x128.png
  - 128x128@2x.png

### Build Fails
1. Ensure all prerequisites are installed
2. Restart command prompt after installing Rust
3. Check that `rustc --version` works
4. Check that `npm --version` works

### App Won't Start
- Check Windows Defender/Antivirus isn't blocking it
- Run as administrator if needed

## Features Overview
- **Start Session**: Begins 5-hour timer with visual arc
- **System Tray**: App minimizes to tray when closed
- **Always on Top**: Window stays above other windows
- **Session Progress**: Shows elapsed time and percentage
- **Auto End**: Session ends automatically after 5 hours