import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: "OffSay — Discover better local offers", template: "%s | OffSay" },
  description: siteConfig.description,
  applicationName: "OffSay",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "OffSay", title: "OffSay — Discover better local offers", description: siteConfig.description, url: siteConfig.siteUrl, images: [{ url: "/og.png", width: 1200, height: 630, alt: "OffSay — local offers, made easier" }] },
  twitter: { card: "summary_large_image", title: "OffSay — Discover better local offers", description: siteConfig.description, images: ["/og.png"] },
  icons: { icon: "/brand/offsay-icon.png", apple: "/brand/offsay-icon.png" },
};

export const viewport: Viewport = { themeColor: "#6847f5", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "OffSay", url: siteConfig.siteUrl, logo: `${siteConfig.siteUrl}/brand/offsay-icon.png`, description: siteConfig.description };
  return (
    <html lang="en">
      <body><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content">{children}</main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} /></body>
    </html>
  );
}
