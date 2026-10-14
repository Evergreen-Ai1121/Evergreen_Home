"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DocMeta } from "@/lib/content";
import { hrefOf } from "@/lib/doc";
import type { DictKey } from "@/lib/i18n";
import { GlassCard } from "./GlassCard";
import { useLang } from "./LangProvider";

const TYPE_LABEL: Record<DocMeta["type"], DictKey> = {
  posts: "nav.posts",
  notes: "nav.notes",
  projects: "nav.projects",
};

function Card({
  doc,
  dir,
  label,
  typeLabel,
}: {
  doc: DocMeta;
  dir: "prev" | "next";
  label: string;
  typeLabel: string;
}) {
  return (
    <GlassCard interactive className="flex-1">
      <a href={hrefOf(doc)} className="flex h-full flex-col gap-1 p-4">
        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
          {dir === "prev" ? (
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
          {label}
        </span>
        <span className="line-clamp-2 text-[15px] font-medium">{doc.title}</span>
        <span className="mt-auto text-xs text-text-muted">
          {typeLabel} · {doc.date}
        </span>
      </a>
    </GlassCard>
  );
}

/** 到头的那一侧隐藏，另一侧撑满；窄屏上下堆叠 */
export function PrevNext({ prev, next }: { prev: DocMeta | null; next: DocMeta | null }) {
  const { t } = useLang();
  if (!prev && !next) return null;

  return (
    <nav aria-label="上一篇/下一篇" className="mt-12 flex flex-col gap-3 tablet:flex-row">
      {prev ? (
        <Card
          doc={prev}
          dir="prev"
          label={t("label.prevPost")}
          typeLabel={t(TYPE_LABEL[prev.type])}
        />
      ) : (
        <span className="hidden flex-1 tablet:block" />
      )}
      {next && (
        <Card
          doc={next}
          dir="next"
          label={t("label.nextPost")}
          typeLabel={t(TYPE_LABEL[next.type])}
        />
      )}
    </nav>
  );
}
