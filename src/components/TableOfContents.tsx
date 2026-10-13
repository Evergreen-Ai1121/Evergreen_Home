"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
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
  variant?: "sidebar" | "inline";
}) {
  const activeId = useActiveId(items);
  if (items.length === 0) return null;

  const list = (
    <ul className="relative space-y-1 border-l border-border text-sm">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <li key={item.id} className="relative">
            {/* 进度指示：当前章节左侧的高亮竖条 */}
            <span
              aria-hidden
              className={cn(
                "absolute -left-px top-1 h-5 w-0.5 rounded-pill transition-colors duration-200",
                active ? "bg-accent" : "bg-transparent",
              )}
            />
            <a
              href={`#${item.id}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "block rounded-control py-1 pr-2 transition-colors duration-200",
                item.depth === 3 ? "pl-7" : "pl-3",
                active
                  ? "text-accent"
                  : "text-text-muted [@media(hover:hover)]:hover:text-text",
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
      <aside className="sticky top-24 hidden desktop:block" aria-label="目录">
        <p className="mb-3 text-xs uppercase tracking-wide text-text-muted">目录</p>
        {list}
      </aside>
    );
  }

  return (
    <details className="glass mb-6 rounded-card px-4 py-3 desktop:hidden">
      <summary className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
        <ListTree className="h-4 w-4" strokeWidth={1.5} />
        目录
      </summary>
      <div className="mt-3">{list}</div>
    </details>
  );
}
