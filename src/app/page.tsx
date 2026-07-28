import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, Heart, MapPin, Search, ShieldCheck, Sparkles, Store, Tags } from "lucide-react";
import { AppCta, Eyebrow, FinalCta, MerchantCta } from "@/components/sections";

export const metadata: Metadata = { title: "Local offers, made easier", description: "Find trustworthy offers near you and help local businesses reach the customers who matter." };

const offers = [
  { value: "30% OFF", type: "Dinner combo", store: "Anna Idli Corner", color: "coral" },
  { value: "1 + 1", type: "Signature mocktails", store: "The Brew House", color: "violet" },
  { value: "40% OFF", type: "Fresh styles", store: "Cotton City Fashions", color: "teal" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy"><Eyebrow><Sparkles /> Better local discovery</Eyebrow><h1>The best local offers, <span>closer than you think.</span></h1><p>OffSay helps you discover verified offers nearby—and gives local businesses a simpler way to reach the right people.</p><div className="button-row"><Link className="button" href="/how-it-works">Explore how it works <ArrowRight /></Link><Link className="button button-secondary" href="/for-merchants">I own a business</Link></div><AppCta compact /></div>
          <div className="hero-visual" aria-label="Example offers in the OffSay app"><div className="phone"><div className="phone-head"><div><small>Good morning</small><strong>Nearby offers</strong></div><span className="avatar">OS</span></div><div className="search-demo"><Search /><span>Search stores, offers, categories</span></div><div className="chips"><span className="selected">All</span><span>Food</span><span>Bars</span><span>Fashion</span></div>{offers.map((offer) => <div className="offer-demo" key={offer.type}><div className={`offer-value ${offer.color}`}><strong>{offer.value}</strong><small>Local exclusive</small></div><div><span className="verified"><BadgeCheck /> Verified</span><strong>{offer.type}</strong><small><Store /> {offer.store}</small><em>Ends soon</em></div><Heart className="demo-heart" /></div>)}</div><div className="floating-proof"><ShieldCheck /><div><strong>Verified local offers</strong><span>Clear details. Real locations.</span></div></div></div>
        </div>
      </section>

      <section className="trust-strip"><div className="shell"><span>Built around what matters locally</span><div><strong><MapPin /> Nearby first</strong><strong><ShieldCheck /> Verified businesses</strong><strong><Tags /> Clear offers</strong><strong><BarChart3 /> Useful insights</strong></div></div></section>

      <section className="section shell"><div className="section-heading centered"><Eyebrow>One platform, two wins</Eyebrow><h2>Made for people who shop local—and businesses that serve them.</h2><p>Less noise for customers. More relevant reach for merchants.</p></div><div className="audience-grid"><article className="audience-card customer"><span className="icon-box"><MapPin /></span><h3>For local explorers</h3><p>Find useful, time-sensitive offers based on where you are and what you care about.</p><ul><li>Discover offers by distance and district</li><li>Save favourites and revisit them later</li><li>See clear validity, terms, and directions</li></ul><Link href="/how-it-works">See the customer journey <ArrowRight /></Link></article><article className="audience-card merchant"><span className="icon-box"><Store /></span><h3>For local businesses</h3><p>Publish offers across one or many stores, then learn what drives customer interest.</p><ul><li>Manage branches and targeted campaigns</li><li>Track views, likes, saves, and directions</li><li>Keep every store profile accurate</li></ul><Link href="/for-merchants">Explore merchant tools <ArrowRight /></Link></article></div></section>

      <section className="section soft-section"><div className="shell"><div className="section-heading"><Eyebrow>Simple by design</Eyebrow><h2>From nearby discovery to an in-store visit.</h2></div><div className="steps-grid"><article><span>01</span><Search /><h3>Choose what matters</h3><p>Set your location, distance, district, and category.</p></article><article><span>02</span><BadgeCheck /><h3>Compare clear offers</h3><p>See the value, validity, store, and terms before you go.</p></article><article><span>03</span><MapPin /><h3>Visit with confidence</h3><p>Call the store, open its website, or get directions.</p></article></div></div></section>
      <MerchantCta />
      <FinalCta />
    </>
  );
}
