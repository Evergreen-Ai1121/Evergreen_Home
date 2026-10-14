"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { useLang } from "./LangProvider";

/**
 * 文章底部分享条。
 * URL 在点击时才取 —— 组件是静态预渲染的，提前读 window 会导致水合不一致。
 */
export function ShareBar({ title }: { title: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 非 HTTPS 下剪贴板不可用，静默失败 */
    }
  };

  const open = (target: string) => {
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const btn =
    "inline-flex min-h-11 items-center gap-1.5 rounded-control border border-border bg-surface px-3 text-sm text-text-muted transition-colors hover:text-accent";

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
        <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("action.share")}
      </span>
      <button type="button" onClick={copyLink} className={btn}>
        {copied ? (
          <Check className="h-4 w-4 text-accent" strokeWidth={1.5} />
        ) : (
          <Link2 className="h-4 w-4" strokeWidth={1.5} />
        )}
        {copied ? t("action.copied") : t("action.copyLink")}
      </button>
      <button
        type="button"
        onClick={() =>
          open(
            `https://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`,
          )
        }
        className={btn}
      >
        微博
      </button>
      <button
        type="button"
        onClick={() =>
          open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`,
          )
        }
        className={btn}
      >
        X
      </button>
    </div>
  );
}
