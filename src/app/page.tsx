import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCollection } from "@/lib/content";
import { listMoments } from "@/lib/moments";
import { site } from "@/lib/site";
import { ContentCard, ProjectCard } from "@/components/Cards";
import { MomentItem } from "@/components/MomentItem";
import { EmptyState } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SmoothScroll } from "@/components/SmoothScroll";
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
      <SmoothScroll />
      {/* Hero：加载即播的入场动画。h1 用 hero-rise 只位移不淡入，避免推迟 LCP */}
      <section className="py-8 tablet:py-16 desktop:py-20">
        <p className="hero-fade text-sm text-text-muted" style={{ animationDelay: "0ms" }}>
          {site.tagline}
        </p>
        <h1
          className="hero-rise mt-3 text-balance text-[clamp(32px,6vw,56px)] leading-[1.15]"
          style={{ animationDelay: "80ms" }}
        >
          把笔记、想法和作品，
          <br className="hidden tablet:block" />
          放在同一个自己能掌控的地方。
        </h1>
        {/* 这段是 LCP 候选（面积比 h1 大），所以用 hero-rise 只位移不淡入：
            一旦淡入就要等动画跑完才算"已绘制"，LCP 会被推迟约 1s */}
        <p
          className="hero-rise mt-5 max-w-reading text-[15px] text-text-muted"
          style={{ animationDelay: "160ms" }}
        >
          我是 {site.author}。这里记录我整理过的学习笔记、写完的文章、随手发的生活瞬间，
          以及几个能说明我能做什么的项目。
        </p>
        <div
          className="hero-fade mt-8 flex flex-wrap gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/notes"
            className="rounded-control border border-border bg-surface px-4 py-2 text-sm transition-colors hover:bg-surface-strong"
          >
            看笔记
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-control bg-accent px-4 py-2 text-sm text-white shadow-[0_8px_24px_-12px_rgba(88,60,180,0.6)] transition-[transform,box-shadow] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-0.5"
          >
            作品集
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* 最新文章 */}
      <section className="mt-12" aria-labelledby="home-posts">
        <Reveal>
          <SectionTitle id="home-posts" k="home.latestPosts" href="/posts" />
        </Reveal>
        {posts.length === 0 ? (
          <EmptyState>
            <T k="empty.posts" />
          </EmptyState>
        ) : (
          <div className="grid gap-4 tablet:grid-cols-2">
            {posts.map((p, i) => (
              /* 玻璃卡片必须用 rise（只位移不淡入）：opacity 动画会稀释玻璃渲染，
                 弹出中偏浅、停稳变深，出现色差跳变（Evergreen 2026-10-15 定） */
              <Reveal key={p.slug} index={i} variant="rise" className="h-full [&>*]:h-full">
                <ContentCard doc={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* 最新说说 */}
      <section className="mt-12" aria-labelledby="home-moments">
        <Reveal>
          <SectionTitle id="home-moments" k="home.latestMoments" href="/moments" />
        </Reveal>
        {moments.length === 0 ? (
          <EmptyState>
            <T k="empty.moments" />
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {moments.map((m, i) => (
              <Reveal key={m.id} index={i} variant="rise">
                <MomentItem moment={m} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* 精选作品 */}
      <section className="mt-12" aria-labelledby="home-projects">
        <Reveal>
          <SectionTitle id="home-projects" k="home.featuredProjects" href="/projects" />
        </Reveal>
        {projects.length === 0 ? (
          <EmptyState>
            <T k="empty.projects" />
          </EmptyState>
        ) : (
          <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.slug} index={i} variant="rise" className="h-full [&>*]:h-full">
                <ProjectCard doc={p} />
              </Reveal>
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
      <h2 id={id} className="text-lg">
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
