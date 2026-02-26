# NEXUS POS - Deployment & Environment Setup Guide

## Table of Contents
1. [Environment Configuration](#environment-configuration)
2. [Local Development Setup](#local-development-setup)
3. [Firebase Cloud Functions](#firebase-cloud-functions)
4. [Deployment Checklist](#deployment-checklist)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Environment Configuration

### .env File Structure

The `.env` file contains environment variables needed for the application. **NEVER commit the .env file to git**.

### Development Environment (.env.development)

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAax1NwAKGQBMc-lHbf13CD19TA7N-w_6I
VITE_FIREBASE_AUTH_DOMAIN=nexus-pos-75de4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nexus-pos-75de4
VITE_FIREBASE_STORAGE_BUCKET=nexus-pos-75de4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=140584780029
VITE_FIREBASE_APP_ID=1:140584780029:web:0dbe55643d4c2af4dcfe94

# Yoco - PUBLIC KEY ONLY (safe for client)
VITE_YOCO_PUBLIC_KEY=pk_live_0df1babdenJZJGq560a4
VITE_YOCO_PAYMENT_LINK_URL=https://pay.yoco.com/orion-dev-core

# Development Settings
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_FUNCTION_URL=http://localhost:5001/nexus-pos-75de4/us-central1
```

### Production Environment (.env.production)

```bash
# Firebase Configuration (Production Project)
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_messaging_id
VITE_FIREBASE_APP_ID=your_production_app_id

# Yoco - PUBLIC KEY ONLY
VITE_YOCO_PUBLIC_KEY=your_production_public_key
VITE_YOCO_PAYMENT_LINK_URL=https://pay.yoco.com/your_merchant_id

# Production Settings
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_FIREBASE_FUNCTION_URL=https://us-central1-your_production_project.cloudfunctions.net
```

### Security Rules

**CRITICAL: NEVER include these in .env:**
- `VITE_YOCO_SECRET_KEY` (sk_* keys)
- Firebase Admin SDK keys
- Any password or secret token

These are handled by:
- Firebase Cloud Functions (for Yoco)
- Firebase Admin SDK (server-side only)

---

## Local Development Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/Oriondevcore/nexus-pos.git
cd nexus-pos

# Install dependencies
npm install

# Install signature pad for transaction signing
npm install react-signature-canvas
```

### Step 2: Configure Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your development credentials
# (provided in .env.development)
nano .env  # or use your editor

# Verify the file was created
cat .env
```

### Step 3: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use nexus-pos-75de4
```

### Step 4: Start Local Development

```bash
# Terminal 1: Start Firebase Emulator (optional but recommended)
firebase emulators:start

# Terminal 2: Start development server
npm run dev

# App will be available at http://localhost:5173
```

### Step 5: Verify Setup

Open http://localhost:5173 in your browser and check:
- [ ] App loads without errors
- [ ] No console errors about missing environment variables
- [ ] Firebase auth is working (check console)
- [ ] Layout is centered (not squashed left)

---

## Firebase Cloud Functions

### Setup Cloud Functions

```bash
# Initialize functions in your project
firebase init functions

# Navigate to functions directory
cd functions

# Install Yoco dependencies
npm install axios

# Add yocoPayment.js (copy provided file)
cp ../yocoPayment.js src/yocoPayment.js

# Update functions/src/index.js
```

### Configure Environment Variables

```bash
# Set Yoco secret key in Firebase
firebase functions:config:set yoco.secret_key="sk_live_XXXXX"
firebase functions:config:set app.url="https://yourdomain.com"

# View configuration
firebase functions:config:get
```

### Deploy Functions

```bash
# From project root
firebase deploy --only functions

# Watch logs
firebase functions:log --follow
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] .env file NOT committed to git
- [ ] .env.example has NO secrets
- [ ] Firebase Cloud Functions deployed
- [ ] Yoco webhook configured
- [ ] Firestore security rules updated
- [ ] All dependencies installed: `npm install`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors: `npm run dev`
- [ ] Tests pass (if applicable): `npm run test`

### Code Review

- [ ] No `process.env.*` usage (Vite uses `import.meta.env.*`)
- [ ] No hardcoded API keys
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsive tested

### Firebase Setup

- [ ] Project exists: nexus-pos-75de4
- [ ] Authentication enabled
- [ ] Firestore configured
- [ ] Cloud Functions deployed
- [ ] Environment variables set
- [ ] Security rules configured
- [ ] Webhooks configured

### Testing

- [ ] Payment flow tested
- [ ] Auth flow tested
- [ ] Error handling tested
- [ ] Responsive design tested on mobile
- [ ] Cross-browser tested

---

## Production Deployment

### Option 1: Firebase Hosting

```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy to Firebase Hosting
firebase deploy --only hosting

# View live site
firebase open hosting:site
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Or connect GitHub for auto-deploy
netlify init
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Post-Deployment

1. **Verify Deployment**
   ```bash
   # Visit your domain
   # Check console for errors
   # Test payment flow
   # Verify analytics are tracking
   ```

2. **Monitor Performance**
   - Check Firebase Console for errors
   - Monitor Cloud Functions logs
   - Check application performance

3. **Setup Monitoring**
   ```bash
   firebase functions:log --follow
   ```

---

## Troubleshooting

### Environment Variables Not Loading

**Symptom**: `import.meta.env.VITE_*` returns undefined

**Solution**:
```bash
# 1. Verify .env file exists in project root
ls -la .env

# 2. Restart dev server
npm run dev

# 3. Check .env format (no spaces around =)
cat .env | head -5

# 4. Verify variables with VITE_ prefix
grep VITE_ .env
```

### Firebase Auth Not Working

**Symptom**: "Firebase App not initialized"

**Solution**:
```bash
# 1. Verify Firebase config in .env
echo $VITE_FIREBASE_PROJECT_ID

# 2. Check src/config/firebase.js imports correctly
cat src/config/firebase.js

# 3. Check console for initialization errors
# Open DevTools → Console

# 4. Restart dev server after .env changes
npm run dev
```

### Yoco Payment Failing

**Symptom**: "Payment processing failed"

**Solution**:
```bash
# 1. Verify Cloud Function deployed
firebase functions:log

# 2. Check Yoco API key in Cloud Functions
firebase functions:config:get

# 3. Verify webhook URL configured in Yoco Dashboard

# 4. Test with test mode (if available)
```

### "Cannot find module" Errors

**Symptom**: Module not found errors during build

**Solution**:
```bash
# 1. Clear dependencies
rm -rf node_modules package-lock.json

# 2. Reinstall
npm install

# 3. Rebuild
npm run build
```

### Vite Build Errors

**Symptom**: "Cannot resolve import"

**Solution**:
```bash
# 1. Check file paths (case-sensitive on Linux/Mac)
# 2. Verify imports use relative paths correctly
# 3. Check .gitignore doesn't exclude needed files
# 4. Clear Vite cache
rm -rf .vite
npm run build
```

---

## Environment Variable Reference

### Vite Access
```javascript
// ✓ Correct - Vite syntax
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// ✗ Wrong - process.env not available in client
const apiKey = process.env.VITE_FIREBASE_API_KEY;
```

### Adding New Variables

1. Add to `.env.example`:
   ```
   VITE_NEW_VAR=example_value
   ```

2. Add to `.env.development`:
   ```
   VITE_NEW_VAR=dev_value
   ```

3. Access in code:
   ```javascript
   const value = import.meta.env.VITE_NEW_VAR;
   ```

4. Commit `.env.example`, NOT `.env`

---

## Security Checklist

- [ ] No API keys in version control
- [ ] No secret keys in client-side code
- [ ] All secrets managed by Cloud Functions
- [ ] Firebase security rules configured
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain sensitive data

---

## Support & Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Vite Documentation**: https://vitejs.dev
- **Yoco API**: https://developer.yoco.com
- **GitHub Issues**: https://github.com/Oriondevcore/nexus-pos/issues

