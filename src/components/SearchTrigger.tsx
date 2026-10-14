"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "./SearchProvider";
import { useLang } from "./LangProvider";

export function SearchTrigger({
  className,
  withHint = false,
}: {
  className?: string;
  withHint?: boolean;
}) {
  const { open } = useSearch();
  const { t } = useLang();
  const label = t("action.search");
  // 带提示时可见文案是「搜索 ⌘K」，无障碍名称要把它说全，否则会被判 label-content-name-mismatch
  const name = withHint ? `${label} ⌘K` : label;
  return (
    <button
      type="button"
      onClick={open}
      aria-label={name}
      title={name}
      className={cn(
        "group inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-2",
        "text-text-muted backdrop-blur transition-colors duration-150 hover:bg-surface-strong hover:text-text",
        className,
      )}
    >
      <Search className="h-4 w-4" strokeWidth={1.5} />
      {withHint && (
        <span className="hidden text-sm desktop:inline">
          {label}
          <kbd className="ml-2 rounded border border-border px-1 text-xs">⌘K</kbd>
        </span>
      )}
    </button>
  );
}
