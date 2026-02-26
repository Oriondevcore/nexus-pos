# NEXUS POS — Complete Setup Guide
### Windows 11 | VS Code | Node.js | PowerShell 7
#### For Complete Beginners — Every Step Explained

---

Before you start: This guide assumes you have Windows 11 installed.
Everything else — we install together, step by step.
Estimated time: 45-90 minutes (first time setup)
Cost to get started: $0 (all free tools)

---

## TABLE OF CONTENTS

1. Install the Tools
2. Set Up Your Project Folder
3. Create the React App
4. Set Up Firebase
5. Connect Firebase to Your App
6. Install App Dependencies
7. Test That Everything Works
8. Understanding Your Project Structure
9. VS Code Extensions to Install
10. Yoco API Setup
11. Common Errors and Fixes
12. Next Steps

---

## 1. INSTALL THE TOOLS

### 1.1 — Check What You Already Have

Open PowerShell 7 (search for it in the Start menu) and run these commands one at a time.
If you see a version number, it is already installed. If you see an error, you need to install it.

    node --version

You need: v18 or higher (e.g. v20.11.0)

    npm --version

You need: v9 or higher (e.g. v10.2.4)

    git --version

You need: any version (e.g. git version 2.43.0)

---

### 1.2 — Install Node.js (if not installed or wrong version)

1. Go to https://nodejs.org
2. Click the big "LTS" button (Long Term Support — the stable one)
3. Download and run the .msi installer
4. Click Next > Next > Next > Install (all defaults are fine)
5. When done, close and reopen PowerShell 7
6. Run: node --version
7. You should see v20.x.x

---

### 1.3 — Install Git (if not installed)

1. Go to https://git-scm.com/download/win
2. Download the 64-bit Windows installer
3. Run it — click Next through everything (all defaults are perfect)
4. Close and reopen PowerShell 7
5. Run: git --version to confirm

---

### 1.4 — Install VS Code (if not installed)

1. Go to https://code.visualstudio.com
2. Click Download for Windows
3. Run the installer
4. TICK THESE OPTIONS during install:
   - "Add Open with Code action to Windows Explorer file context menu"
   - "Add Open with Code action to Windows Explorer directory context menu"
   - "Register Code as an editor for supported file types"
   - "Add to PATH"
5. Click Install, then Finish

---

### 1.5 — Install Firebase CLI

This is the command-line tool for Firebase (Google's backend we are using).

In PowerShell 7, run:

    npm install -g firebase-tools

The -g means "global" — installs it once for your whole computer.

When done, verify with:

    firebase --version

Should show something like 13.x.x

---

## 2. SET UP YOUR PROJECT FOLDER

### 2.1 — Create a Folder for Your Project

In PowerShell 7, navigate to Documents:

    cd ~\Documents

Create a folder:

    mkdir nexus-pos

Move into it:

    cd nexus-pos

Your PowerShell prompt should now end with: ...\Documents\nexus-pos>

---

### 2.2 — Open in VS Code

    code .

The dot means "open this current folder in VS Code".
VS Code will open with an empty Explorer panel on the left.

---

## 3. CREATE THE REACT APP

We are using Vite — it is like Create React App but much faster.

### 3.1 — Scaffold the Project

In PowerShell 7 (make sure you are still in the nexus-pos folder):

    npm create vite@latest . -- --template react

The dot means "create it in this current folder".
When asked: "Current directory is not empty. Remove existing files and continue?"
Type: y and press Enter.

You will see a menu. Use arrow keys to select:
- Framework: React
- Variant: JavaScript (not TypeScript — simpler for now)

### 3.2 — Install Base Dependencies

    npm install

This downloads everything React needs. Takes 1-2 minutes. Lots of text is normal.

### 3.3 — Test It Works

    npm run dev

You should see:

    VITE v5.x.x  ready in 300ms
    Local:   http://localhost:5173/

Open your browser and go to http://localhost:5173
You should see the Vite + React welcome page.

Press Ctrl + C in PowerShell to stop the server.

---

## 4. SET UP FIREBASE

Firebase is Google's backend — database, file storage, and user authentication, all free to start.

### 4.1 — Create a Google Account (if needed)

Go to https://accounts.google.com to create one if you do not have one.

---

### 4.2 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Project name: nexus-pos (or anything you like)
4. Google Analytics: Click "Continue" (you can disable it — does not matter)
5. Click "Create project"
6. Wait for it to finish (10-15 seconds)
7. Click "Continue"

You are now in the Firebase Console for your project.

---

### 4.3 — Enable Firestore Database

This is where all clients, inventory, and transactions will be stored.

1. In the left sidebar, click "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (we will add security rules later)
4. Choose a location closest to South Africa:
   - europe-west1 (Belgium) or africa-south1 if available
5. Click "Enable"

Wait for it to set up (30-60 seconds).

---

### 4.4 — Enable Authentication

1. In the left sidebar, click "Authentication"
2. Click "Get started"
3. Under "Sign-in providers", click "Email/Password"
4. Toggle "Enable" to ON
5. Click "Save"

Users can now sign in with email and password.

---

### 4.5 — Enable Storage (for images, signatures, logos)

1. In the left sidebar, click "Storage"
2. Click "Get started"
3. Select "Start in test mode"
4. Choose the same location as your database
5. Click "Done"

---

### 4.6 — Register Your Web App

1. On the Firebase Console, click the gear icon next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the Web icon (it looks like: </> )
5. App nickname: nexus-pos-web
6. Leave "Firebase Hosting" unchecked for now
7. Click "Register app"

You will see a block of code like this:

    const firebaseConfig = {
      apiKey: "AIzaSyXXXXXXXXXXXXXXXXXX",
      authDomain: "nexus-pos.firebaseapp.com",
      projectId: "nexus-pos",
      storageBucket: "nexus-pos.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdefgh"
    };

!!! COPY THIS ENTIRE BLOCK — you will need it in the next step !!!

Click "Continue to console".

---

## 5. CONNECT FIREBASE TO YOUR APP

### 5.1 — Create Your Environment File

In VS Code, create a new file in your project root called: .env

Click the New File icon in the VS Code Explorer panel, name it exactly: .env

Paste this template and fill in YOUR values from step 4.6:

    VITE_FIREBASE_API_KEY=paste_your_apiKey_here
    VITE_FIREBASE_AUTH_DOMAIN=paste_your_authDomain_here
    VITE_FIREBASE_PROJECT_ID=paste_your_projectId_here
    VITE_FIREBASE_STORAGE_BUCKET=paste_your_storageBucket_here
    VITE_FIREBASE_MESSAGING_SENDER_ID=paste_your_messagingSenderId_here
    VITE_FIREBASE_APP_ID=paste_your_appId_here

SECURITY NOTE: The .env file is private. Never share it or put it on GitHub.
Vite automatically reads .env files — that is why we use the VITE_ prefix.

---

### 5.2 — Create a .gitignore File

Create a new file called: .gitignore

Paste this content:

    node_modules
    .env
    .env.local
    dist
    .firebase

This protects your secrets if you ever use Git or GitHub.

---

## 6. INSTALL APP DEPENDENCIES

Now we install all the extra libraries NEXUS POS needs.
In PowerShell 7 (make sure you are in the nexus-pos folder).

### Step 1 — Main packages:

    npm install firebase react-router-dom react-signature-canvas jspdf jspdf-autotable recharts lucide-react react-hot-toast date-fns

### Step 2 — Tailwind CSS:

    npm install -D tailwindcss postcss autoprefixer

### Step 3 — Initialize Tailwind:

    npx tailwindcss init -p

---

What each package does:

- firebase             — Connects to your Firebase database and auth
- react-router-dom     — Navigation between screens
- react-signature-canvas — Digital signature pad
- jspdf + jspdf-autotable — Generate PDF invoices and quotes
- recharts             — Beautiful charts for the dashboard
- lucide-react         — Clean icon library
- react-hot-toast      — Pop-up success/error notifications
- date-fns             — Easy date formatting and manipulation
- tailwindcss          — CSS framework for styling the UI

---

## 7. TEST THAT EVERYTHING WORKS

Run the dev server:

    npm run dev

Go to http://localhost:5173 in your browser.
You should still see the Vite welcome page — that is fine for now.

In PowerShell, look for any red error text.
Common issues and fixes are in Section 11 below.

---

## 8. UNDERSTANDING YOUR PROJECT STRUCTURE

After setup, your folder looks like this:

    nexus-pos/
    |
    +-- public/              <- Static files (favicon, icons)
    |
    +-- src/                 <- ALL YOUR APP CODE LIVES HERE
    |   +-- components/      <- Reusable UI pieces (buttons, cards, modals)
    |   +-- pages/           <- Full screens (Home, QuickSale, ClientSale)
    |   +-- hooks/           <- Custom React hooks (useAuth, useClients)
    |   +-- services/        <- Firebase and API functions
    |   +-- context/         <- App-wide state (auth, theme, tenant)
    |   +-- utils/           <- Helper functions (formatCurrency, generatePDF)
    |   +-- styles/          <- Global CSS and theme variables
    |   +-- App.jsx          <- Main app and routing
    |   +-- main.jsx         <- Entry point
    |   +-- firebase.js      <- Firebase connection (we will create this)
    |
    +-- .env                 <- Your secret keys (NEVER SHARE THIS FILE!)
    +-- .gitignore           <- Files Git should ignore
    +-- index.html           <- HTML entry point
    +-- package.json         <- Project info and dependency list
    +-- tailwind.config.js   <- Tailwind CSS settings
    +-- vite.config.js       <- Vite build settings

GOLDEN RULE: Almost everything you work on will be inside the src/ folder.

---

## 9. VS CODE EXTENSIONS TO INSTALL

Open VS Code. Press Ctrl + Shift + X to open Extensions.
Search for and install each of these:

    ES7+ React/Redux/React-Native snippets
    -> Auto-complete React code, saves enormous amounts of typing

    Tailwind CSS IntelliSense
    -> Auto-suggests Tailwind class names as you type

    Prettier - Code Formatter
    -> Auto-formats your code to look neat and consistent

    ESLint
    -> Catches code errors and bad patterns before they break things

    GitLens
    -> See Git history and track changes over time

    Auto Rename Tag
    -> When you rename an HTML opening tag, it renames the closing tag too

    Error Lens
    -> Shows errors and warnings inline right in your code

    Path Intellisense
    -> Auto-completes file paths when you import things

---

### 9.1 — Set Prettier as Default Formatter

1. Press Ctrl + Shift + P
2. Type: Open User Settings JSON
3. Select: "Preferences: Open User Settings (JSON)"
4. Add these lines inside the curly braces {}:

    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"

Now your code auto-formats every single time you press Ctrl + S to save.

---

### 9.2 — Use VS Code's Built-In Terminal

VS Code has a built-in terminal — use this instead of switching windows.
Open it with: Ctrl + ` (the backtick key, above the Tab key)

To make it use PowerShell 7:
1. Press Ctrl + Shift + P
2. Type: Terminal Select Default Profile
3. Choose: PowerShell

From now on run all commands directly inside VS Code.

---

## 10. YOCO API SETUP

### 10.1 — Get Your Yoco Keys

1. Go to https://portal.yoco.com
2. Log in to your Yoco Business account
3. Go to Developers > API Keys
4. You will find:
   - Public Key   (starts with pk_live_...)
   - Secret Key   (starts with sk_live_...)

### 10.2 — Add to Your .env File

Open your .env file in VS Code and add:

    VITE_YOCO_PUBLIC_KEY=pk_live_your_key_here
    VITE_YOCO_SECRET_KEY=sk_live_your_key_here
    VITE_YOCO_PAYMENT_LINK_URL=https://payments.yoco.com/api/checkouts

!!! IMPORTANT: NEVER put your Secret Key in any file that runs in the browser !!!
The secret key will ONLY be used in Firebase Cloud Functions (server-side code).
We will set this up safely when we build the payment integration.

### 10.3 — Use Sandbox / Test Mode While Building

Yoco has a test mode. In the Yoco portal, look for a "Test Mode" toggle.
Use test keys while building so absolutely no real money moves.
Only switch to live keys when you are ready to go live.

---

## 11. COMMON ERRORS AND FIXES

---

ERROR: "npm is not recognized as the name of a cmdlet"

This means Node.js is not installed or its PATH is not configured.
Fix: Reinstall Node.js from nodejs.org. Make sure to tick "Add to PATH" during install.
Then close and reopen PowerShell 7 completely.

---

ERROR: "EACCES: permission denied" or "Access is denied"

Fix: Run PowerShell 7 as Administrator.
Right-click the PowerShell 7 icon in your Start menu.
Click "Run as Administrator".
Then retry the command that failed.

---

ERROR: "Cannot find module firebase/app"

Firebase was not installed correctly.
Fix: Run this command again:
    npm install firebase

---

ERROR: "Port 5173 is already in use"

Another app or a previous server is using that port.
Fix option 1: Close the other PowerShell window that is running npm run dev.
Fix option 2: Use a different port:
    npm run dev -- --port 3000

---

ERROR: "running scripts is disabled on this system"

PowerShell's execution policy is blocking scripts.
Fix: Open PowerShell 7 as Administrator and run:
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Type Y and press Enter. Then retry your command.

---

ERROR: Tailwind CSS classes have no effect / no styling appears

Fix step 1: Open tailwind.config.js and make sure it looks like this:

    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: { extend: {} },
      plugins: [],
    }

Fix step 2: Open src/index.css and make sure the very first three lines are:

    @tailwind base;
    @tailwind components;
    @tailwind utilities;

Save both files. Restart the dev server with: npm run dev

---

ERROR: "Firebase: Error (auth/invalid-api-key)"

Your .env values were not copied correctly.
Fix: Go back to Firebase Console > Project Settings > Your Apps.
Copy each value carefully. Make sure:
- There are no spaces around the = sign
- There are no quote marks around the values
- The file is saved in VS Code (Ctrl + S)

---

ERROR: Changes not appearing in the browser

The browser might be serving a cached version.
Fix: Press Ctrl + Shift + R in your browser (hard refresh).
Or stop and restart: npm run dev

---

## 12. NEXT STEPS

You are fully set up! Here is the build plan going forward.

---

### PHASE 1 — Just say "Let's Build Phase 1"

I will generate the complete code for:

- App shell with all screens wired up and routing
- Dark and Light theme (midnight black + metallic gold)
- Particle background animation
- Firebase connection file (firebase.js)
- Login and Register screens
- Multi-tenant foundation (each white-label client is isolated)
- Bottom navigation bar (mobile-style, like a real app)
- White-label configuration screen (logo, colours, business name)

---

### PHASE 2 — Quick Sale + Yoco

- Big beautiful number pad entry screen
- Payment gateway selector with logos
- WhatsApp / SMS / Email / QR Code send options
- Terms and Conditions checkbox with customisable text
- Canvas digital signature pad (sign, clear, confirm)
- Particle animation on send
- Confirmation screen with transaction reference
- Live Yoco payment link generation

---

### PHASE 3 — Clients, Inventory and Client Sale

- Full client management (create, edit, search, delete)
- Full inventory management (products, categories, images, stock)
- Client Sale flow with auto-populated contact details
- VAT calculation engine (inclusive/exclusive, configurable rate)
- Per-item and per-order discounts
- PDF invoice and quote generation with your branding
- Signature embedded in PDF

---

### PHASE 4 — Dashboard, Gateways and Admin

- Revenue dashboard with live charts (today/week/month)
- Full transaction history with Pending/Paid/Failed/Expired status
- Resend payment links from history
- Stripe integration
- M-Pesa STK Push integration
- Gateway manager (add, edit, delete, test connection)
- Super admin panel to manage all white-label tenants

---

## QUICK COMMANDS CHEAT SHEET

    npm run dev          Start the app locally for development
    npm run build        Build the app for production/deployment
    npm install          Install all dependencies listed in package.json
    npm install xyz      Install a specific package named xyz
    firebase login       Log into Firebase CLI with your Google account
    firebase deploy      Deploy your app live to Firebase Hosting
    Ctrl + C             Stop the running dev server in PowerShell
    code .               Open current folder in VS Code

---

## GETTING HELP

If something breaks or you get an error:

1. Do NOT panic — errors are completely normal
2. Copy the full error message from PowerShell (right-click to select all)
3. Come back here and paste it in the chat
4. Say: "I got this error during setup"
5. It will be fixed immediately

You are doing great. This is the hardest part — setup.
Once it is done, it is done forever and we start building the actual app.

---

NEXUS POS Setup Guide v1.0
Stack: React + Vite | Firebase | Tailwind CSS | Windows 11