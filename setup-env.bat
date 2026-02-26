@echo off
REM NEXUS POS - Environment Setup Script (Windows)
REM This script automates the initial setup process

echo.
echo ======================================
echo NEXUS POS - Environment Setup
echo ======================================
echo.

REM Check if running from project root
if not exist "package.json" (
    echo Error: package.json not found. Please run from project root.
    pause
    exit /b 1
)

REM Step 1: Check Node version
echo Step 1: Checking Node.js version...
node -v >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js 16+ first.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node version: %NODE_VERSION%
echo.

REM Step 2: Install dependencies
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install dependencies.
    pause
    exit /b 1
)
echo Dependencies installed successfully.
echo.

REM Step 3: Setup .env file
echo Step 3: Setting up .env file...
if exist ".env" (
    echo .env file already exists.
    set /p KEEP_ENV="Keep existing .env? (y/n): "
    if /i not "%KEEP_ENV%"=="y" (
        echo Creating new .env file...
        copy .env.example .env >nul
    )
) else (
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo .env created. Please edit with your credentials.
)
echo.

REM Step 4: Verify .env configuration
echo Step 4: Checking .env configuration...
setlocal enabledelayedexpansion
set MISSING_VARS=0

for %%V in (
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_YOCO_PUBLIC_KEY"
) do (
    findstr /M "^%%V=" .env >nul 2>&1
    if errorlevel 1 (
        echo X %%V is missing from .env
        set /a MISSING_VARS=!MISSING_VARS!+1
    ) else (
        echo + %%V is configured
    )
)

if %MISSING_VARS% gtr 0 (
    echo.
    echo Please configure missing variables in .env:
    echo 1. Open .env file
    echo 2. Add your Firebase credentials
    echo 3. Add your Yoco Public Key
    echo 4. Save the file
    echo.
    echo Then run: npm run dev
    pause
    exit /b 0
)
echo All required variables configured!
echo.

REM Step 5: Check Firebase CLI
echo Step 5: Checking Firebase CLI...
where firebase >nul 2>&1
if errorlevel 1 (
    set /p INSTALL_FIREBASE="Firebase CLI not found. Install globally? (y/n): "
    if /i "%INSTALL_FIREBASE%"=="y" (
        call npm install -g firebase-tools
    )
) else (
    echo Firebase CLI is installed
)
echo.

REM Step 6: Verify Build
echo Step 6: Verifying build...
call npm run build
if errorlevel 1 (
    echo Build failed. Check errors above.
    pause
    exit /b 1
)
echo Build successful!
echo.

REM Step 7: Summary
echo =======================================
echo Setup Complete!
echo =======================================
echo.
echo Next steps:
echo 1. Review .env file: type .env
echo 2. Start development server: npm run dev
echo 3. View at: http://localhost:5173
echo.
echo For Cloud Functions setup:
echo 1. Read: FIREBASE_SETUP_GUIDE.md
echo 2. Initialize functions: firebase init functions
echo 3. Deploy: firebase deploy --only functions
echo.
echo For deployment:
echo 1. Read: DEPLOYMENT_GUIDE.md
echo 2. Build: npm run build
echo 3. Deploy to Firebase Hosting: firebase deploy --only hosting
echo.

pause
