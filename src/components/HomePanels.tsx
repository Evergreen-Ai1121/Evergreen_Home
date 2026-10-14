import Link from "next/link";
import { ArrowRight, Github, Mail, Rss, Tag } from "lucide-react";
import { getAllTags } from "@/lib/content";
import { site } from "@/lib/site";
import { GlassCard } from "./GlassCard";
import { T } from "./LangProvider";

const SOCIAL_ICONS = { github: Github, mail: Mail } as const;

/** 首页简介卡：头像字块 + 一句话 + 社交链接与 RSS 入口 */
export function ProfilePanel() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-12 w-12 shrink-0 place-items-center rounded-pill bg-accent-soft text-lg font-semibold text-accent"
        >
          {site.author.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{site.author}</p>
          <p className="truncate text-xs text-text-muted">{site.tagline}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-text-muted">{site.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {site.social.map((s) => {
          const Icon = SOCIAL_ICONS[s.key as keyof typeof SOCIAL_ICONS];
          return (
            <a
              key={s.href}
              href={s.href}
              aria-label={s.label}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noreferrer" : undefined}
              className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-border bg-surface text-text-muted transition-colors hover:text-accent"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </a>
          );
        })}
        <a
          href="/rss.xml"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-control border border-border bg-surface px-3 text-sm text-text-muted transition-colors hover:text-accent"
        >
          <Rss className="h-4 w-4" strokeWidth={1.5} />
          <T k="label.rss" />
        </a>
      </div>
    </GlassCard>
  );
}

/** 高频标签入口，点进去是 /tags/[tag]；右侧留一条回 /tags 的入口 */
export function TagCloudPanel() {
  const tags = getAllTags().slice(0, 8);
  if (tags.length === 0) return null;
  return (
    <GlassCard className="p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-medium">
          <Tag className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
          <T k="label.tags" />
        </h2>
        <Link
          href="/tags"
          className="inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-accent"
        >
          <T k="action.viewAll" />
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tags.map((t) => (
          <li key={t.name}>
            <Link
              href={`/tags/${encodeURIComponent(t.name)}`}
              className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface px-3 py-1 text-xs text-text-muted transition-colors hover:text-accent"
            >
              #{t.name}
              <span className="text-text-muted">{t.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
