"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApp, getApps, initializeApp } from "firebase/app";
import { applyActionCode, getAuth } from "firebase/auth";
import styles from "./verify-email.module.css";

type ViewState = "working" | "success" | "expired" | "error";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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
  const direct = params.get("verification_id");
  if (direct) return direct;
  const continueUrl = params.get("continueUrl");
  if (!continueUrl) return null;
  try {
    return new URL(continueUrl).searchParams.get("verification_id");
  } catch {
    return null;
  }
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
      if (!verificationId || !oobCode || params.get("mode") !== "verifyEmail") {
        setState("error");
        setMessage("This verification link is incomplete or invalid.");
        return;
      }
      try {
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          throw new Error("Email verification is not configured.");
        }
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        await applyActionCode(getAuth(app), oobCode);
      } catch (error) {
        const code = (error as { code?: string }).code || "";
        if (!code.includes("expired-action-code") && !code.includes("invalid-action-code")) {
          setState("error");
          setMessage(error instanceof Error ? error.message : "Email verification failed.");
          return;
        }
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
      <span className={`${styles.icon} ${styles[state]}`} aria-hidden="true">
        {state === "working" ? "…" : state === "success" ? "✓" : "!"}
      </span>
      <p className={styles.kicker}>SECURE EMAIL VERIFICATION</p>
      <h1>
        {state === "working"
          ? "Verifying your email"
          : state === "success"
            ? "Email verified"
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
      {(state === "expired" || state === "error") && (
        <p className={styles.help}>Return to the app or merchant registration page to request another link.</p>
      )}
    </section>
  );
}
