"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchDoc {
  type: "notes" | "posts" | "projects" | "moments";
  title: string;
  summary: string;
  tags: string[];
  url: string;
  date?: string;
}

const GROUP_LABEL: Record<SearchDoc["type"], string> = {
  posts: "文章",
  notes: "笔记",
  moments: "说说",
  projects: "作品",
};

const GROUP_ORDER: SearchDoc["type"][] = ["posts", "notes", "moments", "projects"];

type Status = "idle" | "loading" | "ready" | "error";

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<any>(null);

  // 首次打开时才加载索引与 Fuse.js
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const [idxRes, { default: Fuse }] = await Promise.all([
          fetch("/search-index.json"),
          import("fuse.js"),
        ]);
        if (!idxRes.ok) throw new Error("index missing");
        const items: SearchDoc[] = await idxRes.json();
        // 说说来自数据库，运行时补齐
        try {
          const mRes = await fetch("/api/moments?limit=100");
          if (mRes.ok) {
            const data = await mRes.json();
            for (const m of data.items ?? []) {
              items.push({
                type: "moments",
                title: m.content?.slice(0, 40) ?? "说说",
                summary: m.content ?? "",
                tags: [],
                url: `/moments#moment-${m.id}`,
                date: m.created_at?.slice(0, 10),
              });
            }
          }
        } catch {
          /* 说说不可用时静默降级，不影响内容检索 */
        }
        if (cancelled) return;
        setDocs(items);
        fuseRef.current = new Fuse(items, {
          keys: [
            { name: "title", weight: 0.5 },
            { name: "summary", weight: 0.3 },
            { name: "tags", weight: 0.2 },
          ],
          threshold: 0.4,
          ignoreLocation: true,
          minMatchCharLength: 1,
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 防抖 150ms
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 150);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo<SearchDoc[]>(() => {
    if (!debounced) return [];
    if (!fuseRef.current) return docs.slice(0, 20);
    return fuseRef.current
      .search(debounced, { limit: 30 })
      .map((r: { item: SearchDoc }) => r.item);
  }, [debounced, docs]);

  const grouped = useMemo<
    { type: SearchDoc["type"]; label: string; items: SearchDoc[] }[]
  >(() => {
    return GROUP_ORDER.map((type) => ({
      type,
      label: GROUP_LABEL[type],
      items: results.filter((r) => r.type === type),
    })).filter((g) => g.items.length > 0);
  }, [results]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => setActive(0), [debounced]);

  // 焦点陷阱 + Esc 关闭
  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[active];
      if (target) window.location.href = target.url;
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const recent = docs.slice(0, 6);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="站内搜索"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] tablet:pt-[14vh]"
    >
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="glass-strong relative w-full max-w-reading overflow-hidden rounded-card"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、笔记、说说、作品…"
            className="w-full bg-transparent text-base outline-none placeholder:text-text-muted"
            aria-label="搜索关键词"
          />
          {status === "loading" && (
            <Loader2 className="h-4 w-4 animate-spin text-text-muted" strokeWidth={1.5} />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭搜索"
            className="rounded-control p-1 text-text-muted hover:text-text"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {status === "error" && (
            <p className="p-4 text-sm text-text-muted">
              搜索索引不可用，请稍后再试。
            </p>
          )}

          {status !== "error" && debounced && flat.length === 0 && (
            <div className="p-4">
              <p className="text-sm text-text-muted">没有找到相关内容，看看最近更新的？</p>
              <ul className="mt-3 space-y-1">
                {recent.map((d) => (
                  <li key={d.url}>
                    <Link
                      href={d.url}
                      onClick={onClose}
                      className="block rounded-control px-2 py-2 text-sm hover:bg-surface"
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!debounced && status === "ready" && (
            <p className="p-4 text-sm text-text-muted">
              输入关键词开始检索，↑ ↓ 选择，Enter 打开，Esc 关闭。
            </p>
          )}

          {grouped.map((g) => (
            <section key={g.type} className="mb-2">
              <h2 className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-text-muted">
                {g.label}
              </h2>
              <ul>
                {g.items.map((item) => {
                  const index = flat.indexOf(item);
                  return (
                    <li key={item.url + index}>
                      <Link
                        href={item.url}
                        onClick={onClose}
                        data-index={index}
                        className={cn(
                          "flex items-baseline justify-between gap-3 rounded-control px-2 py-2",
                          index === active ? "bg-accent-soft" : "hover:bg-surface",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{item.title}</span>
                          {item.summary && (
                            <span className="block truncate text-xs text-text-muted">
                              {item.summary}
                            </span>
                          )}
                        </span>
                        {index === active && (
                          <CornerDownLeft
                            className="h-4 w-4 shrink-0 text-accent"
                            strokeWidth={1.5}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
