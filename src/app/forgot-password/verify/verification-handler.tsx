"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getIdToken, isSignInWithEmailLink, signInWithEmailLink, signOut } from "firebase/auth";
import styles from "../../verify-email/verify-email.module.css";
import { firebaseClientConfig } from "@/lib/firebase-client-config";

type ViewState = "working" | "email" | "success" | "expired" | "error";

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

function firebaseEmailLink(auth: ReturnType<typeof getAuth>) {
  const candidates: string[] = [window.location.href];
  const current = new URL(window.location.href);

  if (current.hash.length > 1) {
    const hash = current.hash.slice(1);
    candidates.push(hash.startsWith("http") ? hash : `${current.origin}${current.pathname}?${hash.replace(/^\?/, "")}`);
  }

  for (const source of [...candidates]) {
    try {
      const parsed = new URL(source, window.location.origin);
      for (const key of ["link", "url", "continueUrl", "continue_url"]) {
        const value = parsed.searchParams.get(key);
        if (!value) continue;
        let decoded = value;
        for (let index = 0; index < 2; index += 1) {
          try {
            decoded = decodeURIComponent(decoded);
          } catch {
            break;
          }
        }
        candidates.push(decoded);
      }
    } catch {
      // Ignore malformed redirect candidates.
    }
  }

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate, window.location.origin);
      if (isSignInWithEmailLink(auth, parsed.toString())) return parsed.toString();

      const mode = parsed.searchParams.get("mode");
      const oobCode = parsed.searchParams.get("oobCode");
      const apiKey = parsed.searchParams.get("apiKey") || firebaseClientConfig.apiKey;
      if (mode === "signIn" && oobCode && apiKey) {
        const restored = new URL(window.location.origin + window.location.pathname);
        restored.searchParams.set("apiKey", apiKey);
        restored.searchParams.set("mode", mode);
        restored.searchParams.set("oobCode", oobCode);
        return restored.toString();
      }
    } catch {
      // Try the next possible Firebase redirect URL.
    }
  }

  return null;
}

function apiErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = apiErrorMessage(item);
      if (found) return found;
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      const found = apiErrorMessage(item);
      if (found) return found;
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
    const base = await apiBaseUrl();
    const statusResponse = await fetch(`${base}/auth/password-reset/firebase/${encodeURIComponent(id)}/status/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (statusResponse.ok) {
      const current = (await statusResponse.json()) as { status?: string; client_type?: string };
      setClientType(current.client_type || type);
      if (current.status === "EMAIL_VERIFIED" || current.status === "COMPLETED") {
        setState("success");
        setMessage(current.status === "COMPLETED"
          ? "Your password has already been updated. You can return to Offsay and log in."
          : "Your email is verified. Return to the device where you started the reset to choose a new password.");
        return;
      }
      if (current.status === "CANCELLED") {
        throw new Error("This reset request was replaced by a newer one. Open the latest Offsay email, or start again.");
      }
      if (current.status === "EXPIRED") {
        throw new Error("This password-reset link has expired. Return to Offsay and request a new link.");
      }
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);
    const auth = getAuth(app);
    const emailLink = firebaseEmailLink(auth);
    if (!emailLink) throw new Error("This password-reset link is incomplete or has already been used. Request one new link and open the latest email.");
    const credential = await signInWithEmailLink(auth, address.trim().toLowerCase(), emailLink);
    const idToken = await getIdToken(credential.user, true);
    const response = await fetch(`${base}/auth/password-reset/firebase/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ request_id: id, firebase_id_token: idToken }),
    });
    const data = (await response.json()) as { detail?: string; status?: string; client_type?: string; [key: string]: unknown };
    if (!response.ok) {
      const recoveryResponse = await fetch(`${base}/auth/password-reset/firebase/${encodeURIComponent(id)}/status/`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (recoveryResponse.ok) {
        const recovered = (await recoveryResponse.json()) as { status?: string; client_type?: string };
        if (recovered.status === "EMAIL_VERIFIED" || recovered.status === "COMPLETED") {
          setClientType(recovered.client_type || type);
          localStorage.removeItem(`offsay_password_reset_email_${id}`);
          await signOut(auth);
          setState("success");
          setMessage(recovered.status === "COMPLETED"
            ? "Your password has already been updated. You can return to Offsay and log in."
            : "Your email is verified. Return to the device where you started the reset to choose a new password.");
          return;
        }
      }
      throw new Error(apiErrorMessage(data) || "Offsay could not verify this reset link.");
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
