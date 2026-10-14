"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "./LangProvider";

/**
 * 列表页的标签筛选条：选中态显示「清除筛选」，未选中显示全部标签。
 * 命中仍在 URL 上（?tag=），方便分享与前进后退。
 */
export function TagFilter({
  basePath,
  tags,
  active,
}: {
  basePath: string;
  tags: { name: string; count: number }[];
  active?: string;
}) {
  const { t } = useLang();
  if (tags.length === 0) return null;

  const chip =
    "rounded-pill border border-border px-3 py-1 text-xs transition-colors";

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-muted">{t("label.tags")}</span>
      <Link
        href={basePath}
        className={cn(
          chip,
          !active ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text",
        )}
      >
        {t("action.all")}
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`${basePath}?tag=${encodeURIComponent(tag.name)}`}
          className={cn(
            chip,
            active === tag.name
              ? "bg-accent-soft text-accent"
              : "text-text-muted hover:text-text",
          )}
        >
          #{tag.name} ({tag.count})
        </Link>
      ))}
      {active && (
        <Link
          href={basePath}
          className={cn(chip, "inline-flex items-center gap-1 text-text-muted hover:text-accent")}
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t("action.clearFilter")}
        </Link>
      )}
    </div>
  );
}
