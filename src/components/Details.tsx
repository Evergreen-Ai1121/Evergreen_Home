import { ChevronRight } from "lucide-react";

/**
 * MDX 折叠块：`<Details summary="展开看完整日志">…</Details>`
 * 用原生 `<details>`，无 JS 也能展开，里面可以放任意 MDX 内容。
 */
export function Details({
  summary,
  open = false,
  children,
}: {
  summary: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={open}
      className="group my-6 rounded-card border border-border bg-surface px-4 py-3"
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium marker:hidden">
        <ChevronRight
          className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 group-open:rotate-90"
          strokeWidth={1.5}
        />
        {summary}
      </summary>
      <div className="mt-3 border-t border-border pt-3 text-[15px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </details>
  );
}
