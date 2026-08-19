"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getIdToken, isSignInWithEmailLink, signInWithEmailLink, signOut } from "firebase/auth";
import styles from "../../verify-email/verify-email.module.css";

type ViewState = "working" | "email" | "success" | "expired" | "error";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function apiBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (explicit) return explicit.endsWith("/api/v1") ? explicit : `${explicit}/api/v1`;
  const source = process.env.NEXT_PUBLIC_REMOTE_CONFIG_URL || "https://raw.githubusercontent.com/offsayofficial-creator/offsay-config/main/config.json";
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) throw new Error("Offsay services are temporarily unavailable.");
  const config = (await response.json()) as { backendUrl?: string };
  if (!config.backendUrl) throw new Error("Offsay services are not configured.");
  return `${config.backendUrl.replace(/\/$/, "")}/api/v1`;
}

function nestedParameter(params: URLSearchParams, name: string) {
  const direct = params.get(name);
  if (direct) return direct;
  for (const key of ["continueUrl", "continue_url", "link", "url"]) {
    const value = params.get(key);
    if (!value) continue;
    try {
      const nested = new URL(decodeURIComponent(value), window.location.origin);
      const found = nested.searchParams.get(name);
      if (found) return found;
    } catch {
      // Ignore malformed nested continuation URLs.
    }
  }
  return null;
}

export function PasswordResetVerificationHandler() {
  const params = useSearchParams();
  const started = useRef(false);
  const [state, setState] = useState<ViewState>("working");
  const [message, setMessage] = useState("We are securely checking your password-reset link.");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [clientType, setClientType] = useState("CUSTOMER_APP");
  const portalUrl = (process.env.NEXT_PUBLIC_PORTAL_URL || "https://offsayofficial-creator.github.io/offsay-config").replace(/\/$/, "");

  const finish = async (address: string, id = requestId, type = clientType) => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) throw new Error("Secure email verification is not configured.");
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    if (!isSignInWithEmailLink(auth, window.location.href)) throw new Error("This password-reset link is incomplete or has already been used.");
    const credential = await signInWithEmailLink(auth, address.trim().toLowerCase(), window.location.href);
    const idToken = await getIdToken(credential.user, true);
    const base = await apiBaseUrl();
    const response = await fetch(`${base}/auth/password-reset/firebase/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ request_id: id, firebase_id_token: idToken }),
    });
    const data = (await response.json()) as { detail?: string; status?: string; client_type?: string; [key: string]: unknown };
    if (!response.ok) {
      const detail = data.detail || Object.values(data).flat().find((value) => typeof value === "string");
      throw new Error(typeof detail === "string" ? detail : "Offsay could not verify this reset link.");
    }
    setClientType(data.client_type || type);
    localStorage.removeItem(`offsay_password_reset_email_${id}`);
    await signOut(auth);
    setState("success");
    setMessage("Your email is verified. Return to the device where you started the reset to choose a new password.");
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const id = nestedParameter(params, "request_id") || "";
    const type = nestedParameter(params, "client_type") || "CUSTOMER_APP";
    setRequestId(id);
    setClientType(type);
    if (!id) {
      setState("error");
      setMessage("This password-reset link is incomplete.");
      return;
    }
    const stored = localStorage.getItem(`offsay_password_reset_email_${id}`) || "";
    if (!stored) {
      setState("email");
      setMessage("Enter the same email address used to request this password reset.");
      return;
    }
    void finish(stored, id, type).catch((error: unknown) => {
      const text = error instanceof Error ? error.message : "Password-reset verification failed.";
      setState(text.toLowerCase().includes("expired") ? "expired" : "error");
      setMessage(text);
    });
  // The handler must run once for the exact email-link URL.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await finish(email);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Password-reset verification failed.";
      setState(text.toLowerCase().includes("expired") ? "expired" : "error");
      setMessage(text);
    } finally {
      setSubmitting(false);
    }
  };

  const isMerchant = clientType === "MERCHANT_PORTAL";
  const returnUrl = isMerchant ? `${portalUrl}/forgot-password?request_id=${encodeURIComponent(requestId)}` : `offsay://password-reset/${encodeURIComponent(requestId)}`;

  return (
    <section className={styles.card}>
      <img src="/brand/offsay-icon.png" alt="Offsay" className={styles.logo} />
      <span className={`${styles.icon} ${state === "working" || state === "email" ? styles.working : state === "success" ? styles.success : styles.error}`} aria-hidden="true">
        {state === "working" ? "…" : state === "success" ? "✓" : state === "email" ? "@" : "!"}
      </span>
      <p className={styles.kicker}>SECURE PASSWORD RECOVERY</p>
      <h1>{state === "working" ? "Checking your link" : state === "email" ? "Confirm your email" : state === "success" ? "Email verified" : state === "expired" ? "Link expired" : "Verification failed"}</h1>
      <p className={styles.message}>{message}</p>
      {state === "email" && (
        <form onSubmit={submitEmail} className={styles.form}>
          <label htmlFor="reset-email">Email address</label>
          <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required autoFocus />
          <button className={styles.action} type="submit" disabled={submitting}>{submitting ? "Verifying…" : "Verify securely"}</button>
        </form>
      )}
      {state === "success" && <a className={styles.action} href={returnUrl}>{isMerchant ? "Return to merchant portal" : "Return to Offsay app"}</a>}
      {(state === "expired" || state === "error") && <p className={styles.help}>Return to the original app or browser and request a new password-reset link.</p>}
    </section>
  );
}
