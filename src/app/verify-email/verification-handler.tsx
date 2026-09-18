"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApp, getApps, initializeApp } from "firebase/app";
import { applyActionCode, getAuth } from "firebase/auth";
import styles from "./verify-email.module.css";
import { firebaseClientConfig } from "@/lib/firebase-client-config";

type ViewState = "working" | "success" | "handoff" | "expired" | "error";

async function apiBaseUrl() {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.offsay.in")
    .replace(/\/$/, "");
  return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
}

function verificationIdFrom(params: URLSearchParams) {
  const visited = new Set<string>();
  const inspect = (value: string | null, depth = 0): string | null => {
    if (!value || depth > 5 || visited.has(value)) return null;
    visited.add(value);
    let decoded = value;
    try {
      decoded = decodeURIComponent(value);
    } catch {
      // The value may already be decoded.
    }
    const plainMatch = decoded.match(
      /(?:^|[?#&])verification_id=([0-9a-f-]{36})(?:$|[&#])/i,
    );
    if (plainMatch) return plainMatch[1];
    try {
      const url = new URL(decoded, window.location.origin);
      const direct = url.searchParams.get("verification_id");
      if (direct) return direct;
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const fromHash = hash.get("verification_id");
      if (fromHash) return fromHash;
      for (const key of ["continueUrl", "continue_url", "link", "url"]) {
        const nested = inspect(url.searchParams.get(key), depth + 1);
        if (nested) return nested;
      }
    } catch {
      return null;
    }
    return decoded === value ? null : inspect(decoded, depth + 1);
  };

  const direct = params.get("verification_id");
  if (direct) return direct;
  const fromHash = inspect(window.location.hash);
  if (fromHash) return fromHash;
  for (const key of ["continueUrl", "continue_url", "link", "url"]) {
    const nested = inspect(params.get(key));
    if (nested) return nested;
  }
  return inspect(document.referrer);
}

export function EmailVerificationHandler() {
  const params = useSearchParams();
  const started = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [retryIn, setRetryIn] = useState(0);
  const [state, setState] = useState<ViewState>("working");
  const [message, setMessage] = useState("We are securely confirming your email address.");
  const [merchant, setMerchant] = useState(false);
  const portalUrl = (process.env.NEXT_PUBLIC_PORTAL_URL || "https://merchant.offsay.in").replace(/\/$/, "");

  useEffect(() => {
    if (retryIn <= 0) return;
    const timer = window.setTimeout(() => setRetryIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [retryIn]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const verify = async () => {
      const verificationId = verificationIdFrom(params);
      const oobCode = params.get("oobCode");
      const mode = params.get("mode");
      let invalidAction = false;
      if (oobCode && mode !== "verifyEmail") {
        setState("error");
        setMessage("This verification link is incomplete or invalid.");
        return;
      }
      // With Firebase's default email handler, Firebase consumes the action
      // code first and redirects here with only the Offsay verification ID.
      // A custom action handler sends mode/oobCode directly, so apply it here.
      if (oobCode) {
        try {
          const app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);
          await applyActionCode(getAuth(app), oobCode);
        } catch (error) {
          const code = (error as { code?: string }).code || "";
          if (
            !code.includes("expired-action-code") &&
            !code.includes("invalid-action-code")
          ) {
            setState("error");
            setMessage(
              error instanceof Error ? error.message : "Email verification failed.",
            );
            return;
          }
          invalidAction = true;
        }
      }

      // Firebase's hosted handler can consume a valid code and then open the
      // configured Continue URL without forwarding Offsay's challenge ID.
      // Do not report a false verification failure. The app/portal must now
      // perform the authoritative Firebase-to-Django reconciliation.
      if (!verificationId) {
        if (invalidAction) {
          setState("error");
          setMessage("This email link is expired or already used. Try logging in if you previously verified, or open the latest verification email.");
          return;
        }
        setState("handoff");
        setMessage(
          "Return to the Offsay app and tap ‘I’ve verified my email’. Merchants can continue to the login page, where Offsay will check and activate the verified account.",
        );
        return;
      }
      try {
        const base = await apiBaseUrl();
        const response = await fetch(
          `${base}/auth/email-verification/${verificationId}/confirm/`,
          { method: "POST", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) },
        );
        const data = (await response.json()) as {
          purpose?: string;
          resolved_status?: string;
          detail?: string;
          error?: { details?: { detail?: string } };
        };
        if (!response.ok || data.resolved_status !== "VERIFIED") {
          if (response.status === 410 || data.resolved_status === "EXPIRED") {
            setState("expired");
            setMessage("This registration session has expired. Please contact OffSay support to restart registration.");
            return;
          }
          if (response.status === 429 || response.status === 503) {
            const raw = response.headers.get("Retry-After") || "60";
            const seconds = Number(raw);
            const delay = Number.isFinite(seconds) ? seconds : (Date.parse(raw) - Date.now()) / 1000;
            setRetryIn(Math.max(1, Math.ceil(Number.isFinite(delay) ? delay : 60)));
          }
          const detail = data.detail || data.error?.details?.detail;
          throw new Error(
            response.status === 429
              ? "Too many verification checks. Your email may already be verified. Wait for the retry timer, then check again."
              : invalidAction && response.status === 409
                ? "This email link is expired or already used. Open the latest verification email, or try logging in if you previously verified."
                : detail || "OffSay could not confirm your email. Please try again; you do not need to register again.",
          );
        }
        const isMerchant = data.purpose === "MERCHANT_REGISTRATION";
        setMerchant(isMerchant);
        setState("success");
        setMessage(
          isMerchant
            ? "Your email is verified. Your business application is now waiting for review."
            : "Your email is verified. Return to the Offsay app to finish signing in.",
        );
      } catch (error) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "Offsay could not confirm this email.");
      }
    };
    void verify();
  }, [params, attempt]);

  return (
    <section className={styles.card}>
      <img src="/brand/offsay-icon.png" alt="Offsay" className={styles.logo} />
      <span
        className={`${styles.icon} ${
          state === "handoff" ? styles.working : styles[state]
        }`}
        aria-hidden="true"
      >
        {state === "working" ? "…" : state === "success" ? "✓" : state === "handoff" ? "→" : "!"}
      </span>
      <p className={styles.kicker}>SECURE EMAIL VERIFICATION</p>
      <h1>
        {state === "working"
          ? "Verifying your email"
          : state === "success"
            ? "Email verified"
            : state === "handoff"
              ? "Finish in Offsay"
            : state === "expired"
              ? "Link expired"
              : "Verification failed"}
      </h1>
      <p className={styles.message}>{message}</p>
      {state === "success" && (
        <a className={styles.action} href={merchant ? `${portalUrl}/login` : "/"}>
          {merchant ? "Open merchant login" : "Return to Offsay"}
        </a>
      )}
      {state === "handoff" && (
        <a className={styles.action} href={`${portalUrl}/login`}>
          Open merchant login
        </a>
      )}
      {state === "error" && (
        <button className={styles.action} disabled={retryIn > 0} onClick={() => {
          started.current = false;
          setState("working");
          setAttempt((value) => value + 1);
        }}>
          {retryIn > 0 ? `Try again in ${retryIn}s` : "Check verification again"}
        </button>
      )}
      {state === "expired" && (
        <p className={styles.help}>Contact offsay.official@gmail.com for registration assistance.</p>
      )}
    </section>
  );
}
