import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: "OffSay — Nearby Offers & Local Deals", template: "%s — OffSay" },
  description: "Discover verified nearby offers and local deals from restaurants, shops, fashion, services, and more with OffSay.",
  applicationName: "OffSay",
  alternates: { canonical: siteConfig.siteUrl },
  openGraph: { type: "website", siteName: "OffSay", title: "OffSay — Nearby Offers & Local Deals", description: siteConfig.description, url: siteConfig.siteUrl, images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: "OffSay — discover nearby offers and local deals" }] },
  twitter: { card: "summary_large_image", title: "OffSay — Nearby Offers & Local Deals", description: siteConfig.description, images: [`${basePath}/og.png`] },
  icons: { icon: `${basePath}/brand/offsay-icon.png`, apple: `${basePath}/brand/offsay-icon.png` },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = { themeColor: "#0b0a14", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
