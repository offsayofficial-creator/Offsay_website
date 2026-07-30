import { ReferencePage } from "@/components/reference-page";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "OffSay — Nearby Offers & Local Deals",
  description:
    "Discover verified nearby offers and local deals from restaurants, shops, fashion, services, and more with OffSay.",
  path: "/",
  absoluteTitle: true,
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.siteUrl}/#organization`,
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      logo: `${siteConfig.siteUrl}/brand/offsay-icon.png`,
      email: siteConfig.contactEmail,
      sameAs: Object.values(siteConfig.socialLinks),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.siteUrl}/#website`,
      url: siteConfig.siteUrl,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en-IN",
      publisher: { "@id": `${siteConfig.siteUrl}/#organization` },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <ReferencePage file="index.html" />
    </>
  );
}
