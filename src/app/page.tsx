import type { Metadata } from "next";
import { ReferencePage } from "@/components/reference-page";

export const metadata: Metadata = {
  title: "Every Nearby Offer, In One App",
  description: "OffSay helps you discover the best nearby offers across every category.",
};

export default function HomePage() {
  return <ReferencePage file="index.html" />;
}
