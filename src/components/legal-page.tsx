import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ReferenceInteractions } from "@/components/reference-interactions";

type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: LegalPageProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header className="site">
        <div className="wrap nav-row">
          <Link href="/" className="logo" aria-label="OffSay home">
            <span className="logo-mark logo-image">
              <Image
                src={`${basePath}/brand/offsay-icon.png`}
                width={38}
                height={38}
                alt=""
                priority
              />
            </span>
            Offsay
          </Link>
          <nav className="nav-links" id="navLinks" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/for-merchants">For Merchants</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="nav-cta">
            <Link href="/#download" className="btn btn-primary btn-sm">
              Download App
            </Link>
            <button className="nav-toggle" id="navToggle" type="button">
              <i className="fa-solid fa-bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="legal-main">
        <div className="wrap">
          <section className="legal-hero reveal">
            <span className="eyebrow">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
              {eyebrow}
            </span>
            <h1>{title}</h1>
            <p>{description}</p>
            <span className="legal-updated">Last updated: {updated}</span>
          </section>

          <div className="legal-layout">
            <aside className="legal-toc reveal" aria-label="On this page">
              <span>On this page</span>
              {sections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  {section.title}
                </a>
              ))}
            </aside>

            <article className="legal-article">
              {sections.map((section, index) => (
                <section className="legal-section reveal" id={section.id} key={section.id}>
                  <div className="legal-section-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h2>{section.title}</h2>
                    {section.content}
                  </div>
                </section>
              ))}
              <div className="legal-contact-card reveal">
                <div className="icon-tile">
                  <i className="fa-solid fa-envelope" aria-hidden="true" />
                </div>
                <div>
                  <strong>Questions about this document?</strong>
                  <p>Contact the OffSay team and we will be happy to help.</p>
                </div>
                <a href="mailto:offsay.official@gmail.com">Email OffSay</a>
              </div>
            </article>
          </div>
        </div>
      </main>

      <footer className="site">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-col">
              <Link href="/" className="logo legal-footer-logo">
                <span className="logo-mark logo-image">
                  <Image
                    src={`${basePath}/brand/offsay-icon.png`}
                    width={38}
                    height={38}
                    alt=""
                  />
                </span>
                Offsay
              </Link>
              <p className="muted legal-footer-copy">
                Every nearby offer, in one app. Discover, save and redeem local
                deals across every category.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link href="/#what">What is Offsay</Link>
              <Link href="/#download">Download</Link>
              <Link href="/for-merchants">For Merchants</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="/contact">Contact Us</Link>
              <Link href="/for-merchants">Partner With Us</Link>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Offsay. All rights reserved.</span>
            <span>Made for local businesses everywhere.</span>
          </div>
        </div>
      </footer>
      <ReferenceInteractions />
    </>
  );
}
