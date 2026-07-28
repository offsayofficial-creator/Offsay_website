import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand footer-brand" href="/">
            <Image src="/brand/offsay-icon.png" alt="" width={42} height={42} />
            <span>OffSay</span>
          </Link>
          <p className="footer-copy">Better local discoveries for customers. Better local reach for businesses.</p>
          <a className="footer-email" href={`mailto:${siteConfig.contactEmail}`}><Mail size={16} /> {siteConfig.contactEmail}</a>
        </div>
        <div><h3>Discover</h3><Link href="/how-it-works">How it works</Link><Link href="/about">About OffSay</Link><Link href="/contact">Contact</Link></div>
        <div><h3>Businesses</h3><Link href="/for-merchants">For merchants</Link><a href={siteConfig.portalUrl} target="_blank" rel="noreferrer">List your business</a></div>
        <div><h3>Legal</h3><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} OffSay. All rights reserved.</span><span>Built for local communities.</span></div>
    </footer>
  );
}
