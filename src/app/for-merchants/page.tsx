import type { Metadata } from "next";
import { ReferencePage } from "@/components/reference-page";

export const metadata: Metadata = {
  title: "For Merchants",
  description: "List your business, publish offers, and reach nearby customers with OffSay.",
};

export default function MerchantsPage() {
  return <ReferencePage file="merchants.html" />;
}
