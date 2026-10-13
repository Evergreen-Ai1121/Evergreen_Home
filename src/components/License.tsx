import Link from "next/link";
import { site } from "@/lib/site";

/** 文末版权卡：署名 + 许可协议 + 原文链接 */
export function License({ title, path }: { title: string; path: string }) {
  const url = `${site.url.replace(/\/$/, "")}${path}`;
  return (
    <aside className="mt-12 rounded-card border border-border bg-surface p-5">
      <h2 className="mb-2 text-sm font-medium">版权声明</h2>
      <p className="text-sm text-text-muted">
        本文《{title}》由 {site.author} 创作，署名-非商业性使用-相同方式共享 4.0（
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent"
        >
          CC BY-NC-SA 4.0
        </a>
        ）许可。
      </p>
      <p className="mt-1 text-sm text-text-muted">
        原文链接：
        <Link href={path} className="text-accent">
          {url}
        </Link>
      </p>
    </aside>
  );
}
