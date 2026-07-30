"use client";

import { useEffect } from "react";

export function ReferenceInteractions() {
  useEffect(() => {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    const updateMenuIcon = () => {
      const icon = navToggle?.querySelector("i");
      const isOpen = navLinks?.classList.contains("open") ?? false;
      if (icon) icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
      navToggle?.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    };
    const toggleNav = () => {
      navLinks?.classList.toggle("open");
      updateMenuIcon();
    };
    const closeNav = () => {
      navLinks?.classList.remove("open");
      updateMenuIcon();
    };
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Toggle navigation");
    navToggle?.addEventListener("click", toggleNav);
    const navAnchors = Array.from(navLinks?.querySelectorAll("a") ?? []);
    navAnchors.forEach((anchor) => anchor.addEventListener("click", closeNav));

    const storeBadges = Array.from(document.querySelectorAll<HTMLAnchorElement>(".store-badge"));
    const comingSoonToast = document.createElement("div");
    comingSoonToast.className = "coming-soon-toast";
    comingSoonToast.setAttribute("role", "status");
    comingSoonToast.setAttribute("aria-live", "polite");
    comingSoonToast.innerHTML = `
      <span class="coming-soon-toast-icon" aria-hidden="true"><i class="fa-solid fa-bell"></i></span>
      <span><strong>Coming soon</strong><small data-coming-soon-message>OffSay will be available soon.</small></span>
    `;
    document.body.appendChild(comingSoonToast);
    let toastTimer: number | undefined;
    const showComingSoon = (event: Event) => {
      event.preventDefault();
      const badge = event.currentTarget as HTMLAnchorElement;
      const storeName = badge.textContent?.includes("Google Play") ? "Google Play" : "the App Store";
      const message = comingSoonToast.querySelector<HTMLElement>("[data-coming-soon-message]");
      if (message) message.textContent = `OffSay will be available on ${storeName} soon.`;
      comingSoonToast.classList.add("show");
      if (toastTimer !== undefined) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => comingSoonToast.classList.remove("show"), 3000);
    };
    storeBadges.forEach((badge) => {
      badge.setAttribute("aria-label", `${badge.textContent?.trim() ?? "App download"} — coming soon`);
      badge.addEventListener("click", showComingSoon);
    });

    const faqItems = Array.from(document.querySelectorAll<HTMLElement>(".faq-item"));
    const faqCleanups = faqItems.map((item) => {
      const question = item.querySelector<HTMLElement>(".faq-q");
      const toggle = () => {
        const wasOpen = item.classList.contains("open");
        faqItems.forEach((entry) => entry.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
      };
      question?.addEventListener("click", toggle);
      return () => question?.removeEventListener("click", toggle);
    });

    const autoRevealElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".legal-hero, .legal-toc, .legal-section, .legal-contact-card, footer.site .footer-col, footer.site .footer-bottom",
      ),
    );
    autoRevealElements.forEach((element) => element.classList.add("reveal"));

    const staggerGroups = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".grid.reveal, .footer-grid, .stat-strip",
      ),
    );
    staggerGroups.forEach((group) => {
      group.classList.add("reveal-stagger");
      Array.from(group.children).forEach((child, index) => {
        if (child instanceof HTMLElement) {
          child.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
        }
      });
    });

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      revealElements.forEach((element) => observer?.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("in"));
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const counterElements = Array.from(document.querySelectorAll<HTMLElement>("[data-counter]"));
    const counterFrames = new Set<number>();
    const counterTimers = new Set<number>();
    let counterObserver: IntersectionObserver | undefined;
    let countersStarted = false;
    const requestCounterFrame = (callback: FrameRequestCallback) => {
      let frame = 0;
      frame = window.requestAnimationFrame((now) => {
        counterFrames.delete(frame);
        callback(now);
      });
      counterFrames.add(frame);
    };
    const setCounterValue = (element: HTMLElement, value: number) => {
      element.textContent = `${value}${element.dataset.counterSuffix ?? ""}`;
    };
    const animateCounter = (element: HTMLElement) => {
      const target = Number(element.dataset.counter ?? 0);
      const startedAt = performance.now();
      const duration = 1700;
      setCounterValue(element, 0);
      const update = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounterValue(element, Math.round(target * eased));
        if (progress < 1) requestCounterFrame(update);
      };
      requestCounterFrame(update);
    };
    const runCounterCycle = () => {
      if (countersStarted) return;
      countersStarted = true;
      counterElements.forEach((element, index) => {
        const timer = window.setTimeout(() => {
          counterTimers.delete(timer);
          if (reducedMotion.matches) {
            setCounterValue(element, Number(element.dataset.counter ?? 0));
          } else {
            animateCounter(element);
          }
        }, index * 120);
        counterTimers.add(timer);
      });
    };
    counterElements.forEach((element) => setCounterValue(element, 0));
    const counterSection = counterElements[0]?.closest<HTMLElement>(".stat-strip");
    if (counterSection && "IntersectionObserver" in window) {
      counterObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        runCounterCycle();
        counterObserver?.disconnect();
      }, { threshold: 0.35 });
      counterObserver.observe(counterSection);
    } else if (counterSection) {
      runCounterCycle();
    }

    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>("header.site");
    let scrollFrame: number | undefined;
    const updateScrollEffects = () => {
      scrollFrame = undefined;
      const scrollRange = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      root.style.setProperty("--scroll-shift", `${Math.min(window.scrollY * 0.035, 28)}px`);
      header?.classList.toggle("scrolled", window.scrollY > 8);
    };
    const requestScrollEffects = () => {
      if (scrollFrame !== undefined) return;
      scrollFrame = window.requestAnimationFrame(updateScrollEffects);
    };
    window.addEventListener("scroll", requestScrollEffects, { passive: true });
    window.addEventListener("resize", requestScrollEffects, { passive: true });
    updateScrollEffects();

    let pointerFrame: number | undefined;
    const updatePointerGlow = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches) return;
      if (pointerFrame !== undefined) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    };
    window.addEventListener("pointermove", updatePointerGlow, { passive: true });

    const orbitVisual = document.querySelector<HTMLElement>(".orbit-visual");
    let orbitFrame: number | undefined;
    const resetOrbit = () => {
      orbitVisual?.style.setProperty("--orbit-card-x", "0px");
      orbitVisual?.style.setProperty("--orbit-card-y", "0px");
      orbitVisual?.style.setProperty("--orbit-chip-x", "0px");
      orbitVisual?.style.setProperty("--orbit-chip-y", "0px");
      orbitVisual?.style.setProperty("--orbit-ring-x", "0px");
      orbitVisual?.style.setProperty("--orbit-ring-y", "0px");
    };
    const moveOrbit = (event: PointerEvent) => {
      if (!orbitVisual || reducedMotion.matches || !finePointer.matches) return;
      if (orbitFrame !== undefined) window.cancelAnimationFrame(orbitFrame);
      orbitFrame = window.requestAnimationFrame(() => {
        const bounds = orbitVisual.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
        const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
        orbitVisual.style.setProperty("--orbit-card-x", `${x * 9}px`);
        orbitVisual.style.setProperty("--orbit-card-y", `${y * 9}px`);
        orbitVisual.style.setProperty("--orbit-chip-x", `${x * 6}px`);
        orbitVisual.style.setProperty("--orbit-chip-y", `${y * 6}px`);
        orbitVisual.style.setProperty("--orbit-ring-x", `${x * -3}px`);
        orbitVisual.style.setProperty("--orbit-ring-y", `${y * -3}px`);
      });
    };
    orbitVisual?.addEventListener("pointermove", moveOrbit);
    orbitVisual?.addEventListener("pointerleave", resetOrbit);

    return () => {
      navToggle?.removeEventListener("click", toggleNav);
      document.body.classList.remove("nav-open");
      navAnchors.forEach((anchor) => anchor.removeEventListener("click", closeNav));
      storeBadges.forEach((badge) => badge.removeEventListener("click", showComingSoon));
      if (toastTimer !== undefined) window.clearTimeout(toastTimer);
      comingSoonToast.remove();
      faqCleanups.forEach((cleanup) => cleanup());
      observer?.disconnect();
      counterObserver?.disconnect();
      counterFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      counterTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("scroll", requestScrollEffects);
      window.removeEventListener("resize", requestScrollEffects);
      window.removeEventListener("pointermove", updatePointerGlow);
      orbitVisual?.removeEventListener("pointermove", moveOrbit);
      orbitVisual?.removeEventListener("pointerleave", resetOrbit);
      if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
      if (pointerFrame !== undefined) window.cancelAnimationFrame(pointerFrame);
      if (orbitFrame !== undefined) window.cancelAnimationFrame(orbitFrame);
    };
  }, []);

  return null;
}
