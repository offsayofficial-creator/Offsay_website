"use client";

import { useEffect } from "react";

export function ReferenceInteractions() {
  useEffect(() => {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    const updateMenuIcon = () => {
      const icon = navToggle?.querySelector("i");
      if (icon) icon.className = navLinks?.classList.contains("open") ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    };
    const toggleNav = () => {
      navLinks?.classList.toggle("open");
      updateMenuIcon();
    };
    const closeNav = () => {
      navLinks?.classList.remove("open");
      updateMenuIcon();
    };
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

    const header = document.querySelector<HTMLElement>("header.site");
    const updateHeader = () => {
      if (header) header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px -16px rgba(0,0,0,.6)" : "none";
    };
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => {
      navToggle?.removeEventListener("click", toggleNav);
      navAnchors.forEach((anchor) => anchor.removeEventListener("click", closeNav));
      faqCleanups.forEach((cleanup) => cleanup());
      observer?.disconnect();
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  return null;
}
