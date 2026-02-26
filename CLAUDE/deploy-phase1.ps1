# ==============================================================
# NEXUS POS — Phase 1 Deployment Script
# Run this from inside your nexus-pos project folder
# PowerShell 7 — Right-click > Run with PowerShell OR paste into terminal
# ==============================================================
#
# BEFORE RUNNING:
#   1. Make sure you are in your nexus-pos folder
#   2. Make sure npm install has been run
#   3. Make sure your .env file exists with Firebase keys
#
# HOW TO RUN:
#   cd ~\Documents\nexus-pos
#   .\deploy-phase1.ps1
#
# ==============================================================

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "  ║     NEXUS POS — Phase 1 Deploy       ║" -ForegroundColor Yellow
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# ── STEP 1: Create folder structure ─────────────────────────
Write-Host "  [1/4] Creating folder structure..." -ForegroundColor Cyan

$folders = @(
    "src\context",
    "src\components",
    "src\pages\auth",
    "src\hooks",
    "src\utils",
    "src\services"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "       ✓ $folder" -ForegroundColor DarkGreen
}

Write-Host ""

# ── STEP 2: Copy source files ────────────────────────────────
Write-Host "  [2/4] Installing Phase 1 source files..." -ForegroundColor Cyan

# List of files to copy from the phase1 folder
# These were downloaded/extracted from the NEXUS POS Phase 1 package

$files = @(
    @{ from = "phase1\tailwind.config.js";              to = "tailwind.config.js" },
    @{ from = "phase1\src\index.css";                   to = "src\index.css" },
    @{ from = "phase1\src\firebase.js";                 to = "src\firebase.js" },
    @{ from = "phase1\src\App.jsx";                     to = "src\App.jsx" },
    @{ from = "phase1\src\main.jsx";                    to = "src\main.jsx" },
    @{ from = "phase1\src\context\AuthContext.jsx";     to = "src\context\AuthContext.jsx" },
    @{ from = "phase1\src\context\ThemeContext.jsx";    to = "src\context\ThemeContext.jsx" },
    @{ from = "phase1\src\context\TenantContext.jsx";   to = "src\context\TenantContext.jsx" },
    @{ from = "phase1\src\components\ParticleCanvas.jsx"; to = "src\components\ParticleCanvas.jsx" },
    @{ from = "phase1\src\components\BottomNav.jsx";    to = "src\components\BottomNav.jsx" },
    @{ from = "phase1\src\components\LoadingScreen.jsx"; to = "src\components\LoadingScreen.jsx" },
    @{ from = "phase1\src\pages\auth\Login.jsx";        to = "src\pages\auth\Login.jsx" },
    @{ from = "phase1\src\pages\auth\Register.jsx";     to = "src\pages\auth\Register.jsx" },
    @{ from = "phase1\src\pages\Home.jsx";              to = "src\pages\Home.jsx" },
    @{ from = "phase1\src\pages\Settings.jsx";          to = "src\pages\Settings.jsx" },
    @{ from = "phase1\src\pages\Placeholder.jsx";       to = "src\pages\Placeholder.jsx" }
)

foreach ($file in $files) {
    if (Test-Path $file.from) {
        Copy-Item $file.from $file.to -Force
        Write-Host "       ✓ $($file.to)" -ForegroundColor DarkGreen
    } else {
        Write-Host "       ⚠ Not found: $($file.from) — copy manually" -ForegroundColor Yellow
    }
}

Write-Host ""

# ── STEP 3: Update Tailwind config ──────────────────────────
Write-Host "  [3/4] Verifying Tailwind config..." -ForegroundColor Cyan

$tailwindContent = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
}
"@

# Only write if tailwind.config.js is the default
$existing = Get-Content "tailwind.config.js" -Raw -ErrorAction SilentlyContinue
if ($existing -notmatch "darkMode") {
    Write-Host "       → Updating tailwind.config.js with darkMode support" -ForegroundColor Yellow
    Set-Content "tailwind.config.js" $tailwindContent
} else {
    Write-Host "       ✓ tailwind.config.js already configured" -ForegroundColor DarkGreen
}

Write-Host ""

# ── STEP 4: Check .env file ──────────────────────────────────
Write-Host "  [4/4] Checking .env file..." -ForegroundColor Cyan

if (Test-Path ".env") {
    $env = Get-Content ".env" -Raw
    $required = @("VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID")
    $missing = @()
    foreach ($key in $required) {
        if ($env -notmatch $key) { $missing += $key }
    }
    if ($missing.Count -eq 0) {
        Write-Host "       ✓ .env file found with Firebase keys" -ForegroundColor DarkGreen
    } else {
        Write-Host "       ⚠ .env file missing keys: $($missing -join ', ')" -ForegroundColor Red
        Write-Host "         Add these to your .env file before running the app!" -ForegroundColor Red
    }
} else {
    Write-Host "       ✗ No .env file found!" -ForegroundColor Red
    Write-Host "         Create .env with your Firebase keys before starting" -ForegroundColor Red
}

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║         Phase 1 Files Ready!         ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1.  npm run dev" -ForegroundColor Yellow
Write-Host "    2.  Open http://localhost:5173" -ForegroundColor Yellow
Write-Host "    3.  Register your first account" -ForegroundColor Yellow
Write-Host "    4.  You should see the NEXUS POS home screen!" -ForegroundColor Yellow
Write-Host ""
