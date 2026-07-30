import { ReferencePage } from "@/components/reference-page";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "List Your Business & Reach Nearby Customers",
  description:
    "List your business on OffSay, publish local offers, manage stores, and reach nearby customers looking for deals.",
  path: "/for-merchants/",
});

export default function MerchantsPage() {
  return <ReferencePage file="merchants.html" />;
}
