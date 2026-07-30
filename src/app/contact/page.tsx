import { ReferencePage } from "@/components/reference-page";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Contact OffSay",
  description:
    "Contact OffSay for customer support, merchant registration help, partnerships, or general questions.",
  path: "/contact/",
});

export default function ContactPage() {
  return <ReferencePage file="contact.html" />;
}
