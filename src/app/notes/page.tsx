import Link from "next/link";
import { getArchive, getCategories, getCollection, getTags } from "@/lib/content";
import { NoteItem } from "@/components/Cards";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

export const metadata = { title: "笔记" };

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const all = getCollection("notes");
  const categories = getCategories("notes");
  const tags = getTags("notes");

  const filtered = all.filter(
    (d) => (!category || d.category === category) && (!tag || d.tags.includes(tag)),
  );

  const filteredUrls = new Set(filtered.map((d) => `${d.type}/${d.slug}`));
  const grouped = getArchive("notes")
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => filteredUrls.has(`${i.type}/${i.slug}`)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title="笔记"
        description="整理过的、可以反复查阅的东西。按分类与标签组织，按年份归档。"
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
