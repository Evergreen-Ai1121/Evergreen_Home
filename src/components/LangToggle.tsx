"use client";

import { Globe } from "lucide-react";
import { LANG_LABEL, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLang } from "./LangProvider";

/** 中 ⇄ 英：点一下直接切，不做下拉（只有两个选项） */
export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const next: Lang = lang === "zh" ? "en" : "zh";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t("action.lang") + ": " + LANG_LABEL[next]}
      title={t("action.lang") + ": " + LANG_LABEL[next]}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-control border border-border",
        "bg-surface text-xs font-medium text-text-muted backdrop-blur transition-colors duration-150",
        "hover:text-text hover:bg-surface-strong",
        className,
      )}
    >
      <span className="flex items-center gap-0.5">
        <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
        {LANG_LABEL[next]}
      </span>
    </button>
  );
}
