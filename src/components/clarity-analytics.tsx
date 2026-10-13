"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const consentKey = "offsay-analytics-consent";
type Choice = "accepted" | "rejected" | null;
type Clarity = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global { interface Window { clarity?: Clarity; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; offsayGtmLoaded?: boolean } }

export function ClarityAnalytics({ projectId, enabled, gtmId = "" }: { projectId: string; enabled: boolean; gtmId?: string }) {
  const validClarity = /^[a-z0-9]+$/i.test(projectId);
  const validGtm = /^GTM-[A-Z0-9]+$/.test(gtmId);
  const pathname = usePathname();
  const excluded = /^\/(verify-email|forgot-password)(\/|$)/.test(pathname);
  useEffect(() => {
    if (excluded && (window.clarity || window.offsayGtmLoaded)) {
      window.clarity?.("consentv2", { analytics_Storage: "denied", ad_Storage: "denied" });
      window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      window.location.reload();
    }
  }, [excluded]);
  if (!enabled || (!validClarity && !validGtm) || excluded) return null;
  return <ConsentControls projectId={validClarity ? projectId : ""} gtmId={validGtm ? gtmId : ""} />;
}

function ConsentControls({ projectId, gtmId }: { projectId: string; gtmId: string }) {
  // Ask again when Google analytics is added to an earlier Clarity-only choice.
  const storageKey = gtmId ? `${consentKey}-google-v1` : consentKey;
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    // Resolve persisted consent after hydration, without reading storage during SSR.
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved === "accepted" || saved === "rejected") setChoice(saved);
      } catch { /* Consent still works for this page when storage is unavailable. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  function choose(next: Exclude<Choice, null>) {
    try { localStorage.setItem(storageKey, next); } catch { /* Use in-memory consent. */ }
    setChoice(next);
    setEditing(false);
    if (next === "rejected" && (window.clarity || window.offsayGtmLoaded)) {
      window.clarity?.("consentv2", { analytics_Storage: "denied", ad_Storage: "denied" });
      window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      window.location.reload();
    }
  }

  return <>
    {ready && choice === "accepted" && gtmId && <Script id="offsay-gtm" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
      window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      if (!window.offsayGtmLoaded) {
        window.offsayGtmLoaded = true;
        window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
        var gtmScript = document.createElement('script');
        gtmScript.async = true;
        gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=${gtmId}';
        document.head.appendChild(gtmScript);
      }
    `}</Script>}
    {ready && choice === "accepted" && projectId && <Script id="offsay-clarity" strategy="afterInteractive">{`
      window.clarity = window.clarity || function(){(window.clarity.q = window.clarity.q || []).push(Array.from(arguments));};
      window.clarity('consentv2', {analytics_Storage:'granted', ad_Storage:'denied'});
      var clarityScript = document.createElement('script');
      clarityScript.async = true;
      clarityScript.src = 'https://www.clarity.ms/tag/${projectId}';
      document.head.appendChild(clarityScript);
    `}</Script>}
    {ready && (choice === null || editing) && <aside className="analytics-consent" aria-labelledby="analytics-consent-title">
      <div><strong id="analytics-consent-title">Help us improve Offsay</strong>
        <p>Allow {gtmId ? "Google Analytics and Microsoft Clarity" : "Microsoft Clarity"} analytics to understand how you use our website? Your choice is optional. <Link href="/privacy-policy/">Privacy policy</Link></p></div>
      <div className="analytics-consent-actions">
        <button type="button" className="btn btn-sm btn-outline" onClick={() => choose("rejected")}>Reject</button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => choose("accepted")}>Accept</button>
        {editing && <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditing(false)}>Cancel</button>}
      </div>
    </aside>}
    {ready && choice !== null && !editing && <button type="button" className="analytics-preferences" onClick={() => setEditing(true)}>Analytics preferences</button>}
  </>;
}
