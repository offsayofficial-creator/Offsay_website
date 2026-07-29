import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how OffSay collects, uses, protects, and shares information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Your privacy matters"
      title="Privacy Policy"
      description="This policy explains what information OffSay collects, why we use it, and the choices available to customers, merchants, and visitors."
      updated="29 July 2026"
      sections={[
        {
          id: "information-we-collect",
          title: "Information we collect",
          content: (
            <>
              <p>We collect information needed to operate OffSay and provide relevant local offers.</p>
              <ul>
                <li>Account details such as name, email address, phone number, role, and authentication information.</li>
                <li>Location information when you allow device-location access, plus locations you search for or save.</li>
                <li>Activity such as viewed, liked, saved, shared, rated, or redeemed offers and submitted reviews.</li>
                <li>Merchant information including business, branch, contact, offer, subscription, and team details.</li>
                <li>Technical data such as device type, app version, IP address, diagnostics, performance, and crash information.</li>
              </ul>
            </>
          ),
        },
        {
          id: "how-we-use-information",
          title: "How we use information",
          content: (
            <>
              <p>We use information to provide nearby discovery, maintain accounts, operate merchant tools, personalise results, process reviews and interactions, and improve reliability.</p>
              <p>We may also use aggregated information to understand category demand, offer performance, and service usage without identifying individual users.</p>
            </>
          ),
        },
        {
          id: "location",
          title: "Location and nearby discovery",
          content: (
            <>
              <p>Location access is optional. When enabled, OffSay uses your current or last known location to order stores and offers by distance. If location is unavailable, the app may use a cached location and clearly identify it as such.</p>
              <p>You can disable location permission in device settings, select another location manually, or clear app data.</p>
            </>
          ),
        },
        {
          id: "analytics-crash-reporting",
          title: "Analytics and crash reporting",
          content: (
            <>
              <p>OffSay uses Firebase Analytics to understand app usage and Firebase Crashlytics to diagnose crashes, non-fatal errors, and stability issues. Reports may include app state, device information, screen activity, and a non-email account identifier.</p>
              <p>We do not use crash reports to collect passwords, payment-card details, or the private content of authentication credentials.</p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "When information is shared",
          content: (
            <>
              <p>We may share information with infrastructure, analytics, communication, map, and authentication providers that help operate OffSay. Public reviews may display your chosen name, rating, and review text.</p>
              <p>We may disclose information when required by law, to protect users and the platform, or as part of a business transfer with appropriate safeguards.</p>
            </>
          ),
        },
        {
          id: "retention-security",
          title: "Retention and security",
          content: (
            <>
              <p>We retain information only as long as reasonably necessary for the purposes described here, legal obligations, dispute resolution, fraud prevention, and service continuity.</p>
              <p>We use access controls, authenticated APIs, encrypted transport, and operational safeguards. No online service can guarantee absolute security.</p>
            </>
          ),
        },
        {
          id: "choices-rights",
          title: "Your choices and rights",
          content: (
            <>
              <p>You can update profile information, manage permissions, remove saved items, and sign out through the app. You may contact us to request access, correction, or deletion of eligible personal information.</p>
              <p>Some records may be retained where required for security, accounting, legal compliance, or legitimate platform operations.</p>
            </>
          ),
        },
        {
          id: "children-updates",
          title: "Children and policy updates",
          content: (
            <>
              <p>OffSay is not directed to children who cannot legally consent to online services in their region. We do not knowingly request accounts from such children.</p>
              <p>We may update this policy as the service changes. The current version and effective date will remain available on this page.</p>
            </>
          ),
        },
      ]}
    />
  );
}
