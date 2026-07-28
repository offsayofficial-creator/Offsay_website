import { ArrowRight, Check, Store } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-hero"><div className="shell narrow"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div></section>;
}

export function AppCta({ compact = false }: { compact?: boolean }) {
  const available = Boolean(siteConfig.playStoreUrl || siteConfig.appStoreUrl);
  return (
    <div className={compact ? "app-cta compact" : "app-cta"}>
      <span className="status-dot" />
      <div><strong>{available ? "Get the OffSay app" : "OffSay app coming soon"}</strong><span>{available ? "Choose your app store to continue." : "We’re preparing a polished mobile experience for launch."}</span></div>
      {siteConfig.playStoreUrl && <a className="button button-dark" href={siteConfig.playStoreUrl}>Google Play</a>}
      {siteConfig.appStoreUrl && <a className="button button-dark" href={siteConfig.appStoreUrl}>App Store</a>}
      {!available && <span className="coming-pill">Coming soon</span>}
    </div>
  );
}

export function MerchantCta() {
  return (
    <section className="merchant-cta shell">
      <div><Eyebrow>Grow locally</Eyebrow><h2>Turn nearby attention into real visits.</h2><p>Create your business profile, publish targeted offers, and understand what customers respond to.</p><ul><li><Check /> Branch-level control</li><li><Check /> Flexible offer campaigns</li><li><Check /> Clear performance analytics</li></ul></div>
      <div className="cta-action-card"><span className="icon-box"><Store /></span><h3>Ready to join OffSay?</h3><p>Open the OffSay business portal to submit your store and start building your local presence.</p><a className="button" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">List your business <ArrowRight /></a><span className="secure-note">Secure merchant onboarding through the OffSay portal</span></div>
    </section>
  );
}

export function FinalCta() {
  return <section className="final-cta"><div className="shell"><div><Eyebrow>OffSay for local discovery</Eyebrow><h2>Good offers should be easier to find.</h2><p>Discover nearby value or bring your business closer to local customers.</p></div><div className="button-row"><Link className="button button-light" href="/how-it-works">See how it works</Link><a className="button button-outline-light" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">List your business <ArrowRight /></a></div></div></section>;
}
