import { getCollection } from "@/lib/content";
import { ProjectCard } from "@/components/Cards";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const metadata = { title: "作品集" };

export default function ProjectsPage() {
  const projects = getCollection("projects");

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title="作品集"
        description="不只要说做了什么，还要说清楚遇到什么问题、怎么想的、我负责哪部分。"
      />
      {projects.length === 0 ? (
        <EmptyState>还没添加作品。</EmptyState>
      ) : (
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} doc={p} />
          ))}
        </div>
      )}
    </div>
  );
}
