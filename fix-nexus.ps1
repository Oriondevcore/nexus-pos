# NEXUS POS — Full Fix Script
# Run from inside nexus-pos folder

Write-Host ""
Write-Host "  NEXUS POS — Diagnosing & Fixing..." -ForegroundColor Yellow
Write-Host ""

# ── FIX 1: index.html ───────────────────────────────────────
Write-Host "  [1/5] Fixing index.html..." -ForegroundColor Cyan
$html = @'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NEXUS POS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'@
Set-Content -Path "index.html" -Value $html
Write-Host "       OK" -ForegroundColor Green

# ── FIX 2: src/main.jsx ─────────────────────────────────────
Write-Host "  [2/5] Fixing src/main.jsx..." -ForegroundColor Cyan
$main = @'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
'@
Set-Content -Path "src\main.jsx" -Value $main
Write-Host "       OK" -ForegroundColor Green

# ── FIX 3: tailwind.config.js ───────────────────────────────
Write-Host "  [3/5] Fixing tailwind.config.js..." -ForegroundColor Cyan
$tw = @'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
'@
Set-Content -Path "tailwind.config.js" -Value $tw
Write-Host "       OK" -ForegroundColor Green

# ── FIX 4: src/index.css — ensure Tailwind directives first ─
Write-Host "  [4/5] Fixing src/index.css (Tailwind directives)..." -ForegroundColor Cyan
$existing = Get-Content "src\index.css" -Raw -ErrorAction SilentlyContinue
if ($existing -notmatch "@tailwind base") {
    $prefix = "@tailwind base;`n@tailwind components;`n@tailwind utilities;`n`n"
    Set-Content -Path "src\index.css" -Value ($prefix + $existing)
    Write-Host "       Added missing Tailwind directives" -ForegroundColor Yellow
} else {
    Write-Host "       OK (already has Tailwind directives)" -ForegroundColor Green
}

# ── FIX 5: App.css conflicts ────────────────────────────────
Write-Host "  [5/5] Removing conflicting App.css..." -ForegroundColor Cyan
if (Test-Path "src\App.css") {
    Set-Content -Path "src\App.css" -Value "/* cleared */"
    Write-Host "       Cleared App.css" -ForegroundColor Yellow
} else {
    Write-Host "       OK (no App.css conflict)" -ForegroundColor Green
}

# ── Remove old App.jsx if it still has Vite default content ─
$appContent = Get-Content "src\App.jsx" -Raw -ErrorAction SilentlyContinue
if ($appContent -match "vite" -or $appContent -match "useState.*count") {
    Write-Host ""
    Write-Host "  WARNING: src\App.jsx still has Vite default content!" -ForegroundColor Red
    Write-Host "  You need to replace it with the NEXUS App.jsx file." -ForegroundColor Red
}

Write-Host ""
Write-Host "  All fixes applied!" -ForegroundColor Green
Write-Host ""
Write-Host "  Now run:  npm run dev" -ForegroundColor Yellow
Write-Host ""