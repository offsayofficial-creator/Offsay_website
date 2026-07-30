import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  index = true,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = new URL(path, `${siteConfig.siteUrl}/`).toString();
  const socialTitle = absoluteTitle ? title : `${title} — OffSay`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index, follow: true },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "OffSay — discover nearby offers and local deals",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/og.png"],
    },
  };
}
