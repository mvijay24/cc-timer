# CC Timer - Claude Code Session Clock

A standalone Windows application for tracking 5-hour coding sessions with a visual 24-hour clock interface.

## Features
- Standalone Windows app (not browser-based)
- 24-hour analog clock with digital time display
- Visual 5-hour session arc indicator (green for remaining, blue for elapsed)
- Session progress tracking with percentage
- Daily sessions table showing up to 5 sessions
- Session persistence across app restarts
- Automatic daily reset at midnight UTC
- Total daily time tracking
- System tray support
- Always-on-top window option

## Prerequisites
1. Install Node.js (v16 or higher)
2. Install Rust (https://rustup.rs/)
3. Install Microsoft Visual Studio C++ Build Tools (for Windows)

## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Create placeholder icons (required for build):
```bash
# In src-tauri/icons/, create these files:
# - icon.ico (Windows icon)
# - icon.png (System tray icon)
# - 32x32.png
# - 128x128.png
# - 128x128@2x.png
# - icon.icns (macOS, optional)
```

## Development

Run in development mode:
```bash
npm run dev
```

## Build

Build the Windows executable:
```bash
npm run build
```

The built executable will be in `src-tauri/target/release/bundle/`

## Usage
1. Click "Start Session" to begin a 5-hour timer
2. The green arc shows your 5-hour window on the clock
3. Progress bar shows session completion percentage
4. App minimizes to system tray when closed
5. Click tray icon to restore window

## Technical Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Rust with Tauri
- **Platform**: Windows native application