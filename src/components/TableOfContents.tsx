"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ListTree, X } from "lucide-react";
import { useLang } from "./LangProvider";
import { trapTab } from "@/lib/focus";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/content";

/**
 * 标题越过这条线就算进入"当前章节"。必须略大于 html 的 scroll-padding-top（88px），
 * 否则点击目录跳过去后，标题停在 88px 仍在线下方，解锁时高亮会退回上一节。
 *
 * 注意：不要给 .prose h2/h3 再加 scroll-margin-top —— 它会和 scroll-padding-top 相加，
 * 让标题落位掉到 184px。
 */
const TOP_LINE = 108;
/** 点击目录后，滚动停止多久解除高亮锁定 */
const UNLOCK_IDLE_MS = 120;

/**
 * 滚动跟随：实时测量每个标题的位置，取最后一个越过顶线的。
 *
 * 不用 IntersectionObserver —— 它只在跨越阈值时回调，拿到的 top 是过期快照，
 * 会出现高亮卡死、文末小节高亮不到、快速滚动错乱。
 */
function useActiveId(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const locked = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = useCallback(() => {
    if (items.length === 0 || locked.current) return;

    // 滚到底部时，最后几个小节永远越不过顶线，直接判给最后一个
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
      setActiveId(items[items.length - 1]!.id);
      return;
    }

    let current = items[0]!.id;
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top > TOP_LINE) break;
      current = item.id;
    }
    setActiveId(current);
  }, [items]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (locked.current) {
        // 平滑滚动期间不跟随，滚动停下后再恢复
        if (unlockTimer.current) clearTimeout(unlockTimer.current);
        unlockTimer.current = setTimeout(() => {
          locked.current = false;
          measure();
        }, UNLOCK_IDLE_MS);
        return;
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  /** 点击目录项：立刻高亮并在滚动期间锁定，避免高亮一路扫过中间章节 */
  const jump = useCallback((id: string) => {
    locked.current = true;
    setActiveId(id);
    history.replaceState(null, "", `#${id}`);
  }, []);

  return { activeId, jump };
}

export function TableOfContents({
  items,
  variant = "sidebar",
}: {
  items: TocItem[];
  variant?: "sidebar" | "floating";
}) {
  const { t } = useLang();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { activeId, jump } = useActiveId(items);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") trapTab(event, dialogRef.current);
    };
    const resize = () => {
      if (window.innerWidth >= 1280) setOpen(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      triggerRef.current?.focus();
    };
  }, [open]);

  // 当前章节滚出目录可视区时才滚动，且平滑过渡
  useEffect(() => {
    const box = scrollRef.current;
    const el = itemRefs.current.get(activeId);
    if (!box || !el || box.clientHeight === 0) return;

    // 用 rect 反推「元素在滚动内容坐标系里的位置」：
    // 不能用 el.offsetTop —— <li> 是 relative，<a> 的 offsetParent 会是 li 而不是滚动容器，
    // 量出来恒为 0，判定永远不触发（手动滚过目录后还会被弹回顶部）。
    const boxTop = box.getBoundingClientRect().top;
    const elRect = el.getBoundingClientRect();
    const top = elRect.top - boxTop + box.scrollTop;
    const bottom = top + elRect.height;

    const outOfView =
      top < box.scrollTop || bottom > box.scrollTop + box.clientHeight;
    if (!outOfView) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    box.scrollTo({
      top: Math.max(0, top - (box.clientHeight - elRect.height) / 2),
      behavior: reduced ? "auto" : "smooth",
    });
  }, [activeId, open]);

  if (items.length === 0) return null;

  const list = (
    <ul className="space-y-0.5 text-sm">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <li key={item.id} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-pill bg-accent transition-opacity duration-200",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <a
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node);
                else itemRefs.current.delete(item.id);
              }}
              href={`#${item.id}`}
              onClick={() => {
                jump(item.id);
                if (variant === "floating") setOpen(false);
              }}
              title={item.text}
              aria-current={active ? "location" : undefined}
              className={cn(
                "block truncate rounded-control py-1.5 pr-2 transition-colors duration-200",
                item.depth === 3 ? "pl-6 text-[13px]" : "pl-3",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-muted [@media(hover:hover)]:hover:bg-surface [@media(hover:hover)]:hover:text-text",
              )}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (variant === "sidebar") {
    return (
      // Sticky rail stays inside the article grid; no viewport-width formulas.
      <aside
        className="toc-rail z-30 hidden desktop:block"
        aria-label={t("label.toc")}
      >
        {/* 卡片化：和正文一样是一块玻璃面板，而不是裸列表 */}
        <div className="glass rounded-card p-4">
          <p className="mb-3 pl-1 text-xs uppercase tracking-wide text-text-muted">
            {t("label.toc")}
          </p>
          <div
            ref={scrollRef}
            className="no-scrollbar relative max-h-[calc(100dvh-14rem)] overflow-y-auto pr-1"
          >
            {list}
          </div>
        </div>
      </aside>
    );
  }

  // 窄屏：左下角悬浮按钮 + 目录浮层（Frosti 的 MobileTOC 思路）
  return (
    <div className="desktop:hidden">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t("ui.closeToc") : t("ui.openToc")}
        className="fixed bottom-6 left-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-pill border border-border bg-surface-strong text-text-muted shadow-glass backdrop-blur transition-colors hover:text-accent tablet:bottom-8 tablet:left-8"
      >
        {open ? (
          <X className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <ListTree className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          className="glass-strong fixed bottom-24 left-4 z-40 w-64 animate-fade-up rounded-card p-4 tablet:bottom-24 tablet:left-8"
          aria-label={t("label.toc")}
        >
          <p className="mb-3 pl-3 text-xs uppercase tracking-wide text-text-muted">
            {t("label.toc")}
          </p>
          <div
            ref={scrollRef}
            className="no-scrollbar max-h-[50dvh] overflow-y-auto pr-1"
          >
            {list}
          </div>
        </div>
      )}
    </div>
  );
}
