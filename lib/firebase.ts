import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDEKI8NXF769mgxuMGUH1stuUQKPPBVQkQ",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "brick-breaker-ball-8e4f5.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "brick-breaker-ball-8e4f5",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "brick-breaker-ball-8e4f5.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1090595999482",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:1090595999482:web:f957ece84abf9e075ac343",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-61EXQEER23",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

export const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: "select_account" });
