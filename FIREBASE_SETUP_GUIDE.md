# Firebase Cloud Functions Setup Guide

## Overview

This guide covers setting up Firebase Cloud Functions for secure Yoco payment processing in the NEXUS POS application.

## Why Cloud Functions?

The secret key (sk_*) for Yoco must NEVER be exposed in the client application. Cloud Functions provide:
- Secure server-side processing
- Secret key protection
- Authentication enforcement
- Audit logging
- Scalability

## Prerequisites

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Authenticate with Firebase
firebase login
```

## Project Setup

### 1. Initialize Cloud Functions (if not already done)

```bash
# In your project root
firebase init functions

# Choose existing project: nexus-pos-75de4
# Choose JavaScript
# Install dependencies: yes
```

### 2. Install Dependencies

```bash
cd functions
npm install axios
npm install --save-dev firebase-functions firebase-admin
```

### 3. Deploy the Yoco Payment Function

```bash
# Copy yocoPayment.js to functions/src/yocoPayment.js
cp yocoPayment.js functions/src/yocoPayment.js

# Update functions/src/index.js to include:
const yoco = require('./yocoPayment');
exports.createYocoPayment = yoco.createYocoPayment;
exports.getYocoPaymentStatus = yoco.getYocoPaymentStatus;
exports.yocoWebhook = yoco.yocoWebhook;
```

### 4. Set Environment Variables

```bash
# In Firebase Console:
# 1. Go to: Cloud Functions
# 2. Click your function
# 3. Edit → Runtime environment variables

# Or via CLI:
firebase functions:config:set yoco.secret_key="sk_live_XXXXX"
firebase functions:config:set app.url="https://yourdomain.com"

# To view current config:
firebase functions:config:get
```

### 5. Deploy to Firebase

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:createYocoPayment

# View logs
firebase functions:log
```

## Local Development

### 1. Install Firebase Emulator Suite

```bash
firebase init emulators
# Select: Functions, Firestore
```

### 2. Start Emulator

```bash
firebase emulators:start
```

### 3. Update Client Configuration

The client automatically detects local emulator (see yoco.js - connectFunctionsEmulator).

### 4. Test Payment Flow

```javascript
// In your app, call:
import { createPayment } from '@/services/yoco';

const response = await createPayment({
  amount: 1000, // R10.00
  currency: 'ZAR',
  description: 'Test Payment',
  metadata: { orderId: 'TEST-001' }
});

if (response.success) {
  window.location.href = response.data.checkoutUrl;
}
```

## Environment Variables Reference

### Development (local emulator)
```
VITE_FIREBASE_PROJECT_ID=nexus-pos-75de4
VITE_YOCO_PUBLIC_KEY=pk_live_0df1babdenJZJGq560a4
VITE_FIREBASE_FUNCTION_URL=http://localhost:5001/nexus-pos-75de4/us-central1
```

### Production (Firebase Cloud)
```
VITE_FIREBASE_PROJECT_ID=nexus-pos-75de4
VITE_YOCO_PUBLIC_KEY=pk_live_0df1babdenJZJGq560a4
VITE_FIREBASE_FUNCTION_URL=https://us-central1-nexus-pos-75de4.cloudfunctions.net
```

## Firestore Security Rules

Add these rules to firestore.rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read their own transactions
    match /transactions/{transactionId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.userId;
    }
    
    // Admin collection (for webhook updates)
    match /admin/{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Yoco Webhook Configuration

1. Log in to Yoco Dashboard
2. Go to: Settings → Webhooks
3. Add new webhook:
   - URL: `https://your-domain.com/yocoWebhook`
   - Or: `https://us-central1-nexus-pos-75de4.cloudfunctions.net/yocoWebhook`
4. Select events: "Payment Completed", "Payment Failed"
5. Save

## Monitoring and Debugging

### View Cloud Function Logs
```bash
firebase functions:log
# Or in Firebase Console: Functions → Logs
```

### Debug Payment Issues

1. Check Cloud Function logs for errors
2. Verify Yoco API key is correct
3. Confirm Firestore security rules allow operations
4. Test with Yoco test mode (if available)

## Production Checklist

- [ ] Environment variables set in Firebase Console
- [ ] Cloud Functions deployed successfully
- [ ] Firestore security rules configured
- [ ] Webhook URL configured in Yoco Dashboard
- [ ] Error logging and monitoring in place
- [ ] Load testing completed
- [ ] Backup and recovery plan documented
- [ ] SSL certificate valid for domain
- [ ] Rate limiting configured if needed

## Security Best Practices

1. **Never expose secret keys**: All sk_* keys remain server-side
2. **Authenticate requests**: Cloud Functions verify Firebase authentication
3. **Log transactions**: All payments logged in Firestore
4. **Validate input**: Functions validate all input data
5. **Handle errors securely**: Error messages don't expose sensitive info
6. **Use HTTPS**: Always use HTTPS for webhooks
7. **Verify webhooks**: Implement signature verification for production

## Troubleshooting

### "YOCO_SECRET_KEY not configured"
- Check Cloud Functions environment variables
- Re-deploy functions: `firebase deploy --only functions`

### "User must be authenticated"
- Ensure user is logged in before calling function
- Check Firebase auth is initialized

### Webhook not receiving updates
- Verify webhook URL in Yoco Dashboard
- Check Cloud Functions are deployed
- Review Cloud Function logs

### Function timeout
- Increase timeout in firebase.json
- Check Yoco API connectivity
- Optimize function code

## Support

- Firebase Documentation: https://firebase.google.com/docs/functions
- Yoco API Documentation: https://developer.yoco.com
- Firebase Emulator: https://firebase.google.com/docs/emulator-suite
