import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/for-merchants/",
    "/contact/",
  ];
  return paths.map((path) => ({
    url: path === "/" ? `${siteConfig.siteUrl}/` : `${siteConfig.siteUrl}${path}`,
    lastModified: new Date("2026-07-30"),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
