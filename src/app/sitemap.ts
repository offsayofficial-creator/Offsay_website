import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/for-merchants",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
  ];
  return paths.map((path) => ({ url: `${siteConfig.siteUrl}${path}`, lastModified: new Date("2026-07-28"), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7 }));
}
