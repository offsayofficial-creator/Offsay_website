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
      }, { threshold: 0.12 });
      revealElements.forEach((element) => observer?.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("in"));
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const counterElements = Array.from(document.querySelectorAll<HTMLElement>("[data-counter]"));
    const counterFrames = new Set<number>();
    const counterTimers = new Set<number>();
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
      counterElements.forEach((element, index) => {
        const timer = window.setTimeout(() => {
          counterTimers.delete(timer);
          animateCounter(element);
        }, index * 120);
        counterTimers.add(timer);
      });
    };
    counterElements.forEach((element) => setCounterValue(element, 0));
    const initialCounterTimer = window.setTimeout(runCounterCycle, 250);
    counterTimers.add(initialCounterTimer);

    const header = document.querySelector<HTMLElement>("header.site");
    const updateHeader = () => {
      if (header) header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px -16px rgba(0,0,0,.6)" : "none";
    };
    window.addEventListener("scroll", updateHeader, { passive: true });

    const orbitVisual = document.querySelector<HTMLElement>(".orbit-visual");
    const finePointer = window.matchMedia("(pointer: fine)");
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
      faqCleanups.forEach((cleanup) => cleanup());
      observer?.disconnect();
      counterFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      counterTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("scroll", updateHeader);
      orbitVisual?.removeEventListener("pointermove", moveOrbit);
      orbitVisual?.removeEventListener("pointerleave", resetOrbit);
      if (orbitFrame !== undefined) window.cancelAnimationFrame(orbitFrame);
    };
  }, []);

  return null;
}
