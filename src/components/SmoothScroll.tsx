"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/smooth-scroll";

/**
 * 首页平滑惯性滚动。
 *
 * 只在桌面端启用：移动端 iOS 自身惯性已经够好，触屏劫持会和地址栏收缩、
 * 触底回弹打架，还要吃掉性能预算。reduced-motion 时同样不开。
 *
 * Lenis 驱动的是原生 scrollTop（不是 transform），所以全站 fixed 的
 * 背景光斑层不受影响。
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia("(min-width: 834px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      anchors: true,
    });
    setLenis(lenis);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
