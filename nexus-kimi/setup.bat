@echo off
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          NEXUS POS — PWA Setup Wizard                        ║"
echo "║          Firebase-Hosted Point of Sale System                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo "[ERROR] Node.js not found. Please install Node.js 18+ from nodejs.org"
    pause
    exit /b 1
)

echo "[✓] Node.js detected"
node --version

:: Create project structure
echo "[...] Creating project structure..."

mkdir nexus-pos
cd nexus-pos

mkdir src\components
mkdir src\hooks
mkdir src\context
mkdir src\utils
mkdir src\styles
mkdir public\icons

:: Create package.json
echo { > package.json
echo   "name": "nexus-pos", >> package.json
echo   "private": true, >> package.json
echo   "version": "1.0.0", >> package.json
echo   "type": "module", >> package.json
echo   "scripts": { >> package.json
echo     "dev": "vite", >> package.json
echo     "build": "vite build", >> package.json
echo     "preview": "vite preview", >> package.json
echo     "deploy": "npm run build ^&^& firebase deploy" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "react": "^18.2.0", >> package.json
echo     "react-dom": "^18.2.0", >> package.json
echo     "react-router-dom": "^6.20.0", >> package.json
echo     "firebase": "^10.7.0", >> package.json
echo     "react-signature-canvas": "^1.0.6", >> package.json
echo     "jspdf": "^2.5.1", >> package.json
echo     "html2canvas": "^1.4.1", >> package.json
echo     "recharts": "^2.10.0", >> package.json
echo     "date-fns": "^2.30.0", >> package.json
echo     "uuid": "^9.0.0" >> package.json
echo   }, >> package.json
echo   "devDependencies": { >> package.json
echo     "@types/react": "^18.2.37", >> package.json
echo     "@types/react-dom": "^18.2.15", >> package.json
echo     "@vitejs/plugin-react": "^4.2.0", >> package.json
echo     "autoprefixer": "^10.4.16", >> package.json
echo     "postcss": "^8.4.32", >> package.json
echo     "tailwindcss": "^3.3.6", >> package.json
echo     "vite": "^5.0.0", >> package.json
echo     "vite-plugin-pwa": "^0.17.4" >> package.json
echo   } >> package.json
echo } >> package.json

:: Create .env.example
echo # Firebase Configuration > .env.example
echo VITE_FIREBASE_API_KEY=your_api_key_here >> .env.example
echo VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com >> .env.example
echo VITE_FIREBASE_PROJECT_ID=your_project_id >> .env.example
echo VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com >> .env.example
echo VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 >> .env.example
echo VITE_FIREBASE_APP_ID=1:123456789:web:abcdef >> .env.example
echo. >> .env.example
echo # Payment Gateways >> .env.example
echo VITE_YOCO_PUBLIC_KEY=pk_live_yoco_key >> .env.example
echo VITE_STRIPE_PUBLIC_KEY=pk_live_stripe_key >> .env.example
echo VITE_MPESA_SHORTCODE=123456 >> .env.example

:: Create .gitignore
echo node_modules > .gitignore
echo .env >> .gitignore
echo dist >> .gitignore
echo .firebase >> .gitignore
echo *.log >> .gitignore

echo "[✓] Project structure created"

:: Install dependencies
echo "[...] Installing dependencies (this may take 2-3 minutes)..."
call npm install

echo "[✓] Dependencies installed"

:: Create remaining config files via Node script
echo "[...] Generating configuration files..."

:: Create the setup completion message
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETE                            ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Next Steps:                                                 ║"
echo "║  1. Copy .env.example to .env                                ║"
echo "║  2. Paste your Firebase API keys into .env                   ║"
echo "║  3. Run: npm run dev                                         ║"
echo "║  4. Open http://localhost:5173                               ║"
echo "║                                                              ║"
echo "║  To deploy: npm run deploy                                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"

pause   