import Link from "next/link";
import { ArrowUpRight, Clock, Tag } from "lucide-react";
import type { DocMeta } from "@/lib/content";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import { SafeImage } from "./SafeImage";

export function TagChip({ name, href }: { name: string; href?: string }) {
  const cls =
    "inline-flex items-center gap-1 rounded-pill border border-border bg-surface px-2.5 py-0.5 text-xs text-text-muted";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:text-accent")}>
      #{name}
    </Link>
  ) : (
    <span className={cls}>#{name}</span>
  );
}

/** 置顶 / 自定义徽标 */
export function BadgeChip({ badge }: { badge?: string }) {
  if (!badge) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2.5 py-0.5 text-xs text-accent">
      {badge === "Pin" ? "置顶" : badge}
    </span>
  );
}

/** 文章卡片：封面 + 摘要 + 阅读时长 */
export function ContentCard({ doc }: { doc: DocMeta }) {
  return (
    <GlassCard interactive className="overflow-hidden">
      <Link href={`/posts/${doc.slug}`} className="block">
        {doc.cover && (
          <div className="aspect-[16/9] w-full overflow-hidden border-b border-border">
            <SafeImage src={doc.cover} alt="" ratio="16 / 9" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <time dateTime={doc.date}>{doc.date}</time>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              {doc.readingTime} 分钟
            </span>
            <BadgeChip badge={doc.badge} />
          </div>
          <h3 className="mt-2 text-[17px] font-semibold">{doc.title}</h3>
          {doc.summary && (
            <p className="mt-2 line-clamp-2 text-sm text-text-muted">{doc.summary}</p>
          )}
          {doc.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {doc.tags.map((t) => (
                <TagChip key={t} name={t} />
              ))}
            </div>
          )}
        </div>
      </Link>
    </GlassCard>
  );
}

/** 笔记列表项：分类 + 标签 */
export function NoteItem({ doc }: { doc: DocMeta }) {
  return (
    <GlassCard interactive>
      <Link href={`/notes/${doc.slug}`} className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {doc.category && (
            <span className="rounded-pill bg-accent-soft px-2.5 py-0.5 text-accent">
              {doc.category}
            </span>
          )}
          <time dateTime={doc.date}>{doc.date}</time>
          <BadgeChip badge={doc.badge} />
        </div>
        <h3 className="text-[17px] font-semibold">{doc.title}</h3>
        {doc.summary && (
          <p className="line-clamp-2 text-sm text-text-muted">{doc.summary}</p>
        )}
        {doc.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
            {doc.tags.map((t) => (
              <TagChip key={t} name={t} />
            ))}
          </div>
        )}
      </Link>
    </GlassCard>
  );
}

/** 作品卡片：截图 + 技术栈 */
export function ProjectCard({ doc }: { doc: DocMeta }) {
  return (
    <GlassCard interactive className="overflow-hidden">
      <Link href={`/projects/${doc.slug}`} className="block">
        {doc.cover && (
          <div className="aspect-[16/9] w-full overflow-hidden border-b border-border">
            <SafeImage src={doc.cover} alt={`${doc.title} 封面`} ratio="16 / 9" />
          </div>
        )}
        <div className="p-5">
          <div className="mb-2">
            <BadgeChip badge={doc.badge} />
          </div>
          <h3 className="text-[17px] font-semibold">{doc.title}</h3>
          {doc.summary && (
            <p className="mt-2 line-clamp-3 text-sm text-text-muted">{doc.summary}</p>
          )}
          {doc.stack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {doc.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-pill border border-border px-2.5 py-0.5 text-xs text-text-muted"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {doc.links.length > 0 && (
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
              {doc.links[0].label}
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </span>
          )}
        </div>
      </Link>
    </GlassCard>
  );
}
