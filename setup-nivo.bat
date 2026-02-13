@echo off
REM ============================================================================
REM NIVO CHARTS INTEGRATION SETUP SCRIPT - Windows
REM ============================================================================
REM This script helps you complete the migration from Chart.js to Nivo
REM ============================================================================

echo.
echo 🚀 Starting Nivo Charts Integration...
echo.

REM Step 1: Navigate to frontend directory
echo 📁 Step 1: Entering frontend directory...
cd frontend

REM Step 2: Install dependencies
echo 📦 Step 2: Installing Nivo dependencies...
echo    This may take a few minutes...
call npm install

if errorlevel 1 (
    echo.
    echo ❌ Installation failed. Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Step 3: Build information
echo 🔨 Step 3: Building the project...
echo    Run the following command to build:
echo    npm run build
echo.

REM Step 4: Run development server (optional)
echo 🚀 Step 4: Ready to start development!
echo    Run the following command to start the dev server:
echo    npm run dev
echo.

REM Summary
echo ============================================================================
echo ✨ Migration Setup Complete!
echo ============================================================================
echo.
echo 📚 Documentation files created:
echo    • SUMMARY.md - Overview of all changes
echo    • NIVO_MIGRATION_GUIDE.md - Complete migration reference
echo    • frontend/NIVO_QUICK_START.ts - 20 practical code examples
echo.
echo 📂 New files created:
echo    • frontend/src/NivoCharts.tsx - All Nivo chart components
echo.
echo ✏️  Modified files:
echo    • frontend/package.json - Updated dependencies
echo    • frontend/src/dashboard.tsx - Integrated Nivo charts
echo.
echo 🎯 Next steps:
echo    1. npm install (if not already done)
echo    2. npm run dev (to start development server)
echo    3. Open http://localhost:5173 in your browser
echo    4. Check the dashboard to see Nivo charts in action
echo.
echo 📖 For more information, see:
echo    • NIVO_MIGRATION_GUIDE.md
echo    • NIVO_QUICK_START.ts
echo    • https://nivo.rocks/ (Official Nivo docs)
echo.
echo ✅ Happy charting! 📊
echo ============================================================================
echo.
pause
