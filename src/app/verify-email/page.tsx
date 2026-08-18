import type { Metadata } from "next";
import { Suspense } from "react";
import { EmailVerificationHandler } from "./verification-handler";
import styles from "./verify-email.module.css";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<div className={styles.card}>Verifying your email…</div>}>
        <EmailVerificationHandler />
      </Suspense>
    </main>
  );
}
