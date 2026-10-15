"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * 滚动进场：元素滚入视口时弹簧弹出。
 *
 * 阻尼比约 0.56 —— 会过冲约 12% 再回弹，就是那个"duang"的手感，约 0.6s 收敛。
 * 只动 opacity 和 transform，绝不改布局尺寸，否则会破坏 CLS=0。
 */
const SPRING = { type: "spring", stiffness: 320, damping: 18, mass: 0.8 } as const;

/** 同一组内相邻元素的错峰间隔（秒） */
const STAGGER = 0.07;

/** 错峰序号封顶：归档页一个年份下可能十几条，不封顶的话最后几条要等 1 秒以上才弹 */
const STAGGER_MAX = 8;

export function Reveal({
  children,
  index = 0,
  className,
  variant = "fade",
}: {
  children: ReactNode;
  /** 同一组里的序号，用来算错峰延迟 */
  index?: number;
  className?: string;
  /**
   * fade = 淡入+上浮（默认）：用在确定不是 LCP 元素的地方（列表卡片等）。
   * rise = 只上浮不淡入：SSR 时元素就可见。大文本块（文章正文、说说正文）
   * 一旦淡入，LCP 要等 JS 水合+动画开始才计数，实测会把移动端 LCP 从 2s 推到 4.3s。
   * "duang"的弹簧过冲在位移上，rise 观感几乎一样。
   */
  variant?: "fade" | "rise";
}) {
  const reduced = useReducedMotion();

  // 用户要求减少动效时直接可见：不做位移、不做淡入，避免元素卡在透明状态
  if (reduced) return <div className={className}>{children}</div>;

  const initial = variant === "rise" ? { y: 20 } : { opacity: 0, y: 20 };
  const target = variant === "rise" ? { y: 0 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={target}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ ...SPRING, delay: Math.min(index, STAGGER_MAX) * STAGGER }}
    >
      {children}
    </motion.div>
  );
}
