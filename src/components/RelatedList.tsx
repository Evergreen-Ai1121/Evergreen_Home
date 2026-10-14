"use client";

import Link from "next/link";
import type { DocMeta } from "@/lib/content";
import { hrefOf } from "@/lib/doc";
import { GlassCard } from "./GlassCard";
import { useLang } from "./LangProvider";
import type { DictKey } from "@/lib/i18n";

const TYPE_LABEL: Record<DocMeta["type"], DictKey> = {
  posts: "nav.posts",
  notes: "nav.notes",
  projects: "nav.projects",
};

/** 同标签的相关推荐（跨三类内容），没命中时由调用方降级成最新几篇 */
export function RelatedList({ items }: { items: DocMeta[] }) {
  const { t } = useLang();
  if (items.length === 0) return null;
  return (
    <section aria-label="相关推荐" className="mt-12">
      <h2 className="mb-3 text-lg">{t("label.related")}</h2>
      <div className="grid gap-3 tablet:grid-cols-3">
        {items.map((d) => (
          <GlassCard key={`${d.type}-${d.slug}`} interactive>
            <Link href={hrefOf(d)} className="flex h-full flex-col gap-1 p-4">
              <span className="text-xs text-text-muted">
                {t(TYPE_LABEL[d.type])} · {d.date}
              </span>
              <span className="line-clamp-2 text-[15px] font-medium">{d.title}</span>
            </Link>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
