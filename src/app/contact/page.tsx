import type { Metadata } from "next";
import { ArrowRight, BriefcaseBusiness, Mail, MessageCircleQuestion, Store } from "lucide-react";
import { Eyebrow, PageHero } from "@/components/sections";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Contact OffSay for customer help, merchant onboarding, or partnership enquiries." };

export default function ContactPage() {
  const subject = encodeURIComponent("OffSay enquiry");
  return <><PageHero eyebrow="Contact OffSay" title="Tell us how we can help." description="Choose the route that matches your question and reach the right place faster." />
    <section className="section shell contact-grid"><article><span className="icon-box"><MessageCircleQuestion /></span><h2>Customer support</h2><p>Questions about the app, an offer, your account, privacy, or a technical issue.</p><a className="text-link" href={`mailto:${siteConfig.contactEmail}?subject=${subject}`}>Email support <ArrowRight /></a></article><article><span className="icon-box"><Store /></span><h2>Merchant onboarding</h2><p>List a new business or continue your application through the OffSay portal.</p><a className="text-link" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">List your business <ArrowRight /></a></article><article><span className="icon-box"><BriefcaseBusiness /></span><h2>Business partnerships</h2><p>For platform partnerships, district launches, or other business enquiries.</p><a className="text-link" href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent("OffSay partnership enquiry")}`}>Start a conversation <ArrowRight /></a></article></section>
    <section className="section shell"><div className="contact-panel"><div><Eyebrow>Email us directly</Eyebrow><h2>We’ll point your message in the right direction.</h2><p>Include the email connected to your account and any useful offer or store details. Never send your password or OTP.</p></div><a className="button" href={`mailto:${siteConfig.contactEmail}?subject=${subject}`}><Mail /> {siteConfig.contactEmail}</a></div></section>
  </>;
}
