"use client";

import { Clock, FileText, History } from "lucide-react";
import type { DocMeta } from "@/lib/content";
import { isUpdated } from "@/lib/doc";
import { formatDate } from "@/lib/i18n";
import { useLang } from "./LangProvider";

/** 详情页顶部元信息：日期 / 更新时间 / 阅读时长 / 字数，额外的分类徽标由 children 插进来 */
export function DocMetaRow({ doc, children }: { doc: DocMeta; children?: React.ReactNode }) {
  const { t, lang } = useLang();

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-text-muted">
      {children}
      <time dateTime={doc.date}>{formatDate(doc.date, lang)}</time>
      {isUpdated(doc) && (
        <span className="inline-flex items-center gap-1">
          <History className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t("label.updatedAt")} {formatDate(doc.updated!, lang)}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
        {doc.readingTime} {t("label.minRead")}
      </span>
      <span className="inline-flex items-center gap-1">
        <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("label.words")} {doc.wordCount} {t("label.wordsUnit")}
      </span>
    </div>
  );
}
