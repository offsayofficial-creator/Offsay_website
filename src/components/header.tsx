"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/lib/site";

const links = [
  ["/", "Home"],
  ["/how-it-works", "How it works"],
  ["/for-merchants", "For merchants"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="OffSay home">
          <Image src="/brand/offsay-icon.png" alt="" width={42} height={42} priority />
          <span>OffSay</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([href, label]) => (
            <Link href={href} key={href} className={pathname === href ? "active" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a className="button button-sm" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">List your business</a>
          <button
            className="menu-button"
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav shell" aria-label="Mobile navigation">
          {links.map(([href, label]) => <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <a className="mobile-business-link" href={siteConfig.portalUrl} target="_blank" rel="noreferrer">List your business</a>
        </nav>
      )}
    </header>
  );
}
