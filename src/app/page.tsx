import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCollection } from "@/lib/content";
import { listMoments } from "@/lib/moments";
import { site } from "@/lib/site";
import { ContentCard, ProjectCard } from "@/components/Cards";
import { MomentItem } from "@/components/MomentItem";
import { EmptyState } from "@/components/PageHeader";
import { T } from "@/components/LangProvider";

export const revalidate = 300;

export default async function HomePage() {
  const posts = getCollection("posts").slice(0, site.homeFeed.posts);
  const projects = getCollection("projects")
    .filter((p) => p.featured)
    .slice(0, site.homeFeed.projects);
  const moments = (await listMoments(site.homeFeed.moments)).slice(0, site.homeFeed.moments);

  return (
    <div className="mx-auto max-w-wide">
      {/* Hero */}
      <section className="py-8 tablet:py-16 desktop:py-20">
        <p className="text-sm text-text-muted">{site.tagline}</p>
        <h1 className="mt-3 text-balance text-[clamp(32px,6vw,56px)] font-semibold leading-[1.15]">
          把笔记、想法和作品，
          <br className="hidden tablet:block" />
          放在同一个自己能掌控的地方。
        </h1>
        <p className="mt-5 max-w-reading text-[15px] text-text-muted">
          我是 {site.author}。这里记录我整理过的学习笔记、写完的文章、随手发的生活瞬间，
          以及几个能说明我能做什么的项目。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/notes"
            className="rounded-control border border-border bg-surface px-4 py-2 text-sm transition-colors hover:bg-surface-strong"
          >
            看笔记
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-control bg-accent px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
          >
            作品集
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* 最新文章 */}
      <section className="mt-12" aria-labelledby="home-posts">
        <SectionTitle id="home-posts" k="home.latestPosts" href="/posts" />
        {posts.length === 0 ? (
          <EmptyState>
            <T k="empty.posts" />
          </EmptyState>
        ) : (
          <div className="grid gap-4 tablet:grid-cols-2">
            {posts.map((p) => (
              <ContentCard key={p.slug} doc={p} />
            ))}
          </div>
        )}
      </section>

      {/* 最新说说 */}
      <section className="mt-12" aria-labelledby="home-moments">
        <SectionTitle id="home-moments" k="home.latestMoments" href="/moments" />
        {moments.length === 0 ? (
          <EmptyState>
            <T k="empty.moments" />
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {moments.map((m) => (
              <MomentItem key={m.id} moment={m} />
            ))}
          </div>
        )}
      </section>

      {/* 精选作品 */}
      <section className="mt-12" aria-labelledby="home-projects">
        <SectionTitle id="home-projects" k="home.featuredProjects" href="/projects" />
        {projects.length === 0 ? (
          <EmptyState>
            <T k="empty.projects" />
          </EmptyState>
        ) : (
          <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} doc={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionTitle({
  id,
  k,
  href,
}: {
  id: string;
  k: Parameters<typeof T>[0]["k"];
  href: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 id={id} className="text-lg font-semibold">
        <T k={k} />
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-accent"
      >
        <T k="action.viewAll" />
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
