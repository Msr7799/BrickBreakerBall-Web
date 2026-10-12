"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { firebaseAuth, googleAuthProvider, isFirebaseConfigured } from "@/lib/firebase";
import type { Lang } from "@/lib/site";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL ?? "alromaihi2224@gmail.com"
).trim().toLowerCase();

const VolleyLevelEditor = dynamic(() => import("@/components/VolleyLevelEditor"), {
  ssr: false,
  loading: () => null,
});

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.7 4.7 0 0 1-2 3v2.8h3.5c2-1.9 3.2-4.6 3.2-7.9Z" />
      <path fill="#34A853" d="M12 22c2.9 0 5.3-1 7-2.6l-3.5-2.8a6.4 6.4 0 0 1-9.5-3.4H2.4V16A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6 13.2a6 6 0 0 1 0-3.9V6.5H2.4a10 10 0 0 0 0 9.5L6 13.2Z" />
      <path fill="#EA4335" d="M12 5.5c1.7 0 3.2.6 4.4 1.7l3.3-3.3A10 10 0 0 0 2.4 6.5L6 9.3A6 6 0 0 1 12 5.5Z" />
    </svg>
  );
}

function firebaseMessage(code: string, ar: boolean) {
  const messages: Record<string, [string, string]> = {
    "auth/popup-closed-by-user": ["أُغلقت نافذة تسجيل الدخول قبل الإكمال.", "The sign-in window was closed."],
    "auth/popup-blocked": [
      "المتصفح منع نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة وحاول مجددًا.",
      "The browser blocked the sign-in popup. Allow popups and try again.",
    ],
    "auth/unauthorized-domain": [
      "هذا النطاق غير مضاف إلى Authorized domains في Firebase.",
      "This domain is not listed in Firebase Authorized domains.",
    ],
    "auth/operation-not-allowed": [
      "تسجيل الدخول بواسطة Google غير مفعّل في Firebase Authentication.",
      "Google sign-in is not enabled in Firebase Authentication.",
    ],
    "auth/invalid-api-key": [
      "مفتاح Firebase Web غير صالح. حدّث NEXT_PUBLIC_FIREBASE_API_KEY ثم أعد النشر.",
      "The Firebase Web API key is invalid. Update NEXT_PUBLIC_FIREBASE_API_KEY and redeploy.",
    ],
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.": [
      "مفتاح Firebase Web غير صالح. حدّث NEXT_PUBLIC_FIREBASE_API_KEY ثم أعد النشر.",
      "The Firebase Web API key is invalid. Update NEXT_PUBLIC_FIREBASE_API_KEY and redeploy.",
    ],
    "auth/network-request-failed": [
      "تعذر الاتصال بخدمة Firebase. تحقق من الاتصال أو مانع الإعلانات ثم حاول مجددًا.",
      "Firebase could not be reached. Check the network or ad blocker and try again.",
    ],
    "auth/account-exists-with-different-credential": [
      "هذا البريد مرتبط بطريقة دخول أخرى في Firebase.",
      "This email is linked to another Firebase sign-in method.",
    ],
  };
  const message = messages[code];
  const fallback = ar
    ? "تعذر تسجيل الدخول. راجع رمز Firebase الظاهر أدناه."
    : "Sign-in failed. Check the Firebase code shown below.";
  return `${message ? message[ar ? 0 : 1] : fallback}${code ? ` (${code})` : ""}`;
}

export default function AdminAuthGate({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const isAdmin = Boolean(
    user?.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL,
  );

  const login = async () => {
    if (!firebaseAuth) return;
    setSubmitting(true);
    setError("");
    try {
      await signInWithPopup(firebaseAuth, googleAuthProvider);
    } catch (caught) {
      const code =
        typeof caught === "object" && caught && "code" in caught ? String(caught.code) : "";
      setError(firebaseMessage(code, ar));
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    if (!firebaseAuth) return;
    setError("");
    await signOut(firebaseAuth);
  };

  if (loading) {
    return (
      <main className="admin-auth-shell" aria-busy="true">
        <div className="admin-auth-loader" />
        <p>{ar ? "جارٍ التحقق من صلاحية الأدمن…" : "Checking admin access…"}</p>
      </main>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <main className="admin-auth-shell">
        <section className="admin-auth-card admin-auth-warning">
          <span className="admin-auth-mark">!</span>
          <p className="admin-auth-kicker">FIREBASE ADMIN</p>
          <h1>{ar ? "إعداد الأدمن غير مكتمل" : "Admin setup is incomplete"}</h1>
          <p>
            {ar
              ? "أضف إعدادات Firebase وبريد الأدمن داخل ملف .env.local، ثم أعد البناء."
              : "Add the Firebase settings and admin email to .env.local, then rebuild."}
          </p>
        </section>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="admin-auth-shell">
        <section className="admin-auth-card">
          <img src="/game/site/branding/app-icon.png" alt="" className="admin-auth-logo" />
          <p className="admin-auth-kicker">VOLLEY WORKSHOP</p>
          <h1>{ar ? "دخول الأدمن" : "Admin sign in"}</h1>
          <p>
            {user
              ? ar
                ? `الحساب ${user.email ?? user.uid} ليس ضمن قائمة الأدمن.`
                : `${user.email ?? user.uid} is not on the admin allowlist.`
              : ar
                ? "سجّل الدخول بحساب Google المصرّح له لفتح محرر المراحل."
                : "Use an authorized Google account to open the level editor."}
          </p>
          {error && <div className="admin-auth-error" role="alert">{error}</div>}
          <div className="admin-auth-actions">
            {user ? (
              <button type="button" onClick={logout}>{ar ? "تسجيل الخروج" : "Sign out"}</button>
            ) : (
              <button type="button" className="primary" onClick={login} disabled={submitting}>
                <GoogleIcon />
                {submitting
                  ? ar ? "جارٍ فتح Google…" : "Opening Google…"
                  : ar ? "الدخول باستخدام Google" : "Continue with Google"}
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="admin-session-bar" dir={ar ? "rtl" : "ltr"}>
        <span>{ar ? "وضع الأدمن" : "Admin mode"}</span>
        <b>{user.email}</b>
        <button type="button" onClick={logout}>{ar ? "خروج" : "Sign out"}</button>
      </div>
      <main><VolleyLevelEditor lang={lang} /></main>
    </>
  );
}
