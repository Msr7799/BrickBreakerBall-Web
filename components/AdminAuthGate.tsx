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

function firebaseMessage(code: string, ar: boolean) {
  if (code === "auth/popup-closed-by-user") {
    return ar ? "أُغلقت نافذة تسجيل الدخول قبل الإكمال." : "The sign-in window was closed.";
  }
  if (code === "auth/popup-blocked") {
    return ar
      ? "المتصفح منع نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة وحاول مجددًا."
      : "The browser blocked the sign-in popup. Allow popups and try again.";
  }
  if (code === "auth/unauthorized-domain") {
    return ar
      ? "هذا النطاق غير مضاف إلى Authorized domains في Firebase."
      : "This domain is not listed in Firebase Authorized domains.";
  }
  return ar ? "تعذر تسجيل الدخول. حاول مرة أخرى." : "Sign-in failed. Please try again.";
}

export default function AdminAuthGate({
  lang,
}: {
  lang: Lang;
}) {
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
              ? "أضف إعدادات Firebase وبريد الأدمن أو UID داخل ملف .env.local، ثم أعد البناء."
              : "Add the Firebase settings and an admin email or UID to .env.local, then rebuild."}
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
          {error && (
            <div className="admin-auth-error" role="alert">
              {error}
            </div>
          )}
          <div className="admin-auth-actions">
            {user ? (
              <button type="button" onClick={logout}>
                {ar ? "تسجيل الخروج" : "Sign out"}
              </button>
            ) : (
              <button type="button" className="primary" onClick={login} disabled={submitting}>
                <span className="google-g">G</span>
                {submitting
                  ? ar
                    ? "جارٍ فتح Google…"
                    : "Opening Google…"
                  : ar
                    ? "الدخول باستخدام Google"
                    : "Continue with Google"}
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
        <button type="button" onClick={logout}>
          {ar ? "خروج" : "Sign out"}
        </button>
      </div>
      <main>
        <VolleyLevelEditor lang={lang} />
      </main>
    </>
  );
}
