import Link from "next/link";
import { getAllDocs, type DocMeta } from "@/lib/content";
import { hrefOf } from "@/lib/doc";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { T } from "@/components/LangProvider";
import { cn } from "@/lib/utils";

export const metadata = { title: "归档" };

const TYPE_LABEL: Record<DocMeta["type"], string> = {
  posts: "文章",
  notes: "笔记",
  projects: "作品",
};

const TYPE_STYLE: Record<DocMeta["type"], string> = {
  posts: "bg-accent-soft text-accent",
  notes: "bg-surface-strong text-text-muted",
  projects: "bg-accent-soft text-accent",
};

function groupByYear(docs: DocMeta[]) {
  const map = new Map<string, DocMeta[]>();
  for (const d of docs) {
    const year = d.date.slice(0, 4) || "未标日期";
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(d);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default function ArchivePage() {
  const groups = groupByYear(getAllDocs());
  const total = groups.reduce((n, [, items]) => n + items.length, 0);

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title={<T k="nav.archive" />}
        description={<T k="archive.summary" values={{ n: total }} />}
      />

      {groups.length === 0 ? (
        <EmptyState>还没有内容。</EmptyState>
      ) : (
        <div className="desktop:grid desktop:grid-cols-[1fr_160px] desktop:gap-10">
          <div className="space-y-10">
            {groups.map(([year, items]) => (
              <section key={year} id={`year-${year}`} className="scroll-mt-24">
                <h2 className="mb-3 text-sm font-medium text-text-muted">{year}</h2>
                <ul className="space-y-1">
                  {items.map((d) => (
                    <li key={`${d.type}-${d.slug}`}>
                      <Link
                        href={hrefOf(d)}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control px-2 py-2 transition-colors hover:bg-surface"
                      >
                        <time className="text-xs text-text-muted" dateTime={d.date}>
                          {d.date.slice(5)}
                        </time>
                        <span
                          className={cn(
                            "rounded-pill px-2 py-0.5 text-[11px]",
                            TYPE_STYLE[d.type],
                          )}
                        >
                          {TYPE_LABEL[d.type]}
                        </span>
                        <span className="min-w-0 flex-1 text-[15px]">{d.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <nav aria-label="年份" className="hidden desktop:block">
            <div className="sticky top-24 space-y-1">
              <p className="mb-2 pl-3 text-xs uppercase tracking-wide text-text-muted">
                <T k="label.year" />
              </p>
              {groups.map(([year]) => (
                <a
                  key={year}
                  href={`#year-${year}`}
                  className="block rounded-control px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  {year}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
