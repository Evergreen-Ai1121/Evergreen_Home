"use client";
import { useEffect } from "react";

const SELECTOR =
  "[data-reveal], .writing-row, .project-exhibit, .evidence-card, .about-block, .about-header, .section-heading, .contact-section, .reading-section, .wb-intro, .wb-entry, .wb-evidence-group, .wb-project-facts, .wb-section-heading, .wb-side-panel, .listing-page > header, .article-shell article > header, .site-footer";

/** One observer for every route, including streamed MDX and workbench switches. */
export function ScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const start = () => {
      dispose();
      if (preference.matches) return;
      const seen = new WeakSet<Element>();
      const enhanced = new Set<HTMLElement>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.dataset.scrollState = "revealed";
              observer.unobserve(el);
            }
        },
        { rootMargin: "0px 0px -36px 0px", threshold: 0 },
      );
      let frame = 0;
      const scan = () => {
        frame = 0;
        for (const element of enhanced)
          if (!element.isConnected) {
            observer.unobserve(element);
            enhanced.delete(element);
          }
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>(SELECTOR),
        );
        const candidates = new Set(elements);
        elements.forEach((el, index) => {
          if (seen.has(el) || !el.getClientRects().length) return;
          let ancestor = el.parentElement;
          while (ancestor && !candidates.has(ancestor))
            ancestor = ancestor.parentElement;
          if (ancestor) return;
          seen.add(el);
          enhanced.add(el);
          const rect = el.getBoundingClientRect();
          if (rect.bottom <= 0) return;
          if (rect.top < window.innerHeight - 36) {
            // Keep first-paint information visible; animate only its position.
            el.dataset.scrollState = "ready";
          } else {
            el.style.setProperty(
              "--reveal-delay",
              `${Math.min(Number(el.dataset.revealIndex ?? index % 4), 3) * 60}ms`,
            );
            observer.observe(el);
            el.dataset.scrollState = "pending";
          }
        });
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(scan);
      };
      const mutation = new MutationObserver(schedule);
      mutation.observe(document.getElementById("main") || document.body, {
        childList: true,
        subtree: true,
      });
      const onFocus = (event: FocusEvent) => {
        let el = event.target as HTMLElement | null;
        while (el) {
          if (el.dataset.scrollState === "pending") {
            el.dataset.scrollState = "revealed";
            observer.unobserve(el);
          }
          el = el.parentElement;
        }
      };
      document.addEventListener("focusin", onFocus);
      window.addEventListener("resize", schedule);
      scan();
      dispose = () => {
        observer.disconnect();
        mutation.disconnect();
        cancelAnimationFrame(frame);
        document.removeEventListener("focusin", onFocus);
        window.removeEventListener("resize", schedule);
        for (const el of enhanced) {
          delete el.dataset.scrollState;
          el.style.removeProperty("--reveal-delay");
        }
      };
    };
    start();
    preference.addEventListener("change", start);
    return () => {
      dispose();
      preference.removeEventListener("change", start);
    };
  }, []);
  return null;
}
