import Link from "next/link";
import { getCollection } from "@/lib/content";
import { pageNumber } from "@/lib/content-rules";
import { pageMetadata } from "@/lib/metadata";
import { ProjectExhibit, EmptyProjects } from "@/components/Exhibit";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { T } from "@/components/LangProvider";
export const metadata = pageMetadata(
  "项目",
  "AI 应用与全栈开发的项目实践与案例。",
  "/projects",
);
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const query = await searchParams;
  const all = getCollection("projects");
  const filter = all.length >= 6;
  const category = filter ? query.category : undefined;
  const categories = [...new Set(all.map((p) => p.projectCategory))];
  const filtered = all.filter(
    (p) => !category || p.projectCategory === category,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 9));
  const page = pageNumber(query.page, totalPages);
  const projects = filtered.slice((page - 1) * 9, page * 9);
  const href = (n: number, cat = category) =>
    "/projects?" +
    new URLSearchParams({ ...(cat ? { category: cat } : {}), page: String(n) });
  return (
    <div className="listing-page">
      <p className="eyebrow mb-5">SELECTED WORK / EXPERIMENTS</p>
      <PageHeader
        title={<T k="projects.title" />}
        description={<T k="projects.desc" />}
      />
      {filter && (
        <nav aria-label="Project categories" className="filter-tabs mb-8">
          <Link href="/projects" className={!category ? "active" : ""}>
            <T k="action.all" />
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={href(1, c)}
              className={category === c ? "active" : ""}
            >
              <T
                k={
                  c === "ai"
                    ? "projects.ai"
                    : c === "fullstack"
                      ? "projects.fullstack"
                      : "projects.other"
                }
              />
            </Link>
          ))}
        </nav>
      )}
      {projects.length ? (
        <div
          className={
            projects.length === 1 ? "project-grid single" : "project-grid"
          }
        >
          {projects.map((p, i) => (
            <ProjectExhibit doc={p} key={p.slug} index={i} large={i === 0} />
          ))}
        </div>
      ) : all.length ? (
        <EmptyState>
          <T k="blog.empty" />
        </EmptyState>
      ) : (
        <EmptyProjects />
      )}
      <Pagination page={page} totalPages={totalPages} href={href} />
    </div>
  );
}
