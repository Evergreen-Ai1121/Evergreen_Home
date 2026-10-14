import Link from "next/link";
import { getCollection, getCategories, getTags, type DocMeta } from "@/lib/content";
import { NoteItem } from "@/components/Cards";
import { Pagination } from "@/components/Pagination";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { T } from "@/components/LangProvider";
import { cn } from "@/lib/utils";

export const metadata = { title: "笔记" };

const PAGE_SIZE = 20;

function groupByYear(items: DocMeta[]): { year: string; items: DocMeta[] }[] {
  const map = new Map<string, DocMeta[]>();
  for (const d of items) {
    const year = d.date.slice(0, 4) || "未标日期";
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(d);
  }
  return [...map.entries()]
    .map(([year, list]) => ({ year, items: list }))
    .sort((a, b) => (a.year < b.year ? 1 : -1));
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; page?: string }>;
}) {
  const { category, tag, page: raw } = await searchParams;
  const all = getCollection("notes");
  const categories = getCategories("notes");
  const tags = getTags("notes");

  const filtered = all.filter(
    (d) => (!category || d.category === category) && (!tag || d.tags.includes(tag)),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(raw) || 1), totalPages);
  const grouped = groupByYear(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

  const href = (n: number) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (tag) q.set("tag", tag);
    q.set("page", String(n));
    return `/notes?${q}`;
  };

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title={<T k="nav.notes" />}
        description={<T k="desc.notes" />}
      />

      <div className="mb-8 space-y-4">
        <FilterRow label="分类" active={category} param="category">
          {categories.map((c) => ({ value: c.name, label: `${c.name} (${c.count})` }))}
        </FilterRow>
        <FilterRow label="标签" active={tag} param="tag">
          {tags.map((t) => ({ value: t.name, label: `#${t.name} (${t.count})` }))}
        </FilterRow>
      </div>

      {grouped.length === 0 ? (
        <EmptyState>这个分类下还没有笔记，换个筛选条件看看。</EmptyState>
      ) : (
        <>
          <div className="space-y-10">
            {grouped.map((group) => (
              <section key={group.year}>
                <h2 className="mb-3 text-sm font-medium text-text-muted">{group.year}</h2>
                <div className="space-y-3">
                  {group.items.map((doc) => (
                    <NoteItem key={doc.slug} doc={doc} />
                  ))}
                </div>
              </section>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} href={href} />
        </>
      )}
    </div>
  );
}

function FilterRow({
  label,
  active,
  param,
  children,
}: {
  label: string;
  active?: string;
  param: string;
  children: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-muted">{label}</span>
      <Link
        href="/notes"
        className={cn(
          "rounded-pill border border-border px-3 py-1 text-xs transition-colors",
          !active ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text",
        )}
      >
        全部
      </Link>
      {children.map((item) => (
        <Link
          key={item.value}
          href={`/notes?${param}=${encodeURIComponent(item.value)}`}
          className={cn(
            "rounded-pill border border-border px-3 py-1 text-xs transition-colors",
            active === item.value
              ? "bg-accent-soft text-accent"
              : "text-text-muted hover:text-text",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
