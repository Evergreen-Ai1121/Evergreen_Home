"use client";

import { useEffect, useState } from "react";

/**
 * 阅读进度条。仅窄屏显示（桌面已有侧栏目录），贴在视口最顶端。
 * 进度按整页滚动高度计算，不是文章容器 —— 底部评论与页脚也应计入。
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max <= 0 ? 0 : Math.min(100, (window.scrollY / max) * 100));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 desktop:hidden"
      style={{ background: "var(--c-border)" }}
    >
      <div
        className="h-full bg-accent transition-[width] duration-100 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
