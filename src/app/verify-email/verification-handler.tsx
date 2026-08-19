"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApp, getApps, initializeApp } from "firebase/app";
import { applyActionCode, getAuth } from "firebase/auth";
import styles from "./verify-email.module.css";
import { firebaseClientConfig } from "@/lib/firebase-client-config";

type ViewState = "working" | "success" | "handoff" | "expired" | "error";

async function apiBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (explicit) return explicit.endsWith("/api/v1") ? explicit : `${explicit}/api/v1`;
  const source =
    process.env.NEXT_PUBLIC_REMOTE_CONFIG_URL ||
    "https://raw.githubusercontent.com/offsayofficial-creator/offsay-config/main/config.json";
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) throw new Error("Offsay services are temporarily unavailable.");
  const config = (await response.json()) as { backendUrl?: string };
  if (!config.backendUrl) throw new Error("Offsay services are not configured.");
  return `${config.backendUrl.replace(/\/$/, "")}/api/v1`;
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
  const [state, setState] = useState<ViewState>("working");
  const [message, setMessage] = useState("We are securely confirming your email address.");
  const [merchant, setMerchant] = useState(false);
  const portalUrl = (process.env.NEXT_PUBLIC_PORTAL_URL || "https://offsayofficial-creator.github.io/offsay-config").replace(/\/$/, "");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const verify = async () => {
      const verificationId = verificationIdFrom(params);
      const oobCode = params.get("oobCode");
      const mode = params.get("mode");
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
        }
      }

      // Firebase's hosted handler can consume a valid code and then open the
      // configured Continue URL without forwarding Offsay's challenge ID.
      // Do not report a false verification failure. The app/portal must now
      // perform the authoritative Firebase-to-Django reconciliation.
      if (!verificationId) {
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
          { method: "POST", headers: { Accept: "application/json" } },
        );
        const data = (await response.json()) as {
          purpose?: string;
          resolved_status?: string;
          detail?: string;
        };
        if (!response.ok || data.resolved_status !== "VERIFIED") {
          if (response.status === 410 || data.resolved_status === "EXPIRED") {
            setState("expired");
            setMessage("This verification link has expired. Request a new link and try again.");
            return;
          }
          throw new Error(data.detail || "Offsay could not confirm this email.");
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
  }, [params]);

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
      {(state === "expired" || state === "error") && (
        <p className={styles.help}>Return to the app or merchant registration page to request another link.</p>
      )}
    </section>
  );
}
