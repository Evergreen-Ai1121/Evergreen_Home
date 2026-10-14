import { AlertTriangle, Info, Lightbulb, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutType = "note" | "tip" | "warning" | "danger";

/** 左色条 + 浅底 + 图标，四档语义色（深色模式下同步调过对比度） */
const STYLES: Record<
  CalloutType,
  { wrap: string; icon: string; Icon: typeof Info }
> = {
  note: {
    wrap: "border-l-accent bg-accent-soft",
    icon: "text-accent",
    Icon: Info,
  },
  tip: {
    wrap: "border-l-emerald-500 bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: Lightbulb,
  },
  warning: {
    wrap: "border-l-amber-500 bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: AlertTriangle,
  },
  danger: {
    wrap: "border-l-red-500 bg-red-500/10",
    icon: "text-red-600 dark:text-red-400",
    Icon: OctagonAlert,
  },
};

/**
 * MDX 里的提示框：`<Callout type="tip">…</Callout>`
 * 默认 `note`；传错 type 时退化为 note，而不是崩掉整篇渲染。
 */
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const s = STYLES[type] ?? STYLES.note;
  return (
    <aside
      className={cn("my-6 rounded-card border border-border border-l-4 px-4 py-3", s.wrap)}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <s.Icon className={cn("h-4 w-4 shrink-0", s.icon)} strokeWidth={1.5} />
        {title}
      </p>
      <div className="mt-1.5 text-[15px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
