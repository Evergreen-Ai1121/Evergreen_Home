"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "./LangProvider";
import type { DictKey } from "@/lib/i18n";
import { trapTab } from "@/lib/focus";

export interface SearchDoc {
  type: "notes" | "posts" | "projects";
  title: string;
  summary: string;
  tags: string[];
  url: string;
  date?: string;
  /** 正文全文（构建期 stripMarkdown，截断 3000 字），搜正文用；说说没有 */
  body?: string;
}

/** 一条命中结果：原文 + 可选的高亮片段 */
interface Result {
  doc: SearchDoc;
  snippet: React.ReactNode | null;
}

type Range = readonly [number, number];
interface FuseMatch {
  key?: string;
  indices: Range[];
}

/** 片段窗口：命中位置前后各留这么多字符 */
const WINDOW = 60;

const GROUP_LABEL: Record<SearchDoc["type"], DictKey> = {
  posts: "nav.posts",
  notes: "nav.notes",
  projects: "nav.projects",
};

const GROUP_ORDER: SearchDoc["type"][] = ["posts", "notes", "projects"];

type Status = "idle" | "loading" | "ready" | "error";

/* ── 命中片段：把 Fuse 给的区间合并后提取窗口并高亮 ───────── */

/** 相邻的命中（间隔 ≤2 字符）合成一段，避免出来一堆零碎的 <mark> */
function mergeRanges(indices: Range[]): [number, number][] {
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const [s, e] of sorted) {
    const last = out[out.length - 1];
    if (last && s - last[1] <= 2) last[1] = Math.max(last[1], e);
    else out.push([s, e]);
  }
  return out;
}

function withMarks(text: string, ranges: [number, number][]) {
  const nodes: React.ReactNode[] = [];
  let pos = 0;
  for (const [s, e] of ranges) {
    const start = Math.max(pos, s);
    const end = Math.min(text.length, e + 1);
    if (start > pos) nodes.push(text.slice(pos, start));
    nodes.push(
      <mark
        key={`${start}-${end}`}
        className="rounded bg-accent-soft px-0.5 text-accent"
      >
        {text.slice(start, end)}
      </mark>,
    );
    pos = end;
  }
  if (pos < text.length) nodes.push(text.slice(pos));
  return nodes;
}

/** 优先从正文取片段（Fuse 的 body 匹配），没有就退回摘要，再没有就不显示 */
function makeSnippet(
  doc: SearchDoc,
  matches: FuseMatch[],
): React.ReactNode | null {
  const bodyHit = matches.find((m) => m.key === "body" && m.indices.length > 0);
  if (bodyHit && doc.body) {
    const ranges = mergeRanges(bodyHit.indices);
    const first = ranges[0][0];
    const start = Math.max(0, first - WINDOW);
    const end = Math.min(doc.body.length, start + WINDOW * 3);
    const local = ranges
      .filter(([s, e]) => e >= start && s < end)
      .map(
        ([s, e]) =>
          [Math.max(0, s - start), Math.min(end, e - start)] as [
            number,
            number,
          ],
      );
    return (
      <>
        {start > 0 && "…"}
        {withMarks(doc.body.slice(start, end), local)}
        {end < doc.body.length && "…"}
      </>
    );
  }
  return null;
}

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
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
        if (cancelled) return;
        setDocs(items);
        // 权重：标题最高，其次标签与摘要，正文最低（但能命中标题里没有的词）
        fuseRef.current = new Fuse(items, {
          keys: [
            { name: "title", weight: 0.4 },
            { name: "tags", weight: 0.2 },
            { name: "summary", weight: 0.2 },
            { name: "body", weight: 0.2 },
          ],
          includeMatches: true,
          threshold: 0.35,
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

  const results = useMemo<Result[]>(() => {
    if (!debounced) return [];
    if (!fuseRef.current)
      return docs.slice(0, 20).map((doc) => ({ doc, snippet: null }));
    return fuseRef.current
      .search(debounced, { limit: 30 })
      .map((r: { item: SearchDoc; matches?: FuseMatch[] }) => ({
        doc: r.item,
        snippet: makeSnippet(r.item, r.matches ?? []),
      }));
  }, [debounced, docs]);

  const grouped = useMemo<
    { type: SearchDoc["type"]; label: string; items: Result[] }[]
  >(() => {
    return GROUP_ORDER.map((type) => ({
      type,
      label: t(GROUP_LABEL[type]),
      items: results.filter((r) => r.doc.type === type),
    })).filter((g) => g.items.length > 0);
    // t 依赖：浮层开着切语言时分组标题也要跟着换
  }, [results, t]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => setActive(0), [debounced]);

  // 焦点陷阱 + Esc 关闭
  useEffect(() => {
    const restoreFocus = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") trapTab(e, dialogRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      restoreFocus?.focus();
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
      if (target) window.location.href = target.doc.url;
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
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("action.search")}
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
          <Search
            className="h-5 w-5 shrink-0 text-text-muted"
            strokeWidth={1.5}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full bg-transparent text-base outline-none placeholder:text-text-muted"
            aria-label={t("action.search")}
          />
          {status === "loading" && (
            <Loader2
              className="h-4 w-4 animate-spin text-text-muted"
              strokeWidth={1.5}
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("action.close")}
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-control p-1 text-text-muted hover:text-text"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {status === "error" && (
            <p className="p-4 text-sm text-text-muted">{t("search.error")}</p>
          )}

          {status !== "error" && debounced && flat.length === 0 && (
            <div className="p-4">
              <p className="text-sm text-text-muted">{t("search.empty")}</p>
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
            <p className="p-4 text-sm text-text-muted">{t("search.help")}</p>
          )}

          {grouped.map((g) => (
            <section key={g.type} className="mb-2">
              <h2 className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-text-muted">
                {g.label}
              </h2>
              <ul>
                {g.items.map((entry) => {
                  const item = entry.doc;
                  const index = flat.indexOf(entry);
                  return (
                    <li key={item.url + index}>
                      <Link
                        href={item.url}
                        onClick={onClose}
                        data-index={index}
                        className={cn(
                          "flex min-h-11 items-baseline justify-between gap-3 rounded-control px-2 py-2",
                          index === active
                            ? "bg-accent-soft"
                            : "hover:bg-surface",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm">
                            {item.title}
                          </span>
                          <span className="block truncate text-xs text-text-muted">
                            {entry.snippet ?? item.summary}
                          </span>
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
