# NEXUS POS - Quick Reference Guide

## First Time Setup

```bash
# 1. Clone repository
git clone https://github.com/Oriondevcore/nexus-pos.git
cd nexus-pos

# 2. Run setup script (Linux/Mac)
chmod +x setup-env.sh
./setup-env.sh

# OR (Windows)
setup-env.bat

# 3. Start development
npm run dev
# App is at http://localhost:5173
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting (if configured)
npm run lint

# Deploy to Firebase
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# View Firebase logs
firebase functions:log --follow
```

## Environment Variables

### Where to add them
- File: `.env` (or `.env.development`)
- Location: Project root
- Format: `KEY=value` (no spaces around =)

### Common Variables
```
# Firebase - required for auth
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...

# Yoco - for payments
VITE_YOCO_PUBLIC_KEY=pk_...

# Never add secret keys (sk_*) to .env
```

### Access in Code
```javascript
// ✓ Correct
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// ✗ Wrong (process.env not available in client)
const apiKey = process.env.VITE_FIREBASE_API_KEY;
```

## File Structure

```
nexus-pos/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase setup
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/
│   │   ├── QuickSale.jsx        # Main payment page
│   │   ├── Transactions.jsx     # Transaction history
│   │   └── ...
│   ├── services/
│   │   ├── yoco.js              # Payment service
│   │   └── transactions.js      # Transaction service
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── functions/
│   └── src/
│       └── yocoPayment.js       # Cloud Functions
├── .env.example                 # Template (commit to git)
├── .env                         # Local config (DO NOT commit)
├── package.json
└── README.md
```

## Common Issues

### "import.meta.env is undefined"
- Problem: .env not loaded
- Solution: Restart dev server with `npm run dev`

### "Firebase not initialized"
- Problem: Firebase config missing
- Solution: Check .env has VITE_FIREBASE_* variables

### "Cannot find module"
- Problem: Missing file or wrong import
- Solution: Check file path (case-sensitive on Linux/Mac)

### Payment fails
- Problem: Cloud Functions not deployed
- Solution: Run `firebase deploy --only functions`

## Security Reminders

1. **Never commit .env** - Use .env.example instead
2. **No secret keys in client** - Keep sk_* keys on server only
3. **Use Cloud Functions** - All Yoco API calls go through Cloud Functions
4. **HTTPS only** - Always use HTTPS in production
5. **Validate input** - Check all user input before processing

## Useful Links

- **Code Repository**: https://github.com/Oriondevcore/nexus-pos
- **Firebase Console**: https://console.firebase.google.com/project/nexus-pos-75de4
- **Yoco Dashboard**: https://dashboard.yoco.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Vite Docs**: https://vitejs.dev

## Deployment Flow

### To Firebase Hosting
```bash
npm run build              # Build optimized version
firebase deploy --only hosting  # Deploy static files
```

### To Cloud Functions
```bash
firebase deploy --only functions  # Deploy payment functions
firebase functions:log --follow  # Watch logs
```

### Full Deployment
```bash
firebase deploy  # Deploys everything (hosting + functions)
```

## Git Workflow

```bash
# Before committing
git status
git diff .env  # Make sure .env changes aren't staged

# Commit
git add .         # Add changes
git commit -m "description"
git push origin main

# Never do this:
git add .env      # WRONG - secret keys in git
git commit -m "add env"
```

## Testing Payment Flow

1. Start dev server: `npm run dev`
2. Navigate to Quick Sale page
3. Enter amount: 100 (R1.00)
4. Select payment method
5. Follow payment flow
6. Check transactions page for confirmation

## Monitoring

### Firebase Console
- https://console.firebase.google.com/project/nexus-pos-75de4
- Check: Functions logs, Firestore data, Authentication

### Local Logs
```bash
firebase functions:log --follow
```

### Browser Console
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

## Performance Tips

1. **Use lazy loading** for pages
2. **Optimize images** before uploading
3. **Cache API responses** where appropriate
4. **Monitor bundle size**: `npm run build`
5. **Use Chrome DevTools** for profiling

## Getting Help

1. Check DEPLOYMENT_GUIDE.md for setup issues
2. Check FIREBASE_SETUP_GUIDE.md for payment issues
3. Review Firebase logs: `firebase functions:log`
4. Check browser console for errors
5. Open GitHub issue with error details

## Key Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Yoco Support**: https://support.yoco.com
- **GitHub Issues**: https://github.com/Oriondevcore/nexus-pos/issues

---

**Last Updated**: February 2026
**Project**: NEXUS POS - Mobile Point of Sale
**Version**: Phase 2 (Deployment Ready)
