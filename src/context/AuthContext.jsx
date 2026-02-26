// src/context/AuthContext.jsx
// Manages user authentication state across the entire app

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// Create the context
const AuthContext = createContext(null);

// Custom hook — use this in any component: const { user } = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

// The provider wraps your whole app and makes auth available everywhere
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Current user object
  const [userDoc, setUserDoc] = useState(null); // Firestore user profile
  const [loading, setLoading] = useState(true); // Auth still loading?
  const [error, setError] = useState(null); // Auth errors

  // ─── Register a new user ────────────────────────────────────────
  const register = async (email, password, businessName, displayName) => {
    setError(null);
    try {
      // Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(cred.user, { displayName });

      // Create Firestore document for this user (their "tenant" profile)
      const tenantId = cred.user.uid; // Each user IS their own tenant

      const userProfile = {
        uid: cred.user.uid,
        tenantId,
        displayName,
        email,
        businessName: businessName || displayName,
        role: "admin", // First user of a tenant is always admin
        plan: "starter", // Default plan
        theme: "dark",
        branding: {
          primaryColor: "#c9a84c",
          logoUrl: null,
          businessName: businessName || displayName,
          vatNumber: "",
          address: "",
          phone: "",
          email: email,
          tcText:
            "By signing, I agree to the terms and conditions of this transaction.",
          vatEnabled: true,
          vatRate: 15,
          currency: "ZAR",
          currencySymbol: "R",
        },
        gateways: {
          yoco: {
            enabled: false,
            publicKey: "",
            secretKey: "",
            linkUrl: "https://payments.yoco.com/api/checkouts",
          },
          stripe: { enabled: false, publicKey: "", secretKey: "" },
          mpesa: {
            enabled: false,
            consumerKey: "",
            consumerSecret: "",
            shortcode: "",
          },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "tenants", tenantId), userProfile);
      setUserDoc(userProfile);

      return cred.user;
    } catch (err) {
      setError(friendlyError(err.code));
      throw err;
    }
  };

  // ─── Log in existing user ────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      setError(friendlyError(err.code));
      throw err;
    }
  };

  // ─── Log out ─────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUserDoc(null);
  };

  // ─── Send password reset email ───────────────────────────────────
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // ─── Listen for auth state changes (runs on app start) ──────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load their tenant profile from Firestore
        try {
          const snap = await getDoc(doc(db, "tenants", firebaseUser.uid));
          if (snap.exists()) setUserDoc(snap.data());
        } catch {
          // If no profile yet, it will be created on next login
        }
      } else {
        setUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  // ─── Helper: human-readable error messages ───────────────────────
  const friendlyError = (code) => {
    const messages = {
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait and try again.",
      "auth/network-request-failed": "Network error. Check your connection.",
    };
    return messages[code] || "Something went wrong. Please try again.";
  };

  const value = {
    user,
    userDoc,
    loading,
    error,
    setError,
    register,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
