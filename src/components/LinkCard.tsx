import { ArrowUpRight } from "lucide-react";

/** 域名首字母色块：固定调色板，避免 Tailwind 扫不到动态类名 */
const TILE = [
  "bg-accent-soft text-accent",
  "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  "bg-violet-500/12 text-violet-700 dark:text-violet-400",
  "bg-rose-500/12 text-rose-700 dark:text-rose-400",
  "bg-cyan-500/12 text-cyan-700 dark:text-cyan-400",
];

function tileOf(host: string) {
  let sum = 0;
  for (let i = 0; i < host.length; i++) sum = (sum + host.charCodeAt(i)) % 997;
  return TILE[sum % TILE.length];
}

/**
 * MDX 链接卡片：`<LinkCard url="https://..." title="…" description="…" />`
 *
 * 不做 iframe 真嵌入，也不在运行时抓 OG 数据：站点标题与描述由作者写 MDX 时顺手给，
 * 没给就只显示域名，避免正文里出现不可控的第三方请求。
 */
export function LinkCard({
  url,
  title,
  description,
}: {
  url: string;
  title?: string;
  description?: string;
}) {
  let host = "";
  let display = url;
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    display = host;
  } catch {
    /* 不是合法 URL 就原样展示，交给浏览器处理 */
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="my-6 flex items-start gap-3 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-strong"
    >
      <span
        aria-hidden
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-control text-base font-semibold uppercase ${tileOf(host || "link")}`}
      >
        {(title || display).slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{title || display}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-text-muted">{description}</span>
        )}
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-text-muted">
          {display}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      </span>
    </a>
  );
}
