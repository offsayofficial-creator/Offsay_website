import { ReferencePage } from "@/components/reference-page";
import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({ title: "Our partners", description: "Meet the local stores that are part of OffSay.", path: "/merchants/" });
export default function MerchantsPage() { return <ReferencePage file="partners.html" />; }
