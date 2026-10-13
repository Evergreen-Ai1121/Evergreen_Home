import { getCollection } from "@/lib/content";
import { ProjectCard } from "@/components/Cards";
import { Pagination } from "@/components/Pagination";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const metadata = { title: "作品集" };

const PAGE_SIZE = 9;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: raw } = await searchParams;
  const all = getCollection("projects");
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(raw) || 1), totalPages);
  const projects = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title="作品集"
        description="不只要说做了什么，还要说清楚遇到什么问题、怎么想的、我负责哪部分。"
      />
      {projects.length === 0 ? (
        <EmptyState>还没添加作品。</EmptyState>
      ) : (
        <>
          <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} doc={p} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} href={(n) => `/projects?page=${n}`} />
        </>
      )}
    </div>
  );
}
