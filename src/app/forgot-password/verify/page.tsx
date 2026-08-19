import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordResetVerificationHandler } from "./verification-handler";
import styles from "../../verify-email/verify-email.module.css";

export const metadata: Metadata = {
  title: "Verify password reset",
  robots: { index: false, follow: false },
};

export default function PasswordResetVerificationPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<div className={styles.card}>Checking your secure link…</div>}>
        <PasswordResetVerificationHandler />
      </Suspense>
    </main>
  );
}
