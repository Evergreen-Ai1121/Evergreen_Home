"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** 回到顶部：滚动超过一屏后出现，移动端避开底部标签栏 */
export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="回到顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border bg-surface-strong text-text-muted shadow-glass backdrop-blur transition-all duration-200 hover:text-accent tablet:bottom-8 tablet:right-8 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
}
