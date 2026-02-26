# NEXUS POS - Deployment Checklist

Complete this checklist to ensure your deployment is ready for production.

---

## 📋 PRE-DEPLOYMENT (Phase 1)

### Environment Setup
- [ ] Project cloned from GitHub
- [ ] Node.js v16+ installed (`node -v`)
- [ ] npm v8+ installed (`npm -v`)
- [ ] Project root confirmed (package.json exists)

### Dependencies
- [ ] Dependencies installed: `npm install`
- [ ] react-signature-canvas installed: `npm install react-signature-canvas`
- [ ] No installation errors
- [ ] node_modules folder created

### Configuration Files
- [ ] `.env.example` exists in project root
- [ ] `.env.development` exists in project root
- [ ] `.env` copied from `.env.example`: `cp .env.example .env`
- [ ] `.env` has NOT been committed to git
- [ ] `.gitignore` configured to exclude `.env`

### Environment Variables - Firebase
- [ ] `VITE_FIREBASE_API_KEY` set in `.env`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` set in `.env`
- [ ] `VITE_FIREBASE_PROJECT_ID` set in `.env`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` set in `.env`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` set in `.env`
- [ ] `VITE_FIREBASE_APP_ID` set in `.env`

### Environment Variables - Yoco
- [ ] `VITE_YOCO_PUBLIC_KEY` set in `.env` (pk_* format)
- [ ] `VITE_YOCO_PAYMENT_LINK_URL` set in `.env`
- [ ] **NO** `VITE_YOCO_SECRET_KEY` in `.env` ⚠️ CRITICAL

### Environment Variables - App
- [ ] `VITE_APP_ENV=development` set
- [ ] `VITE_API_BASE_URL=http://localhost:3000` set
- [ ] `VITE_FIREBASE_FUNCTION_URL` set (localhost for dev)

### File Verification
- [ ] `src/index.css` has centering CSS (mobile layout)
- [ ] `src/context/AuthContext.jsx` exports useAuth and AuthProvider
- [ ] `src/config/firebase.js` exists and initializes Firebase
- [ ] `vite.config.js` configured correctly
- [ ] `tailwind.config.js` configured correctly

---

## 🚀 DEVELOPMENT (Phase 2)

### First Run
- [ ] Start dev server: `npm run dev`
- [ ] App loads at http://localhost:5173
- [ ] No console errors
- [ ] Mobile layout is centered (not squashed)
- [ ] Stop server: Ctrl+C

### Code Verification
- [ ] All imports use correct file paths
- [ ] No hardcoded API keys in code
- [ ] No process.env usage (use import.meta.env)
- [ ] Firebase import statements correct
- [ ] No TypeScript errors (if using TS)

### Build Test
- [ ] Build succeeds: `npm run build`
- [ ] No build errors
- [ ] dist/ folder created
- [ ] dist/index.html exists
- [ ] No size warnings (unless acceptable)

### Preview Test
- [ ] Preview succeeds: `npm run preview`
- [ ] App loads at http://localhost:4173
- [ ] Functionality works same as dev
- [ ] No console errors
- [ ] Stop server: Ctrl+C

---

## 🔐 SECURITY (Phase 3)

### Credentials Review
- [ ] `.env` NOT committed to git
- [ ] No Firebase Admin Keys in client code
- [ ] No Yoco secret keys (sk_*) anywhere in client
- [ ] All secrets in `.env` file only
- [ ] `.env.example` has NO real credentials

### Git Configuration
- [ ] `.gitignore` includes `.env`
- [ ] `.gitignore` includes `.env.*`
- [ ] Run: `git status` to verify `.env` not staged
- [ ] Run: `git ls-files | grep .env` returns nothing

### Code Review Security
- [ ] No console.log with sensitive data
- [ ] Error messages don't expose details
- [ ] Input validation implemented
- [ ] CORS configured if needed
- [ ] No eval() or other dangerous functions

---

## 🔥 FIREBASE SETUP (Phase 4)

### Prerequisites
- [ ] Firebase CLI installed: `firebase --version`
- [ ] Firebase CLI logged in: `firebase login`
- [ ] Correct project selected: `firebase use nexus-pos-75de4`

### Cloud Functions Setup
- [ ] `functions/` directory exists
- [ ] `functions/src/yocoPayment.js` copied
- [ ] `functions/src/index.js` updated with exports
- [ ] `functions/package.json` includes axios dependency
- [ ] Dependencies installed: `cd functions && npm install && cd ..`

### Environment Variables - Cloud Functions
- [ ] Yoco secret key set: `firebase functions:config:set yoco.secret_key="sk_..."`
- [ ] App URL set: `firebase functions:config:set app.url="https://yourdomain.com"`
- [ ] Config verified: `firebase functions:config:get`

### Functions Deployment
- [ ] Run: `firebase deploy --only functions`
- [ ] No deployment errors
- [ ] Functions visible in Firebase Console
- [ ] Logs accessible: `firebase functions:log`

### Functions Testing (with emulator)
- [ ] Emulator installed: `firebase init emulators`
- [ ] Emulator starts: `firebase emulators:start`
- [ ] Dev server connects to local emulator
- [ ] Test payment flow works
- [ ] Emulator logs show activity

---

## 💳 PAYMENT INTEGRATION (Phase 5)

### Service Files
- [ ] `src/services/yoco.js` copied from provided file
- [ ] Service imports httpsCallable from firebase/functions
- [ ] Service has createPayment function
- [ ] Service has getPaymentStatus function
- [ ] No direct Yoco API calls in service

### Component Integration
- [ ] Components import yoco service correctly
- [ ] Payment buttons call createPayment function
- [ ] Loading states shown during payment
- [ ] Error handling implemented
- [ ] Success messages shown after payment

### Payment Flow Testing (Local)
- [ ] Firebase emulator running
- [ ] Dev server running
- [ ] Navigate to payment page
- [ ] Create test payment
- [ ] Cloud Function logs show payment attempt
- [ ] Response received correctly
- [ ] Error handling works if payment fails

### Firestore Setup
- [ ] Firestore enabled in Firebase Console
- [ ] Collections created: transactions
- [ ] Security rules configured
- [ ] Rules tested: only users can see their transactions
- [ ] Rules test: anonymous access denied

---

## 📱 TESTING (Phase 6)

### Responsive Design
- [ ] Works on desktop (full width)
- [ ] Works on tablet (landscape/portrait)
- [ ] Works on mobile (375px width)
- [ ] Touch inputs work on mobile
- [ ] Layout doesn't break at any size
- [ ] Text is readable on all sizes

### Browser Compatibility
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] No console errors in any browser

### Functionality Testing
- [ ] Auth login works
- [ ] Auth logout works
- [ ] Can navigate between pages
- [ ] Payment page loads
- [ ] Payment form validation works
- [ ] Transaction history shows
- [ ] Data persists on refresh

### Performance
- [ ] App loads in under 3 seconds (first load)
- [ ] Pages load in under 1 second (subsequent)
- [ ] No lag when scrolling
- [ ] Animations are smooth
- [ ] Memory usage reasonable
- [ ] No memory leaks detected

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid input shows error message
- [ ] Payment errors show user-friendly message
- [ ] Server errors don't expose details
- [ ] User can recover from errors

---

## 📊 MONITORING & LOGGING (Phase 7)

### Firebase Console
- [ ] Access Firebase Console for project
- [ ] Firestore data visible
- [ ] Authentication users visible
- [ ] Cloud Functions deployed
- [ ] Storage configured

### Logging
- [ ] Cloud Function logs viewable
- [ ] Application errors logged
- [ ] Payment transactions logged
- [ ] User actions auditable
- [ ] No sensitive data in logs

### Alerts (Optional)
- [ ] Function error alerts configured
- [ ] Database quota alerts configured
- [ ] Authentication issue alerts configured
- [ ] Payment failure alerts configured

---

## 🚀 DEPLOYMENT - FIREBASE HOSTING (Phase 8)

### Pre-Deployment
- [ ] All changes committed to git
- [ ] Feature branch merged to main
- [ ] Build succeeds: `npm run build`
- [ ] No warnings in build output
- [ ] dist/ folder cleaned and rebuilt

### Deployment
- [ ] Run: `firebase deploy`
- [ ] Hosting deployed successfully
- [ ] Cloud Functions deployed successfully
- [ ] No deployment errors

### Post-Deployment
- [ ] Visit https://yourdomain.com
- [ ] App loads without errors
- [ ] All functionality works
- [ ] Payment flow works end-to-end
- [ ] No console errors in production

### Monitoring
- [ ] Cloud Function logs monitored
- [ ] Errors reported and fixed quickly
- [ ] User feedback collected
- [ ] Performance metrics reviewed

---

## 🚀 DEPLOYMENT - NETLIFY (Alternative - Phase 8)

### Pre-Deployment
- [ ] Build succeeds: `npm run build`
- [ ] dist/ folder exists
- [ ] No build errors or warnings

### Deployment
- [ ] Connect repository to Netlify
- [ ] Configure build command: `npm run build`
- [ ] Configure publish directory: `dist`
- [ ] Deploy site
- [ ] Custom domain configured

### Environment Variables (Netlify)
- [ ] Add all VITE_* variables in Netlify dashboard
- [ ] Rebuild site with variables
- [ ] Verify environment variables loaded

### Post-Deployment
- [ ] Visit https://yourdomain.com
- [ ] App loads without errors
- [ ] All functionality works

---

## 🚀 DEPLOYMENT - VERCEL (Alternative - Phase 8)

### Pre-Deployment
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Build succeeds locally: `npm run build`

### Deployment
- [ ] Run: `vercel --prod`
- [ ] Follow prompts to setup project
- [ ] Environment variables configured
- [ ] Custom domain configured

### Post-Deployment
- [ ] Visit https://yourdomain.com
- [ ] App loads without errors
- [ ] All functionality works

---

## ✅ PRODUCTION CHECKLIST

### Before Going Live
- [ ] All checklist items above completed
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] User acceptance testing completed
- [ ] Documentation up to date

### Security Verification
- [ ] No secrets in git repository
- [ ] Firebase security rules enabled
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Error messages don't expose details
- [ ] Input validation in place
- [ ] Rate limiting configured (if needed)

### Documentation
- [ ] README.md complete and current
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] FIREBASE_SETUP_GUIDE.md reviewed
- [ ] Team trained on deployment process
- [ ] Runbooks created for common issues

### Monitoring & Support
- [ ] Logging configured
- [ ] Alerts configured
- [ ] Error tracking enabled (Sentry/similar)
- [ ] Performance monitoring enabled
- [ ] Support process documented
- [ ] Incident response plan ready

### Backup & Recovery
- [ ] Database backup strategy documented
- [ ] Rollback plan documented
- [ ] Disaster recovery plan documented
- [ ] Regular backup schedule established

---

## 🎯 GO-LIVE CHECKLIST

### 24 Hours Before Launch
- [ ] Final testing completed
- [ ] All stakeholders notified
- [ ] Support team briefed
- [ ] Rollback plan reviewed
- [ ] Monitoring dashboard ready

### Launch Day
- [ ] Deployment completed without errors
- [ ] Live site verified working
- [ ] Team monitoring logs
- [ ] Users notified of launch
- [ ] Support team on standby

### Post-Launch (First Week)
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Document lessons learned

---

## 📝 SIGN-OFF

- [ ] Project Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______

---

## 📞 Contacts

- **Project Manager**: [Name/Email]
- **Lead Developer**: [Name/Email]
- **DevOps Engineer**: [Name/Email]
- **Firebase Support**: https://firebase.google.com/support
- **Emergency Contact**: [Name/Phone]

---

## 📋 Deployment Notes

Use this space to document any deviations or special notes:

```
Date: _______________
Deployed By: _______________
Version: _______________
Environment: _______________
Notes:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

**Status**: ⬜ Not Started | 🟨 In Progress | 🟩 Complete

**Overall Progress**: [__________] %

**Last Updated**: _______________

---

Print this checklist and check items off as you complete each phase. Keep a copy for your records.

Good luck with your deployment! 🚀
