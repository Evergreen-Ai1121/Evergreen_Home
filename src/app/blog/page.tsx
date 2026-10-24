import Link from "next/link";
import { getAllDocs } from "@/lib/content";
import { blogHref, pageNumber } from "@/lib/content-rules";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { WritingRow } from "@/components/Exhibit";
import { Pagination } from "@/components/Pagination";
import { T } from "@/components/LangProvider";
export const metadata = pageMetadata(
  "博客 · 实践与思考",
  "AI 与全栈方向的技术实践、笔记与学习记录。",
  "/blog",
);
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    tag?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const query = await searchParams;
  const type =
    query.type === "posts" || query.type === "notes" ? query.type : undefined;
  const all = getAllDocs().filter((d) => d.type !== "projects");
  const tags = [...new Set(all.flatMap((d) => d.tags))].sort((a, b) =>
    a.localeCompare(b, "zh"),
  );
  const categories = [
    ...new Set(
      all.map((d) => d.category).filter((v): v is string => Boolean(v)),
    ),
  ];
  const filtered = all.filter(
    (d) =>
      (!type || d.type === type) &&
      (!query.tag || d.tags.includes(query.tag)) &&
      (!query.category || d.category === query.category),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const page = pageNumber(query.page, totalPages);
  const base = { type, tag: query.tag, category: query.category };
  return (
    <div className="listing-page">
      <p className="eyebrow mb-5">WRITING / LEARNING IN PUBLIC</p>
      <PageHeader
        title={<T k="blog.title" />}
        description={<T k="blog.desc" />}
      />
      <div className="blog-toolbar">
        <nav aria-label="Content type" className="filter-tabs">
          {[undefined, "posts", "notes"].map((value) => (
            <Link
              key={value || "all"}
              href={blogHref({ ...base, type: value })}
              aria-current={type === value ? "page" : undefined}
              className={type === value ? "active" : ""}
            >
              <T
                k={
                  value === "posts"
                    ? "nav.posts"
                    : value === "notes"
                      ? "nav.notes"
                      : "blog.all"
                }
              />
            </Link>
          ))}
        </nav>
        <span className="text-xs text-text-muted">
          <T k="blog.language" />
        </span>
      </div>
      <div className="filter-area">
        <div className="filter-row">
          <span className="filter-label">
            <T k="label.tags" />
          </span>
          <Link
            className={!query.tag ? "filter-chip active" : "filter-chip"}
            href={blogHref({ ...base, tag: undefined })}
          >
            <T k="action.all" />
          </Link>
          {tags.map((tag) => (
            <Link
              className={
                query.tag === tag ? "filter-chip active" : "filter-chip"
              }
              key={tag}
              href={blogHref({ ...base, tag })}
            >
              {tag}
            </Link>
          ))}
        </div>
        {categories.length > 0 && (
          <div className="filter-row">
            <span className="filter-label">
              <T k="label.category" />
            </span>
            <Link
              className={!query.category ? "filter-chip active" : "filter-chip"}
              href={blogHref({ ...base, category: undefined })}
            >
              <T k="action.all" />
            </Link>
            {categories.map((category) => (
              <Link
                className={
                  query.category === category
                    ? "filter-chip active"
                    : "filter-chip"
                }
                key={category}
                href={blogHref({ ...base, category })}
              >
                {category}
              </Link>
            ))}
          </div>
        )}
      </div>
      {filtered.length ? (
        filtered
          .slice((page - 1) * 10, page * 10)
          .map((doc) => <WritingRow key={doc.type + doc.slug} doc={doc} />)
      ) : (
        <EmptyState>
          <T k="blog.empty" />
          <Link href="/blog" className="text-link mx-auto mt-4 w-fit">
            <T k="action.clearFilter" />
          </Link>
        </EmptyState>
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        href={(n) => blogHref({ ...base, page: n })}
      />
    </div>
  );
}
