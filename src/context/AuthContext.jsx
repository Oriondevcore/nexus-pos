// src/context/AuthContext.jsx
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

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const friendlyError = (code) => {
    const messages = {
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait and try again.",
      "auth/network-request-failed": "Network error. Check your connection.",
    };
    return messages[code] || "Something went wrong. Please try again.";
  };

  const register = async (email, password, businessName, displayName) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      const userProfile = {
        uid: cred.user.uid,
        tenantId: cred.user.uid,
        displayName,
        email,
        businessName: businessName || displayName,
        role: "admin",
        plan: "starter",
        theme: "dark",
        branding: {
          primaryColor: "#c9a84c",
          logoUrl: null,
          businessName: businessName || displayName,
          vatNumber: "",
          address: "",
          phone: "",
          email,
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
      await setDoc(doc(db, "tenants", cred.user.uid), userProfile);
      setUserDoc(userProfile);
      return cred.user;
    } catch (err) {
      setError(friendlyError(err.code));
      throw err;
    }
  };

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

  const logout = async () => {
    await signOut(auth);
    setUserDoc(null);
  };
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, "tenants", firebaseUser.uid));
          if (snap.exists()) setUserDoc(snap.data());
        } catch {
          /* loads on next action */
        }
      } else {
        setUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
