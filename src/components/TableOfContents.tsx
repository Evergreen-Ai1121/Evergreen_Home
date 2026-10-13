"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/content";

function useActiveId(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  useEffect(() => {
    if (items.length === 0) return;
    const heads = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const onScroll = () => {
      let current = heads[0]?.id ?? "";
      for (const h of heads) {
        if (h.getBoundingClientRect().top - 120 <= 0) current = h.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? "pl-4" : undefined}>
          <a
            href={`#${item.id}`}
            className={cn(
              "block rounded-control py-1 transition-colors",
              activeId === item.id
                ? "text-accent"
                : "text-text-muted [@media(hover:hover)]:hover:text-text",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "sidebar") {
    return (
      <aside className="sticky top-24 hidden wide:block" aria-label="目录">
        <p className="mb-3 text-xs uppercase tracking-wide text-text-muted">目录</p>
        {list}
      </aside>
    );
  }

  return (
    <details className="glass mb-6 rounded-card px-4 py-3 wide:hidden">
      <summary className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
        <ListTree className="h-4 w-4" strokeWidth={1.5} />
        目录
      </summary>
      <div className="mt-3">{list}</div>
    </details>
  );
}
