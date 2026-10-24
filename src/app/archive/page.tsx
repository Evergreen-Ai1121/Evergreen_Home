import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { getAllDocs, type DocMeta } from "@/lib/content";
import { hrefOf } from "@/lib/doc";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { T } from "@/components/LangProvider";
import { LocalDate } from "@/components/LocalDate";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata(
  "归档",
  "按时间浏览项目与技术写作。",
  "/archive",
);

const TYPE_LABEL = {
  posts: "nav.posts",
  notes: "nav.notes",
  projects: "nav.projects",
} as const;

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
        <EmptyState>
          <T k="empty.content" />
        </EmptyState>
      ) : (
        <div className="desktop:grid desktop:grid-cols-[1fr_160px] desktop:gap-10">
          <div className="space-y-10">
            {/* 整年一组一起弹：Reveal 渲染 div，不能塞进 <ul> 里去包 <li> */}
            {groups.map(([year, items], i) => (
              <Reveal key={year} index={i}>
                <section id={`year-${year}`} className="scroll-mt-24">
                  <h2 className="mb-3 text-sm font-medium text-text-muted">
                    {year}
                  </h2>
                  <ul className="space-y-1">
                    {items.map((d) => (
                      <li key={`${d.type}-${d.slug}`}>
                        <Link
                          href={hrefOf(d)}
                          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control px-2 py-2 transition-colors hover:bg-surface"
                        >
                          <LocalDate
                            date={d.date}
                            variant="monthDay"
                            className="text-xs text-text-muted"
                          />
                          <span
                            className={cn(
                              "rounded-pill px-2 py-0.5 text-[11px]",
                              TYPE_STYLE[d.type],
                            )}
                          >
                            <T k={TYPE_LABEL[d.type]} />
                          </span>
                          <span className="min-w-0 flex-1 text-[15px]">
                            {d.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
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
