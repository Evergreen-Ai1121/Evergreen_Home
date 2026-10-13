import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  strong = false,
  interactive = false,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-card",
        interactive &&
          "transition-[transform,box-shadow,background-color] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:bg-surface-strong",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
