"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { GlassCard } from "./GlassCard";

/** giscus 评论：加载失败降级为提示文案，正文不受影响 */
export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!site.giscus.repo || !site.giscus.repoId) {
      setStatus("error");
      return;
    }
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.setAttribute("data-repo", site.giscus.repo);
    script.setAttribute("data-repo-id", site.giscus.repoId);
    script.setAttribute("data-category", site.giscus.category);
    script.setAttribute("data-category-id", site.giscus.categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.onload = () => setStatus("ready");
    script.onerror = () => setStatus("error");
    ref.current?.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <section aria-label="评论" className="mt-16">
      <h2 className="mb-4 text-lg font-semibold">评论</h2>
      <GlassCard className="p-5">
        <div ref={ref} className="giscus" />
        {status === "loading" && (
          <div className="space-y-3" aria-hidden>
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-strong" />
            <div className="h-20 animate-pulse rounded bg-surface-strong" />
          </div>
        )}
        {status === "error" && (
          <p className="text-sm text-text-muted">
            评论服务暂不可用。若需要留言可直接通过邮箱联系我。
          </p>
        )}
      </GlassCard>
    </section>
  );
}
