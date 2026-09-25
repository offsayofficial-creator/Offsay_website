"use client";
import { useEffect, useRef, useState } from "react";
import { Store, Tags, HeartHandshake } from "lucide-react";
type Partner = { id: string; name: string; logo: string | null; category: string; locality: string; district: string };
function PartnerCard({ partner }: { partner: Partner }) {
  const [broken, setBroken] = useState(false);
  return <article className="partner-card">
    <div className="partner-logo">{partner.logo && !broken ?
      // eslint-disable-next-line @next/next/no-img-element
      <img src={partner.logo} alt={`${partner.name} logo`} loading="lazy" onError={() => setBroken(true)} /> :
      <span aria-hidden="true">{partner.name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("")}</span>}</div>
    <h3>{partner.name}</h3>
  </article>;
}
export function Partners({ preview = false }: { preview?: boolean }) {
  const [items, setItems] = useState<Partner[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(true);
  const stripRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const measure = () => setOverflow((groupRef.current?.scrollWidth ?? 0) > strip.clientWidth + 1);
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(strip);
    if (groupRef.current) observer?.observe(groupRef.current);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, [items]);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !overflow || !window.matchMedia) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, previous = 0, position = strip.scrollLeft;
    const tick = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      if (!motion.matches && !document.hidden && !strip.matches(":hover, :focus-within, :active")) {
        const distance = (groupRef.current?.getBoundingClientRect().width ?? 0) + parseFloat(getComputedStyle(strip).gap || "0");
        if (distance > 0) {
          position = (position + elapsed * 0.022) % distance;
          strip.scrollLeft = position;
        }
      }
      else { position = strip.scrollLeft; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [overflow, items]);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.offsay.in").replace(/\/+$/, "");
    const endpoint = `${base.endsWith("/api/v1") ? base : `${base}/api/v1`}/stores/partners/?page=${page}&page_size=${preview ? 100 : 12}`;
    fetch(endpoint, { signal: controller.signal, credentials: "omit" }).then(async response => {
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error("Invalid response");
      if (!active) return;
      setItems(old => page === 1 ? data.results : [...old, ...data.results.filter((item: Partner) => !old.some(existing => existing.id === item.id))]);
      setHasMore(Boolean(data.next));
    }).catch(() => { if (active) setError(true); }).finally(() => {
      window.clearTimeout(timeout);
      if (active) { setLoading(false); pending.current = false; }
    });
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [page, preview, attempt]);
  useEffect(() => {
    if (preview && hasMore && !loading && !error) {
      pending.current = true;
      setLoading(true);
      setHasMore(false);
      setPage(value => value + 1);
    }
  }, [preview, hasMore, loading, error]);
  const load = (retry: boolean) => {
    if (pending.current) return;
    pending.current = true; setLoading(true); setError(false);
    if (retry) setAttempt(value => value + 1); else setPage(value => value + 1);
  };
  return <section className={`partners-section${preview ? "" : " partners-main"}`} aria-label="Our partners">
    <div className="wrap">
      <div className="partners-heading-row">
      <div className="partners-heading-copy">
      <span className="partner-eyebrow"><span aria-hidden="true">✦</span> Our merchant community</span>
      {preview ? <h2 className="h-display">OUR <span>PARTNERS</span></h2> : <h1 className="h-display">OUR <span>PARTNERS</span></h1>}
      <p className="partners-description">Meet the businesses bringing local discoveries and everyday offers to OffSay.</p>
      </div>
      <ul className="partners-benefits" aria-label="Explore our merchant community">
        <li><Store size={18} aria-hidden="true" /><span>Discover local stores</span></li>
        <li><Tags size={18} aria-hidden="true" /><span>Explore nearby offers</span></li>
        <li><HeartHandshake size={18} aria-hidden="true" /><span>Support local businesses</span></li>
      </ul>
      </div>
      <div className="partners-grid" ref={stripRef} tabIndex={overflow ? 0 : undefined} role="region" aria-label="Merchant logos; scroll to explore">
        <div className="partners-loop-group" ref={groupRef}>{items.map(item => <PartnerCard key={item.id} partner={item} />)}</div>
        {overflow && <div className="partners-loop-group" aria-hidden="true">{items.map(item => <PartnerCard key={`copy-${item.id}`} partner={item} />)}</div>}
      </div>
      <div className="partners-status" role="status" aria-live="polite">
        {loading ? "Loading partners…" : error ? "Unable to load partners. Please try again." : !items.length ? "Our partners will appear here soon." : null}
      </div>
      <div className="partners-actions">
        {error && <button className="btn btn-primary" onClick={() => load(true)} disabled={loading}>Try again</button>}
        {!preview && hasMore && !error && <button className="btn btn-primary" disabled={loading} onClick={() => load(false)}>{loading ? "Loading…" : "Load more"}</button>}
      </div>
    </div>
  </section>;
}
