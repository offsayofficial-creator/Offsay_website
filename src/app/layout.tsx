import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: "OffSay — Every Nearby Offer, In One App", template: "%s — OffSay" },
  description: "Discover, save, and redeem nearby offers across every category with OffSay.",
  applicationName: "OffSay",
  openGraph: { type: "website", siteName: "OffSay", title: "OffSay — Every Nearby Offer, In One App", description: siteConfig.description, url: siteConfig.siteUrl, images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: "OffSay — every nearby offer, in one app" }] },
  twitter: { card: "summary_large_image", title: "OffSay — Every Nearby Offer, In One App", description: siteConfig.description, images: [`${basePath}/og.png`] },
  icons: { icon: `${basePath}/brand/offsay-icon.png`, apple: `${basePath}/brand/offsay-icon.png` },
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
