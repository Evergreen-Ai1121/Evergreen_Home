"use client";

import { useEffect, useRef, useState } from "react";
import { ListTree, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/content";

/** 滚动跟随：进入视口顶部区段的标题即为当前章节 */
function useActiveId(items: TocItem[]): string {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const heads = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (heads.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        let best: { id: string; top: number } | null = null;
        for (const [id, top] of visible) {
          if (!best || top < best.top) best = { id, top };
        }
        if (best) setActiveId(best.id);
      },
      { rootMargin: "-96px 0px -66% 0px", threshold: 0 },
    );
    heads.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  return activeId;
}

export function TableOfContents({
  items,
  variant = "sidebar",
}: {
  items: TocItem[];
  variant?: "sidebar" | "floating";
}) {
  const activeId = useActiveId(items);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [open, setOpen] = useState(false);

  // 当前章节始终滚进可见区域（居中偏上），目录再长也不会跟丢
  useEffect(() => {
    const box = scrollRef.current;
    const el = itemRefs.current.get(activeId);
    if (!box || !el || box.clientHeight === 0) return;
    const target = el.offsetTop - (box.clientHeight - el.offsetHeight) / 2;
    box.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
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
      // self-start 很关键：grid 子项默认被拉伸到整行高度，sticky 就没有可移动空间了
      <aside className="sticky top-24 hidden self-start desktop:block" aria-label="目录">
        <p className="mb-3 pl-3 text-xs uppercase tracking-wide text-text-muted">目录</p>
        <div
          ref={scrollRef}
          className="no-scrollbar max-h-[calc(100dvh-12rem)] overflow-y-auto pr-1"
        >
          {list}
        </div>
      </aside>
    );
  }

  // 窄屏：左下角悬浮按钮 + 目录浮层（Frosti 的 MobileTOC 思路）
  return (
    <div className="desktop:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "关闭目录" : "打开目录"}
        className="fixed bottom-24 left-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border bg-surface-strong text-text-muted shadow-glass backdrop-blur transition-colors hover:text-accent tablet:bottom-8 tablet:left-8"
      >
        {open ? (
          <X className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <ListTree className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <div
          className="glass-strong fixed bottom-40 left-4 z-40 w-64 animate-fade-up rounded-card p-4 tablet:bottom-24 tablet:left-8"
          aria-label="目录"
        >
          <p className="mb-3 pl-3 text-xs uppercase tracking-wide text-text-muted">目录</p>
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
