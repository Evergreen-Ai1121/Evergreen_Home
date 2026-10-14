import { getCollection, getTags } from "@/lib/content";
import { ProjectCard } from "@/components/Cards";
import { Pagination } from "@/components/Pagination";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { T } from "@/components/LangProvider";
import { TagFilter } from "@/components/TagFilter";

export const metadata = { title: "作品集" };

const PAGE_SIZE = 9;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag, page: raw } = await searchParams;
  const all = getCollection("projects");
  const filtered = tag ? all.filter((d) => d.tags.includes(tag)) : all;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(raw) || 1), totalPages);
  const projects = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const href = (n: number) => {
    const q = new URLSearchParams();
    if (tag) q.set("tag", tag);
    q.set("page", String(n));
    return `/projects?${q}`;
  };

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title={<T k="page.projects" />}
        description={<T k="desc.projects" />}
      />
      <TagFilter basePath="/projects" tags={getTags("projects")} active={tag} />
      {projects.length === 0 ? (
        <EmptyState>还没添加作品。</EmptyState>
      ) : (
        <>
          <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} doc={p} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} href={href} />
        </>
      )}
    </div>
  );
}
