import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** 生成页码序列，超过 7 页时用省略号收拢中间部分 */
function pageNumbers(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

const itemCls =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-control border border-border px-2 text-sm transition-colors";

export function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  /** 生成第 n 页的链接（保留筛选参数） */
  href: (n: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="分页" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(itemCls, "hover:bg-surface-strong")} rel="prev">
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">上一页</span>
        </Link>
      ) : (
        <span className={cn(itemCls, "opacity-40")} aria-hidden>
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </span>
      )}

      {pageNumbers(page, totalPages).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-text-muted">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              itemCls,
              n === page ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface-strong hover:text-text",
            )}
          >
            {n}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(itemCls, "hover:bg-surface-strong")} rel="next">
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">下一页</span>
        </Link>
      ) : (
        <span className={cn(itemCls, "opacity-40")} aria-hidden>
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      )}
    </nav>
  );
}
