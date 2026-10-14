import Link from "next/link";
import { Tag } from "lucide-react";
import { getAllTags } from "@/lib/content";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { T } from "@/components/LangProvider";
import { cn } from "@/lib/utils";

export const metadata = { title: "标签" };

/** 按文章数分档的字号，做出云的感觉（不是随数量线性放大） */
function sizeOf(count: number, max: number) {
  if (count >= max) return "text-lg";
  if (count >= max / 2) return "text-base";
  return "text-sm";
}

export default function TagsPage() {
  const tags = getAllTags();
  const max = tags[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title={<T k="nav.tags" />}
        description={<T k="label.allTags" />}
      />
      {tags.length === 0 ? (
        <EmptyState>
          <T k="empty.tags" />
        </EmptyState>
      ) : (
        <div className="glass rounded-card p-6">
          <ul className="flex flex-wrap items-center gap-3">
            {tags.map((t) => (
              <li key={t.name}>
                <Link
                  href={`/tags/${encodeURIComponent(t.name)}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-pill bg-accent-soft px-3 py-1 text-accent transition-opacity hover:opacity-80",
                    sizeOf(t.count, max),
                  )}
                >
                  <Tag className="h-3.5 w-3.5 opacity-70" strokeWidth={1.5} />
                  {t.name}
                  <span className="text-xs opacity-70">{t.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
