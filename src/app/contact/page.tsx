import type { Metadata } from "next";
import { ReferencePage } from "@/components/reference-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the OffSay team for support, partnerships, or general questions.",
};

export default function ContactPage() {
  return <ReferencePage file="contact.html" />;
}
