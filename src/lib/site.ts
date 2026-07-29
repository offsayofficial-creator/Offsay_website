const cleanUrl = (value: string | undefined, fallback: string) =>
  (value?.trim() || fallback).replace(/\/$/, "");

export const siteConfig = {
  name: "OffSay",
  description:
    "Discover verified local offers nearby and give local businesses a simpler way to reach the right customers.",
  siteUrl: cleanUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://offsay.example",
  ),
  portalUrl:
    process.env.NEXT_PUBLIC_PORTAL_URL?.trim() ||
    "https://offsayofficial-creator.github.io/offsay-config/",
  playStoreUrl: process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim() || "",
  appStoreUrl: process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() || "",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "offsay.official@gmail.com",
};
