import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing customer and merchant use of OffSay.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Using OffSay"
      title="Terms of Service"
      description="These terms explain the rules for using OffSay as a customer, merchant, manager, or website visitor."
      updated="29 July 2026"
      sections={[
        {
          id: "acceptance",
          title: "Acceptance and eligibility",
          content: (
            <>
              <p>By accessing or using OffSay, you agree to these terms and our Privacy Policy. If you use OffSay for a business, you confirm that you have authority to act for that business.</p>
              <p>You must be legally capable of entering into these terms in your region. Do not use the service if you do not agree.</p>
            </>
          ),
        },
        {
          id: "accounts",
          title: "Accounts and security",
          content: (
            <>
              <p>Provide accurate account information and keep your access credentials secure. You are responsible for activity performed through your account and must notify us promptly of suspected unauthorised access.</p>
              <p>We may require email or identity verification and may restrict accounts that are fraudulent, misleading, unsafe, or in breach of these terms.</p>
            </>
          ),
        },
        {
          id: "offers",
          title: "Offers and redemptions",
          content: (
            <>
              <p>Offers are subject to their displayed validity, location, availability, limits, and merchant terms. Saving, liking, or viewing an offer does not reserve it or guarantee redemption.</p>
              <p>Merchants are responsible for honouring accurate published offers. OffSay may correct, pause, feature, or remove offers to protect customers and platform quality.</p>
            </>
          ),
        },
        {
          id: "merchant-responsibilities",
          title: "Merchant responsibilities",
          content: (
            <>
              <p>Merchants must maintain accurate business and branch information, publish lawful offers, possess required permissions, and avoid deceptive pricing or unavailable promotions.</p>
              <p>Merchant workspace access may depend on approval, branch status, subscription validity, and confirmed payment. Managers may act only within assigned permissions.</p>
            </>
          ),
        },
        {
          id: "reviews-conduct",
          title: "Reviews and acceptable conduct",
          content: (
            <>
              <p>Reviews should reflect genuine experiences. Do not post illegal, abusive, discriminatory, fraudulent, infringing, promotional, or intentionally misleading content.</p>
              <p>Do not interfere with the service, scrape data without permission, manipulate analytics or votes, impersonate others, bypass access controls, or use OffSay to harm users or businesses.</p>
            </>
          ),
        },
        {
          id: "third-party-services",
          title: "Third-party services",
          content: (
            <>
              <p>OffSay may open maps, websites, delivery platforms, social networks, app stores, or communication services. Those services operate under their own terms and privacy practices.</p>
              <p>OffSay is not responsible for third-party availability, content, transactions, delivery, or conduct.</p>
            </>
          ),
        },
        {
          id: "availability-liability",
          title: "Availability and responsibility",
          content: (
            <>
              <p>We work to keep OffSay reliable, but the service may occasionally be interrupted, changed, or unavailable. Offer accuracy and fulfilment ultimately depend on the participating merchant.</p>
              <p>To the extent permitted by applicable law, OffSay is not liable for indirect or consequential loss arising from use of the platform, third-party services, or a merchant transaction.</p>
            </>
          ),
        },
        {
          id: "suspension-changes",
          title: "Suspension, termination, and changes",
          content: (
            <>
              <p>We may suspend or terminate access when required for security, non-payment, legal compliance, platform integrity, or a material breach of these terms.</p>
              <p>We may update the service and these terms. Continued use after an updated version takes effect means you accept the revised terms.</p>
            </>
          ),
        },
      ]}
    />
  );
}
