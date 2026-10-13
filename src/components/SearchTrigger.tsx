"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "./SearchProvider";

export function SearchTrigger({
  className,
  withHint = false,
}: {
  className?: string;
  withHint?: boolean;
}) {
  const { open } = useSearch();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="搜索"
      className={cn(
        "group inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-2",
        "text-text-muted backdrop-blur transition-colors duration-150 hover:bg-surface-strong hover:text-text",
        className,
      )}
    >
      <Search className="h-4 w-4" strokeWidth={1.5} />
      {withHint && (
        <span className="hidden text-sm desktop:inline">
          搜索<kbd className="ml-2 rounded border border-border px-1 text-xs">⌘K</kbd>
        </span>
      )}
    </button>
  );
}
