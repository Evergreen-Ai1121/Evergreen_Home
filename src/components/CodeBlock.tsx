"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** 超过这么多行就折叠，避免长代码块一屏放不下 */
const COLLAPSE_LINES = 30;

/**
 * 代码块外壳：语言标签 + 复制 + 行号 + 超长折叠。
 *
 * 语言与行数只能从 rehype-pretty-code 渲染出的 DOM 上读（它在 code 上写 data-language，
 * 每一行是一个 [data-line]），所以走挂载后读 DOM，不去改 MDX 管线。
 */
export function CodeBlock({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lang, setLang] = useState<string | null>(null);
  const [lines, setLines] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = preRef.current?.querySelector("code");
    setLang(code?.getAttribute("data-language") ?? null);
    setLines(code?.querySelectorAll("[data-line]").length ?? 0);
  }, [children]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const collapsible = lines > COLLAPSE_LINES;
  const collapsed = collapsible && !expanded;

  const copy = async () => {
    const code = preRef.current?.querySelector("code");
    if (!code) return;
    // code 内部是 grid 布局，整体 textContent 会把换行吃掉，只能逐行拼
    const rows = code.querySelectorAll("[data-line]");
    const text = rows.length
      ? Array.from(rows, (n) => n.textContent ?? "").join("\n")
      : (code.textContent ?? "");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 非 HTTPS 或剪贴板被拒绝时不打扰用户 */
    }
  };

  const btn =
    "inline-flex h-11 w-11 items-center justify-center rounded-control border border-border bg-surface text-text-muted transition-colors hover:text-accent";

  return (
    <div className="code-lines relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
        {lang && (
          <span className="rounded-pill border border-border bg-surface px-2 py-0.5 text-[11px] uppercase tracking-wide text-text-muted">
            {lang}
          </span>
        )}
        <button type="button" onClick={copy} aria-label="复制代码" className={btn}>
          {copied ? (
            <Check className="h-4 w-4 text-accent" strokeWidth={1.5} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      <pre
        ref={preRef}
        {...rest}
        className={cn(className, collapsed && "max-h-[320px] overflow-hidden")}
      >
        {children}
      </pre>

      {collapsed && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-card bg-gradient-to-t from-bg to-transparent"
        />
      )}

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="absolute inset-x-0 bottom-0 flex min-h-11 items-center justify-center gap-1 rounded-b-card border-t border-border bg-surface text-xs text-text-muted backdrop-blur transition-colors hover:text-accent"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            strokeWidth={1.5}
          />
          {expanded ? "收起" : `展开全部 ${lines} 行`}
        </button>
      )}
    </div>
  );
}
